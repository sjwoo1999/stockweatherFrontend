import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import styles from '../styles/home.module.css';

const Home: NextPage = () => {
  const router = useRouter();

  return (
    <div className={styles.div}>
      <div className={styles.wrapper}>
        <div className={styles.statusBar}>
          <div>[Icons]</div>
          <div>[Signal | WiFi | Battery]</div>
        </div>

        <b className={styles.b}>어떤 종목에 대한 정보를 원하시나요?</b>

        <div className={styles.searchFieldWithRoundButton}>
          <div className={styles.searchFieldAtom}>검색</div>
          <button onClick={() => router.push('/search')}>🔍</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
