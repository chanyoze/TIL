import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './profile.module.css';

// 자유롭게 수정하세요 — 기술 스택
const STACK = ['Java', 'Spring Boot', 'Vue 3', 'JavaScript', 'Node.js', 'Tailwind CSS', 'PostgreSQL', 'Docusaurus'];

// 자유롭게 수정하세요 — 프로젝트
const PROJECTS = [
  {emoji: '🏗️', name: 'CIP 홈페이지 리팩토링', desc: '레거시 Thymeleaf → Vue 3 SPA 마이그레이션 (디자인·프론트·DDD 백엔드 설계).'},
  {emoji: '🤖', name: '디스코드 봇', desc: 'discord.js 기반 담배 카운트·이터널리턴 모집 봇 제작·운영.'},
  {emoji: '📒', name: 'TIL 지식 볼트', desc: '매일 배운 것을 raw + readable로 기록하는 Docusaurus 사이트(여기!).'},
];

export default function Profile() {
  return (
    <Layout title="프로필" description="이찬호 — 기록하는 개발자">
      <main className={styles.wrap}>
        <header className={styles.head}>
          <div className={styles.avatar}>이</div>
          <div>
            <Heading as="h1" className={styles.name}>이찬호</Heading>
            <p className={styles.role}>💻 기록하는 개발자 · Backend / Frontend</p>
          </div>
        </header>

        <p className={styles.bio}>
          배운 것을 흘려보내지 않으려 매일 기록합니다. 레거시를 현대적으로 다시 세우고,
          필요한 작은 도구를 직접 만들어 쓰는 걸 좋아해요.
          <span className={styles.editHint}> (이 소개는 자유롭게 고쳐 쓰세요.)</span>
        </p>

        <section className={styles.section}>
          <Heading as="h2" className={styles.h2}>🛠️ 기술 스택</Heading>
          <div className={styles.chips}>
            {STACK.map((s) => <span key={s} className={styles.chip}>{s}</span>)}
          </div>
        </section>

        <section className={styles.section}>
          <Heading as="h2" className={styles.h2}>📦 프로젝트</Heading>
          <div className={styles.projects}>
            {PROJECTS.map((p) => (
              <div key={p.name} className={styles.proj}>
                <div className={styles.projEmoji}>{p.emoji}</div>
                <div>
                  <div className={styles.projName}>{p.name}</div>
                  <div className={styles.projDesc}>{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <Heading as="h2" className={styles.h2}>🔗 링크</Heading>
          <div className={styles.links}>
            <Link className={styles.link} to="https://github.com/chanyoze">GitHub →</Link>
            <Link className={styles.link} to="/docs">노트 보기 →</Link>
          </div>
        </section>
      </main>
    </Layout>
  );
}
