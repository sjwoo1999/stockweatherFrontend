import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/libs/animations';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="h-full flex flex-col justify-center items-center text-center p-6 font-body">
        <motion.h1 {...fadeInUp} className="text-xl font-bold font-heading text-brand-dark mb-6">
          어떤 종목에 대한 정보를 원하시나요?
        </motion.h1>
        <motion.div {...fadeInUp} className="flex items-center gap-2 w-full bg-card rounded-full px-4 py-3">
          <span className="text-sm text-gray-600">🔍 검색</span>
          <div className="ml-auto">
            <Button onClick={() => router.push('/search')}>➡</Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
