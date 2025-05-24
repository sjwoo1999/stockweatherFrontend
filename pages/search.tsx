import { useRouter } from 'next/router';

export default function Search() {
  const router = useRouter();

  const handleSummary = () => {
    router.push('/summary');
  };

  const keywordColor = 'bg-[#E30547] text-white';
  const borderColor = 'border border-[#E30547]';

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex justify-center">
      <div className="w-[393px] min-h-screen bg-white p-6 shadow-md flex flex-col overflow-y-auto">
        <h2 className="text-lg font-heading font-bold mb-1">
          <span className="text-black font-extrabold">삼성전자</span>에 대한 검색 결과예요.
        </h2>
        <p className="text-sm font-medium mt-2 mb-2 leading-snug">
          파란 하늘처럼, 삼성전자에도 긍정적인 기류가 감돌고 있어요.
        </p>


        <div
          className="w-full h-28 rounded-xl bg-cover bg-center mb-6"
          style={{ backgroundImage: 'url(/weather/sunny.png)' }}
        ></div>

        <p className="text-sm text-text-muted mb-4 leading-relaxed">
          이번 주 ‘삼성전자’ 관련 뉴스에서 자주 언급된 키워드예요.<br />
          무슨 일이 있었는지 아래 기사에서 확인해보세요!
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {['갤럭시 S25 생산 확대', 'AI 메모리 수요 급증', 'HBM3E 양산 돌입', '미국 관세 정책 이슈'].map((keyword, idx) => (
            <span
              key={idx}
              className={`px-4 py-2 ${keywordColor} rounded-full text-sm`}
            >
              {keyword}
            </span>
          ))}
        </div>

        <h3 className="font-heading font-bold mb-2">관련 기사</h3>

        <div className={`bg-surface-subtle rounded-xl p-4 mb-3 shadow-sm ${borderColor}`}>
          <h4 className="font-semibold mb-1">갤럭시 S25 시리즈 생산 330만 대로 확대</h4>
          <p className="text-sm text-text-muted">
            삼성전자가 미국 관세 이슈에 대응해 갤럭시 S25 생산량을 80만 대 추가해 총 330만 대로 확대할 예정입니다.
            <br />
            <span className="text-xs text-[#E30547] font-medium">
              AI 요약: 관세 리스크에 대비한 전략적 생산 증대 조치입니다.
            </span>
          </p>
        </div>

        <div className={`bg-surface-subtle rounded-xl p-4 mb-6 shadow-sm ${borderColor}`}>
          <h4 className="font-semibold mb-1">HBM3E 메모리, AI 서버 수요로 주목</h4>
          <p className="text-sm text-text-muted">
            AI 시장 확대에 따라 삼성전자가 12단 HBM3E를 빠르게 양산하며, 고용량 서버용 반도체 시장에서 경쟁력을 강화하고 있습니다.
            <br />
            <span className="text-xs text-[#E30547] font-medium">
              AI 요약: AI 수요 확대로 고부가가치 반도체 시장 선점 중입니다.
            </span>
          </p>
        </div>

        <button
          onClick={handleSummary}
          className="w-full border border-gray-300 text-sm py-2 rounded-full mb-2"
        >
          관심 종목 요약 살펴보기
        </button>
      </div>
    </div>
  );
}
