// stockweather-frontend/src/pages/_app.tsx
import React from 'react';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import ProtectedRoute from '../components/ProtectedRoute';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const publicPaths = ['/login', '/login-success'];
  const isPublicPath = publicPaths.includes(router.pathname);

  return (
    <>
      {isPublicPath ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <Component {...pageProps} />
        </ProtectedRoute>
      )}
    </>
  );
}

export default MyApp;