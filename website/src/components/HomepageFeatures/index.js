import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    emoji: '📚',
    title: 'TIL',
    to: '/docs/TIL',
    description: '매일 배운 것을 날짜별로 차곡차곡 기록합니다.',
  },
  {
    emoji: '📖',
    title: '단어장',
    to: '/docs/단어장',
    description: '공부한 용어와 개념을 한곳에 누적해 복습합니다.',
  },
  {
    emoji: '🏢',
    title: '회사',
    to: '/docs/company',
    description: '회사 문서·문서관리 등 주제별 기록 모음.',
  },
  {
    emoji: '📒',
    title: '전체 노트',
    to: '/docs',
    description: '모든 카테고리를 사이드바 트리에서 탐색합니다.',
  },
];

function Feature({emoji, title, description, to}) {
  return (
    <div className={clsx('col col--3')}>
      <Link to={to} className={styles.card}>
        <div className={styles.cardEmoji}>{emoji}</div>
        <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
        <p className={styles.cardDesc}>{description}</p>
        <span className={styles.cardMore}>바로가기 →</span>
      </Link>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>📂 카테고리</Heading>
        <p className={styles.sectionSub}>폴더를 만들면 새 카테고리가 사이드바에 자동으로 추가됩니다 — 옵시디언처럼.</p>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
