import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const mascot = useBaseUrl('/img/mascot.png');
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.hero}>
        <div className={styles.tile} style={{backgroundImage: `url(${mascot})`}} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.kicker}>이찬호의 기술 노트</p>
          <Heading as="h1" className={styles.title}>
            배운 건<br />흘려보내지 않기
          </Heading>
          <div className={styles.links}>
            <Link className={styles.linkPrimary} to="/docs">노트 보기 →</Link>
            <Link className={styles.linkGhost} to="/profile">프로필</Link>
          </div>
        </div>
      </main>
    </Layout>
  );
}
