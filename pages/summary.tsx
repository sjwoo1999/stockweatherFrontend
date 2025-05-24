import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import styles from '../styles/summary.module.css';

const Summary: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.div}>
      <div className={styles.wrapper}>
        <div className={styles.xxXx}>2025년 xx월 xx일</div>
        <div className={styles.div2}>사용자님의 날씨는..</div>

        <div className={styles.xContainer}>
          <p>포트폴리오 X</p>
          <p>내가 관심 있는 종목</p>
          <p>장기투자 할 종목에 대해서</p>
        </div>

        <div className={styles.buttonWrapper}>
          <button onClick={() => router.push('/detail')}>상세 정보 확인하기</button>
        </div>
      </div>
    </div>
  );
};

export default Summary;
