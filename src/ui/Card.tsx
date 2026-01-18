import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = "", onClick }: CardProps) => {
  return (
    <div
      className={`bg-card rounded-soft-lg shadow-soft border border-border card-hover ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className = "" }: CardTitleProps) => {
  return (
    <h2 className={`text-2xl font-bold text-text ${className}`}>{children}</h2>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = "" }: CardContentProps) => {
  return <div className={className}>{children}</div>;
};
