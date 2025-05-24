import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import styles from '../styles/search.module.css';

const Search: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.div}>
      <div className={styles.wrapper}>
        <div className={styles.div2}>삼성전자</div>
        <div className={styles.div3}>에 대한 검색 결과예요.</div>
        <div className={styles.div4}>오늘의 날씨는?</div>
        <div className={styles.div5}>관련 기사</div>

        <div className={styles.div6}>
          <p>이번 주 ‘삼성전자’ 관련 기사에서</p>
          <p>가장 핵심적인 키워드는 아래와 같아요.</p>
        </div>

        <div className={styles.frameDiv}>원전 개발</div>
        <div className={styles.wrapper1}>#키워드 2</div>

        <div className={styles.rectangleParent}>
          <div>기사 제목</div>
          <div className={styles.div8}>기사 본문요약 텍스트</div>
          <div>AI 한 줄 요약: ex. [nn년 mm분기에는 화창할 것 같아요~]</div>
        </div>

        <button onClick={() => router.push('/summary')}>요약 보기</button>
      </div>
    </div>
  );
};

export default Search;
