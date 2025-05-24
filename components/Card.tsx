// components/Card.tsx
interface CardProps {
    title: string;
    description: string;
    footer?: string;
  }
  
  export const Card = ({ title, description, footer }: CardProps) => (
    <div className="bg-surface-subtle rounded-lg p-4 shadow-card space-y-2">
      <div className="font-bold text-sm">{title}</div>
      <div className="text-sm text-text-muted">{description}</div>
      {footer && <div className="text-xs text-gray-400">{footer}</div>}
    </div>
  );
  