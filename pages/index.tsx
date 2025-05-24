import { FaSearch, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleSearch = () => {
    router.push('/search');
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] flex justify-center items-stretch">
      <div className="w-[393px] bg-white flex flex-col justify-center px-6 py-24 min-h-screen">
        <h1 className="text-center font-heading text-base font-bold mb-6">
          어떤 종목에 대한 정보를 원하시나요?
        </h1>
        <div className="flex items-center bg-surface-subtle px-4 py-3 rounded-full shadow-sm w-full">
          <FaSearch className="text-gray-500 mr-2" />
          <span className="text-black flex-1 text-sm">삼성전자</span>
          <button
            onClick={handleSearch}
            className="ml-2 bg-brand-primary text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            <FaArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
