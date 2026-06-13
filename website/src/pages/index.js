import {useState, useEffect} from 'react';
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

// 마감(deadline) — 가까운 순 정렬 + D-day(클라이언트에서만 계산해 hydration 안전)
function DeadlineBlock({items}) {
  const [now, setNow] = useState(null);
  useEffect(() => setNow(Date.now()), []);
  const sorted = [...(items || [])].sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  return (
    <div className={styles.todoBlock}>
      <div className={styles.todoLabel}>⏰ 마감</div>
      <ul className={styles.todoList}>
        {sorted.length === 0 ? (
          <li className={styles.todoEmpty}>마감 예정 없음</li>
        ) : (
          sorted.map((t, i) => {
            let dday = null;
            if (now && t.due) {
              const target = new Date(`${t.due.slice(0, 10)}T23:59:59`).getTime();
              const d = Math.ceil((target - now) / 86400000);
              dday = d === 0 ? 'D-DAY' : d > 0 ? `D-${d}` : `D+${-d}`;
            }
            const urgent = dday && (dday === 'D-DAY' || /^D-[0-2]$/.test(dday));
            return (
              <li key={i} className={t.done ? styles.todoDone : styles.todoItem}>
                <span className={styles.todoCheck} aria-hidden="true">{t.done ? '✅' : '⬜'}</span>
                <span className={styles.todoText}>
                  {t.text}
                  <span className={styles.due}>
                    {t.due?.slice(0, 10)}
                    {dday && <b className={urgent ? styles.ddayUrgent : styles.dday}> · {dday}</b>}
                  </span>
                </span>
              </li>
            );
          })
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
            <DeadlineBlock items={todos.deadlines} />
          </aside>
        </div>
      </main>
    </Layout>
  );
}
