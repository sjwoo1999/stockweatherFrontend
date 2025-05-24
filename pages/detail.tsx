import { NextPage } from 'next';
import { Layout } from '@/components/Layout';

const Detail: NextPage = () => {
  return (
    <Layout>
      <div className="h-full w-full p-6 bg-blue-100 overflow-y-auto font-body">
        <h2 className="text-lg font-bold mb-4 font-heading text-brand-dark">
          종목별 세부 현황은 아래와 같아요
        </h2>
        <div className="space-y-3 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-xl text-center shadow">
              넷이즈(ADR)
            </div>
          ))}
        </div>
        <h3 className="text-lg font-bold mb-3 font-heading text-brand-dark">
          관심 종목 세부 현황은 아래와 같아요
        </h3>
        <div className="bg-white p-4 rounded-xl shadow-inner space-y-2">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-0"
            >
              <span className="text-sm text-gray-700">로고 삼성전자</span>
              <span className="text-xs font-bold text-red-600">매수(89%)</span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Detail;
