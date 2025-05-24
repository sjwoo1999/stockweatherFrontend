import type { NextPage } from 'next';
import styles from '../styles/detail.module.css';

const Detail: NextPage = () => {
  return (
    <div className={styles.div}>
      <div className={styles.wrapper}>
        <div className={styles.div2}>종목별 세부 현황은 아래와 같아요</div>
        <div className={styles.adr}>넷이즈(ADR)</div>
        <div className={styles.adr}>넷이즈(ADR)</div>
        <div className={styles.adr}>넷이즈(ADR)</div>
        <div className={styles.adr}>넷이즈(ADR)</div>

        <div className={styles.div1}>관심 종목 세부 현황은 아래와 같아요</div>
        <div>[그래프 카드 영역]</div>
      </div>
    </div>
  );
};

export default Detail;
