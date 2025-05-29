// stockweather-frontend/src/pages/404.tsx
import React from 'react';
import Link from 'next/link'; // Next.js Link 컴포넌트
import Head from 'next/head';

function NotFoundPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <Head>
        <title>페이지를 찾을 수 없습니다 - StockWeather</title>
      </Head>
      <h1 style={{ fontSize: '48px', color: '#dc3545', margin: '20px 0' }}>404</h1>
      <h2 style={{ fontSize: '28px', color: '#333' }}>페이지를 찾을 수 없습니다.</h2>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
        요청하신 페이지가 존재하지 않거나, URL이 변경되었습니다.
      </p>
      <Link
        href="/login" // 로그인 페이지로 돌아가는 링크
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          transition: 'background-color 0.3s ease',
        }}
      >
        로그인 페이지로 돌아가기
      </Link>
    </div>
  );
}

export default NotFoundPage;