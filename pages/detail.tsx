'use client';
import { useRouter } from 'next/router';

const stocks = [
  { name: '삼성전자', emoji: '🔵', signal: '강력 매수', percent: '92%', color: 'text-blue-700' },
  { name: '네이버', emoji: '🔷', signal: '매수', percent: '82%', color: 'text-blue-500' },
  { name: '엔비디아', emoji: '⚪', signal: '중립', percent: '74%', color: 'text-gray-500' },
  { name: '테슬라', emoji: '🟠', signal: '비중 축소', percent: '65%', color: 'text-orange-500' },
  { name: '넷이즈', emoji: '🔴', signal: '매도', percent: '58%', color: 'text-red-500' },
];

export default function Detail() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex justify-center">
      <div className="w-[393px] min-h-screen bg-white p-6">
        <h2 className="text-lg font-heading font-bold mb-4">
          종목별 세부 현황은 아래와 같아요
        </h2>

        <div className="space-y-3">
          {stocks.map((stock) => (
            <div
              key={stock.name}
              className="bg-white p-4 rounded-lg flex justify-between items-center shadow-sm border border-[#E30547]"
            >
              <span className="flex items-center gap-2">
                <span>{stock.emoji}</span>
                <span>{stock.name}</span>
              </span>
              <span className={`${stock.color} font-semibold text-sm`}>
                {stock.signal}({stock.percent})
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          ※ 해당 수치는 예시이며, 실제 수치와는 무관합니다.
        </p>

        <button
          className="w-full mt-6 py-2 rounded-full text-sm font-medium bg-[#E30547] text-white hover:opacity-90 transition"
          onClick={() => router.push('/')}
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
