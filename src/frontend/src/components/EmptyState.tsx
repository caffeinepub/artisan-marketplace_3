interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <img 
        src="/assets/generated/empty-marketplace.dim_400x300.png" 
        alt="Empty state" 
        className="w-64 h-48 object-contain mb-6 opacity-60"
      />
      <h3 className="font-serif text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
