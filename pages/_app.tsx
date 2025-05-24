// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Layout } from '@/components/Layout';
import { AnimatePresence } from 'framer-motion';

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Layout key={router.route}>
        <Component {...pageProps} />
      </Layout>
    </AnimatePresence>
  );
}
