import { useRouter } from 'next/router';

export default function Summary() {
  const router = useRouter();

  const handleDetail = () => {
    router.push('/detail');
  };

  return (
    <div className="min-h-screen bg-[#CDEFFF] flex items-center justify-center">
      <div className="w-[393px] h-[852px] bg-[#CDEFFF] flex flex-col items-center justify-center p-6 text-white text-center">
        <h2 className="text-xl text-black font-bold mb-2">2025년 05월 24일</h2>
        <p className="mb-4 text-black text-sm">오늘은 당신의 투자에 긍정적인 바람이 불고 있어요.</p>
        <ul className="text-sm space-y-2 mb-6">
          <li className="text-black">✅ 삼성전자: AI 메모리 수요 증가</li>
          <li className="text-black">📊 네이버: 커머스+콘텐츠 동시 성장</li>
          <li className="text-black">⚡ 엔비디아: AI 반도체 호조세 지속</li>
        </ul>
        <button
          onClick={handleDetail}
          className="bg-white text-black px-6 py-2 rounded-full text-sm font-semibold"
        >
          자세한 종목 정보 확인하기
        </button>
      </div>
    </div>
  );
}
