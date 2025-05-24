// components/Layout.tsx
import { ReactNode } from 'react';

export const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-brand-light">
      <div className="w-[393px] h-[852px] bg-white relative overflow-hidden shadow-md">
        {children}
      </div>
    </div>
  );
};
