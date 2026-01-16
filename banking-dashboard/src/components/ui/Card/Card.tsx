import React, { ReactNode } from 'react';
import './Card.css';

export type CardVariant = 'default' | 'elevated' | 'accent';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
}

export default function Card({
  variant = 'default',
  className = '',
  children,
}: CardProps): React.ReactElement {
  const classes = [
    'ui-card',
    `ui-card--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return <div className={classes}>{children}</div>;
}

interface CardHeaderProps {
  title: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, action, className = '' }: CardHeaderProps): React.ReactElement {
  return (
    <div className={`ui-card__header ${className}`}>
      <h3 className="ui-card__title">{title}</h3>
      {action && <div className="ui-card__action">{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps): React.ReactElement {
  return <div className={`ui-card__content ${className}`}>{children}</div>;
}
