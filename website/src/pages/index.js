import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

const TILES = Array.from({length: 480});

// 카테고리 바로가기 — 링크는 각 폴더 _category_.json 의 slug 와 맞춘다.
const CATEGORIES = [
  {to: '/docs/company', label: '🏢 회사', desc: '마일스톤별 회고 — 무엇을 고민했고 무엇을 골랐나'},
  {to: '/docs/devnote', label: '📝 개발노트', desc: '회사 · 프로젝트를 넘어 다시 쓰는 기술 지식'},
  {to: '/docs/ai-rnd', label: '🔬 AI R&D', desc: 'AI 활용 연구 · 교육 · 스터디'},
  {to: '/docs/toy', label: '🧪 토이프로젝트', desc: '개인 프로젝트 — 결정과 그 대가'},
  {to: '/docs/TIL', label: '📚 TIL', desc: '날짜별 학습 기록'},
];

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  const mascot = useBaseUrl('/img/mascot.png');
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline} wrapperClassName="homeMain">
      <main className={styles.hero}>
        <div className={styles.tileGrid} aria-hidden="true">
          {TILES.map((_, i) => (
            <img key={i} src={mascot} className={styles.tileImg} alt="" />
          ))}
        </div>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>✨ Today I Learned · TIL</p>
          <Heading as="h1" className={styles.title}>흩어진 배움을 한곳에</Heading>
          <p className={styles.lead}>
            일하며 고민한 것과 배운 것을 다시 쓴 회고 · 개발노트 · 프로젝트 기록이다.
          </p>
          <div className={styles.links}>
            <Link className={styles.btnPrimary} to="/docs">📒 노트</Link>
            <Link className={styles.btnGhost} to="/profile">👤 프로필</Link>
          </div>
          <ul className={styles.cats}>
            {CATEGORIES.map((c) => (
              <li key={c.to}>
                <Link className={styles.cat} to={c.to}>
                  <span className={styles.catLabel}>{c.label}</span>
                  <span className={styles.catDesc}>{c.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </Layout>
  );
}
