import { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { Swap, Check, CurrencyDollar, TrendUp, ClockCounterClockwise, Sparkle, Trash } from 'phosphor-react';

type LaundryEntry = {
  id: string;
  dirtyAmount: number;
  percentage: number;
  cleanAmount: number; // Votre gain (argent propre obtenu)
  forPatron: boolean;
  createdAt: any;
};

export const LaundryMalandrPage = () => {
  const [dirtyAmount, setDirtyAmount] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(20);
  const [forPatron, setForPatron] = useState<boolean>(false);
  const [history, setHistory] = useState<LaundryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const historyRef = collection(db, 'users', user.uid, 'laundryHistory');
      // Simplified query - no need for space filter since it's already under user's collection
      const historyQuery = query(
        historyRef,
        orderBy('createdAt', 'desc')
      );
      const historySnapshot = await getDocs(historyQuery);
      const historyData: LaundryEntry[] = [];
      historySnapshot.forEach((doc) => {
        historyData.push({ id: doc.id, ...doc.data() } as LaundryEntry);
      });
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading laundry history:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateClean = (dirty: number, percent: number) => {
    // L'argent propre obtenu = votre gain = le pourcentage du sale
    return dirty * percent / 100;
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !dirtyAmount || parseFloat(dirtyAmount) <= 0) return;

      const dirty = parseFloat(dirtyAmount);
      const clean = calculateClean(dirty, percentage); // Votre gain

      const entryData = {
        userId: user.uid,
        space: 'malandrinerie',
        dirtyAmount: dirty,
        percentage,
        cleanAmount: clean, // Votre gain (argent propre obtenu)
        forPatron,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'users', user.uid, 'laundryHistory'), entryData);

      // Reset form
      setDirtyAmount('');
      setForPatron(false);

      // Reload history
      loadHistory();
    } catch (error) {
      console.error('Error saving laundry entry:', error);
    }
  };

  const getTotalDirty = () => {
    return history.reduce((sum, entry) => sum + entry.dirtyAmount, 0);
  };

  const getTotalClean = () => {
    // Total de l'argent propre obtenu (vos gains totaux)
    return history.reduce((sum, entry) => sum + entry.cleanAmount, 0);
  };

  const getOwedToPatron = () => {
    // 50% de l'argent sale total est dû au patron
    return getTotalDirty() * 0.5;
  };

  const getNetBalance = () => {
    // Vos gains - ce que vous devez au patron
    return getTotalClean() - getOwedToPatron();
  };

  const handleDelete = async (entryId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
        return;
      }

      await deleteDoc(doc(db, 'users', user.uid, 'laundryHistory', entryId));

      // Reload history
      loadHistory();
    } catch (error) {
      console.error('Error deleting laundry entry:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '—';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-text-muted">Chargement...</p>
      </div>
    );
  }

  const previewClean = dirtyAmount && parseFloat(dirtyAmount) > 0
    ? calculateClean(parseFloat(dirtyAmount), percentage)
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Swap size={32} weight="duotone" style={{ color: '#F4A583' }} />
        <h1 className="text-3xl font-bold" style={{ color: '#5C4A3A' }}>Blanchisseuse</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Form (2 columns) */}
        <div className="lg:col-span-2 space-y-4">
          {/* New laundry form */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #EADFD8',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <h2 className="font-bold mb-3" style={{ color: '#5C4A3A', fontSize: '16px' }}>
              Nouveau blanchiment
            </h2>

            {/* Dirty amount input */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-1" style={{ color: '#A08876' }}>
                Argent sale
              </label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={dirtyAmount}
                onChange={(e) => setDirtyAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-soft text-lg font-bold transition-all"
                style={{
                  border: '1px solid #EADFD8',
                  backgroundColor: '#FFFBF8',
                  color: '#5C4A3A'
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #F4A583';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => e.target.style.border = '1px solid #EADFD8'}
              />
            </div>

            {/* Percentage selector */}
            <div className="mb-3">
              <label className="block text-xs font-semibold mb-2" style={{ color: '#A08876' }}>
                Pourcentage de commission
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPercentage(20)}
                  className="flex-1 px-4 py-2 rounded-soft text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: percentage === 20 ? '#F4A583' : '#FFF6F1',
                    color: percentage === 20 ? '#FFFFFF' : '#8B7355',
                    border: percentage === 20 ? '1px solid #F4A583' : '1px solid #EADFD8'
                  }}
                  onMouseEnter={(e) => {
                    if (percentage !== 20) {
                      e.currentTarget.style.backgroundColor = '#FFE8D6';
                      e.currentTarget.style.borderColor = '#F4A583';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (percentage !== 20) {
                      e.currentTarget.style.backgroundColor = '#FFF6F1';
                      e.currentTarget.style.borderColor = '#EADFD8';
                    }
                  }}
                >
                  20%
                </button>
                <button
                  onClick={() => setPercentage(30)}
                  className="flex-1 px-4 py-2 rounded-soft text-sm font-semibold transition-all"
                  style={{
                    backgroundColor: percentage === 30 ? '#F4A583' : '#FFF6F1',
                    color: percentage === 30 ? '#FFFFFF' : '#8B7355',
                    border: percentage === 30 ? '1px solid #F4A583' : '1px solid #EADFD8'
                  }}
                  onMouseEnter={(e) => {
                    if (percentage !== 30) {
                      e.currentTarget.style.backgroundColor = '#FFE8D6';
                      e.currentTarget.style.borderColor = '#F4A583';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (percentage !== 30) {
                      e.currentTarget.style.backgroundColor = '#FFF6F1';
                      e.currentTarget.style.borderColor = '#EADFD8';
                    }
                  }}
                >
                  30%
                </button>
              </div>
            </div>

            {/* For patron checkbox */}
            <div className="mb-4">
              <label
                className="flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: forPatron ? '#FFF0E6' : 'transparent',
                  padding: '8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="checkbox"
                  checked={forPatron}
                  onChange={(e) => setForPatron(e.target.checked)}
                  className="w-4 h-4"
                  style={{ accentColor: '#F4A583' }}
                />
                <span className="text-sm font-medium" style={{ color: '#5C4A3A' }}>
                  Pour le patron
                </span>
                <Sparkle size={16} weight="fill" style={{ color: '#D4846A' }} />
              </label>
            </div>

            {/* Preview */}
            {dirtyAmount && parseFloat(dirtyAmount) > 0 && (
              <div
                className="mb-4 p-3 rounded"
                style={{
                  backgroundColor: '#D9EDD5',
                  border: '1px solid #C8E0C4'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: '#5C7A58' }}>
                    Argent sale
                  </span>
                  <span className="font-bold" style={{ color: '#5C4A3A' }}>
                    {parseFloat(dirtyAmount).toLocaleString()}$
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: '#5C7A58' }}>
                    Taux de blanchiment
                  </span>
                  <span className="font-bold" style={{ color: '#8B7355' }}>
                    {percentage}%
                  </span>
                </div>
                <div
                  className="flex items-center justify-between pt-2"
                  style={{ borderTop: '1px solid #C8E0C4' }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#5C7A58' }}>
                    Argent propre obtenu
                  </span>
                  <span className="text-2xl font-bold" style={{ color: '#4A6B47' }}>
                    {(parseFloat(dirtyAmount) * percentage / 100).toLocaleString()}$
                  </span>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!dirtyAmount || parseFloat(dirtyAmount) <= 0}
              className="w-full px-4 py-2 rounded-soft text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-30"
              style={{
                backgroundColor: '#D9EDD5',
                color: '#6B9D66',
                border: '1px solid #C8E0C4'
              }}
              onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#C8E0C4')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#D9EDD5'}
            >
              <Check size={16} weight="bold" />
              Enregistrer le blanchiment
            </button>
          </div>

          {/* History list */}
          {history.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm" style={{ color: '#8B7355' }}>
                  Historique ({history.length})
                </h2>
                {history.length > 4 && (
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-xs font-semibold transition-colors"
                    style={{ color: '#F4A583' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#D4846A'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F4A583'}
                  >
                    {showAllHistory ? 'Voir moins' : 'Voir tout'}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {(showAllHistory ? history : history.slice(0, 4)).map(entry => (
                  <div
                    key={entry.id}
                    className="p-3 rounded"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EADFD8'
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Swap size={16} weight="fill" style={{ color: '#F4A583' }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#5C4A3A' }}>
                            {entry.percentage}% de commission
                          </p>
                          <p className="text-xs" style={{ color: '#A08876' }}>
                            {formatDate(entry.createdAt)}
                          </p>
                        </div>
                        {entry.forPatron && (
                          <span
                            className="px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                            style={{ backgroundColor: '#FFF0E6', color: '#5C4A3A' }}
                          >
                            <Sparkle size={10} weight="fill" />
                            Patron
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1 rounded hover:bg-red-50 transition-colors"
                        title="Supprimer"
                        style={{ color: '#D4846A' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFE8E0'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash size={16} weight="bold" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <p className="text-xs" style={{ color: '#A08876' }}>Argent sale</p>
                        <p className="font-bold" style={{ color: '#D4846A' }}>
                          {entry.dirtyAmount.toLocaleString()}$
                        </p>
                      </div>
                      <div>
                        <p className="text-xs" style={{ color: '#A08876' }}>Argent propre obtenu</p>
                        <p className="font-bold" style={{ color: '#4A6B47' }}>
                          {entry.cleanAmount.toLocaleString()}$
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Summary (1 column) */}
        <div>
          <div
            className="sticky top-4"
            style={{
              backgroundColor: '#F9FCF8',
              border: '1px solid #D9EDD5',
              borderRadius: '8px',
              padding: '16px'
            }}
          >
            <h2 className="font-bold mb-3 text-sm" style={{ color: '#5C7A58' }}>
              Totaux cumulés
            </h2>

            <div className="space-y-3">
              {/* Total dirty */}
              <div
                className="p-3 rounded"
                style={{
                  backgroundColor: '#FFE8E0',
                  border: '1px solid #FFD4C4'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CurrencyDollar size={18} weight="duotone" style={{ color: '#D4846A' }} />
                  <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
                    Argent sale total
                  </p>
                </div>
                <p className="text-xl font-bold" style={{ color: '#D4846A' }}>
                  {getTotalDirty().toLocaleString()}$
                </p>
              </div>

              {/* Total clean = Your total gains */}
              <div
                className="p-3 rounded"
                style={{
                  backgroundColor: '#D9EDD5',
                  border: '1px solid #C8E0C4'
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkle size={18} weight="fill" style={{ color: '#4A6B47' }} />
                  <p className="text-xs font-semibold" style={{ color: '#5C7A58' }}>
                    Argent propre obtenu
                  </p>
                </div>
                <p className="text-2xl font-bold" style={{ color: '#4A6B47' }}>
                  {getTotalClean().toLocaleString()}$
                </p>
              </div>

              {/* Operations count */}
              <div className="text-center pt-3 pb-3" style={{ borderTop: '1px solid #D9EDD5', borderBottom: '1px solid #D9EDD5' }}>
                <p className="text-xs mb-1" style={{ color: '#A08876' }}>
                  Opérations effectuées
                </p>
                <p className="text-lg font-bold" style={{ color: '#5C4A3A' }}>
                  {history.length}
                </p>
              </div>

              {/* Balance section */}
              {history.length > 0 && (
                <>
                  <div className="pt-3">
                    <h3 className="text-xs font-bold mb-2" style={{ color: '#8B7355' }}>
                      Balance
                    </h3>
                  </div>

                  {/* Owed to patron */}
                  <div
                    className="p-3 rounded"
                    style={{
                      backgroundColor: '#FFF0E6',
                      border: '1px solid #EADFD8'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkle size={16} weight="fill" style={{ color: '#D4846A' }} />
                      <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
                        Dû au patron (50%)
                      </p>
                    </div>
                    <p className="text-lg font-bold" style={{ color: '#D4846A' }}>
                      -{getOwedToPatron().toLocaleString()}$
                    </p>
                  </div>

                  {/* Net balance */}
                  <div
                    className="p-3 rounded"
                    style={{
                      backgroundColor: getNetBalance() >= 0 ? '#D9EDD5' : '#FFE8E0',
                      border: getNetBalance() >= 0 ? '1px solid #C8E0C4' : '1px solid #FFD4C4'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendUp size={16} weight="bold" style={{ color: getNetBalance() >= 0 ? '#4A6B47' : '#D4846A' }} />
                      <p className="text-xs font-semibold" style={{ color: '#A08876' }}>
                        Balance nette
                      </p>
                    </div>
                    <p className="text-xl font-bold" style={{ color: getNetBalance() >= 0 ? '#4A6B47' : '#D4846A' }}>
                      {getNetBalance() >= 0 ? '+' : ''}{getNetBalance().toLocaleString()}$
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {history.length === 0 && (
        <div
          className="text-center py-12 rounded"
          style={{
            backgroundColor: '#FFFBF8',
            border: '1px solid #EADFD8'
          }}
        >
          <ClockCounterClockwise size={48} weight="duotone" style={{ color: '#D4A88F', margin: '0 auto 16px' }} />
          <p className="font-semibold mb-2" style={{ color: '#5C4A3A' }}>
            Aucune opération
          </p>
          <p className="text-sm" style={{ color: '#A08876' }}>
            Les blanchiments apparaîtront ici
          </p>
        </div>
      )}
    </div>
  );
};
