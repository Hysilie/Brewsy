import { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, CaretDown } from 'phosphor-react';

type Option = {
  value: string;
  label: string;
  subtitle?: string;
  icon?: React.ComponentType<any>;
};

type SearchSelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
};

export const SearchSelect = ({ options, value, onChange, placeholder = 'Rechercher...', emptyMessage = 'Aucun résultat' }: SearchSelectProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter(opt => {
    const query = searchQuery.toLowerCase();
    return (
      opt.label.toLowerCase().includes(query) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(query))
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].value);
          setIsOpen(false);
          setSearchQuery('');
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Input */}
      <div
        className="relative cursor-pointer"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        }}
      >
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-soft transition-all"
          style={{
            border: isOpen ? '1px solid #F4A583' : '1px solid #EADFD8',
            backgroundColor: '#FFFFFF',
          }}
        >
          {isOpen ? (
            <>
              <MagnifyingGlass size={16} style={{ color: '#A08876' }} />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="flex-1 text-sm outline-none"
                style={{ color: '#5C4A3A', backgroundColor: 'transparent' }}
              />
            </>
          ) : (
            <>
              {selectedOption ? (
                <div className="flex items-center gap-2 flex-1">
                  {selectedOption.icon && <selectedOption.icon size={18} weight="duotone" style={{ color: '#F4A583' }} />}
                  <div className="flex-1">
                    <span className="text-sm" style={{ color: '#5C4A3A' }}>
                      {selectedOption.label}
                    </span>
                    {selectedOption.subtitle && (
                      <span className="text-xs ml-2" style={{ color: '#A08876' }}>
                        {selectedOption.subtitle}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <span className="text-sm flex-1" style={{ color: '#A08876' }}>
                  {placeholder}
                </span>
              )}
              <CaretDown size={16} style={{ color: '#A08876' }} />
            </>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 rounded-soft shadow-lg overflow-hidden"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EADFD8',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm" style={{ color: '#A08876' }}>
              {emptyMessage}
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className="px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: index === highlightedIndex ? '#FFF6F1' : 'transparent',
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handleSelect(option.value)}
                >
                  <div className="flex items-center gap-2">
                    {Icon && <Icon size={18} weight="duotone" style={{ color: '#F4A583' }} />}
                    <div className="flex-1">
                      <div className="text-sm" style={{ color: '#5C4A3A' }}>
                        {option.label}
                      </div>
                      {option.subtitle && (
                        <div className="text-xs" style={{ color: '#A08876' }}>
                          {option.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
