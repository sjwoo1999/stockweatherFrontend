import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Headline } from '@/components/Headline';

const Search: NextPage = () => {
  const router = useRouter();

  return (
    <Layout>
      <div className="h-full w-full p-6 font-body text-left space-y-6">
        <Headline>삼성전자에 대한 검색 결과예요.</Headline>
        <section className="space-y-2">
          <p className="text-sm text-text-muted">
            이번 주 ‘삼성전자’ 관련 기사에서 가장 핵심적인 키워드는 아래와 같아요.
          </p>
          <div className="flex gap-2">
            <Button>원전 개발</Button>
            <Button>#키워드 2</Button>
          </div>
        </section>
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-heading">관련 기사</h2>
          <Card
            title="기사 제목"
            description="기사 본문 요약 텍스트 기사 본문 요약 텍스트"
            footer="AI 요약: nn년 mm분기에는 화창할 것 같아요~"
          />
          <Card
            title="기사 제목"
            description="기사 본문 요약 텍스트 기사 본문 요약 텍스트"
            footer="AI 요약: nn년 mm분기에는 화창할 것 같아요~"
          />
        </section>
        <div className="pt-4">
          <Button onClick={() => router.push('/summary')} variant="ghost">
            요약 정보 보기
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Search;
