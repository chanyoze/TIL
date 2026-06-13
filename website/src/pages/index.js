import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import todos from '@site/src/data/todos.json';
import styles from './index.module.css';

const TILES = Array.from({length: 480});

function TodoBlock({label, items}) {
  return (
    <div className={styles.todoBlock}>
      <div className={styles.todoLabel}>{label}</div>
      <ul className={styles.todoList}>
        {items.length === 0 ? (
          <li className={styles.todoEmpty}>비어 있음</li>
        ) : (
          items.map((t, i) => (
            <li key={i} className={t.done ? styles.todoDone : styles.todoItem}>
              <span className={styles.todoCheck} aria-hidden="true">{t.done ? '✅' : '⬜'}</span>
              <span className={styles.todoText}>{t.text}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

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
          <div className={styles.left}>
            <p className={styles.kicker}>✨ Today I Learned · TIL</p>
            <Heading as="h1" className={styles.title}>흩어진 배움을 한곳에</Heading>
            <div className={styles.links}>
              <Link className={styles.btnPrimary} to="/docs">📒 노트</Link>
              <Link className={styles.btnGhost} to="/profile">👤 프로필</Link>
            </div>
          </div>
          <aside className={styles.todoCard}>
            <div className={styles.todoHead}>
              <span className={styles.todoCardTitle}>🗓️ To-Do</span>
              <span className={styles.todoUpdated}>{todos.updated} 기준</span>
            </div>
            <TodoBlock label="📌 금주" items={todos.week} />
            <TodoBlock label="🔥 금일" items={todos.today} />
          </aside>
        </div>
      </main>
    </Layout>
  );
}
