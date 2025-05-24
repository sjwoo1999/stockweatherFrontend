import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';

const Summary: NextPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="h-full w-full bg-gradient-to-b from-sky-200 to-blue-300 flex flex-col justify-center items-center text-center px-6 font-body">
        <h1 className="text-2xl font-extrabold text-white drop-shadow mb-2">2025년 xx월 xx일</h1>
        <p className="text-lg font-semibold text-white drop-shadow mb-6">사용자님의 날씨는..</p>
        <div className="text-white drop-shadow text-base space-y-2">
          <p>포트폴리오 X</p>
          <p>내가 관심 있는 종목</p>
          <p>장기투자 할 종목에 대해서</p>
        </div>
        <div className="mt-10">
          <Button onClick={() => router.push('/detail')} variant="ghost">
            상세 정보 확인하기
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Summary;
