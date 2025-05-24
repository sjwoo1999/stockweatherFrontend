// components/Headline.tsx
export const Headline = ({ children }: { children: React.ReactNode }) => (
    <h1 className="text-2xl font-heading font-bold text-brand-dark mb-4 tracking-tight leading-tight">
      {children}
    </h1>
  );
  