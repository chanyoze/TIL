import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const TILES = Array.from({length: 480});

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const mascot = useBaseUrl('/img/mascot.png');
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.hero}>
        <div className={styles.tileGrid} aria-hidden="true">
          {TILES.map((_, i) => (
            <img key={i} src={mascot} className={styles.tileImg} alt="" />
          ))}
        </div>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>✍️ 이찬호의 기술 노트</p>
          <Heading as="h1" className={styles.title}>흩어진 배움을 한곳에</Heading>
          <div className={styles.links}>
            <Link className={styles.btnPrimary} to="/docs">📒 노트</Link>
            <Link className={styles.btnGhost} to="/profile">👤 프로필</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
