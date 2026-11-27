import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './profile.module.css';

const STACK = ['Java', 'Spring Boot', 'Oracle', 'InfluxDB', 'MQTT', 'AWS', 'JavaScript', 'WebSquare', 'Swagger', 'LLM', 'Git', 'Gradle'];

const PROJECTS = [
  {emoji: '🌐', name: 'IoT 데이터 파이프라인 · InfluxDB 도입', period: '2025.05–08', desc: '누적 약 140만 건 센서 데이터 수집·유실 0건. MQTT 수신 → 2단계 파이프라인 설계, 11개 현장 5천 명 통합 대시보드 운영 지원.'},
  {emoji: '🔗', name: '데이터 리니지 아키텍처 설계', period: '2025.03–04', desc: '100여 개 메뉴 연계를 34개 신규 테이블로 완전 추적 가능한 구조로 재설계 — 역추적 불가 문제 해결.'},
  {emoji: '🗂️', name: 'View-Model 분리 · 로컬 저장소 패턴', period: '2026.02–04', desc: '월 10만 회 핵심 메뉴의 데이터 유실 문제 해결. 5천 줄 레거시 스크립트 전면 리팩토링 선행.'},
  {emoji: '🔐', name: 'QR 라우팅 보안 공통화', period: '2025.06–09', desc: 'QR 진입 로직을 단일 공통 컨트롤러로 추상화 + AES 암호화로 URL 평문 노출·위변조 리스크 차단.'},
  {emoji: '📱', name: '모바일 V2 서버 API 설계', period: '2023.08–2024.05', desc: '현장관리 9개 메뉴 약 120개 API를 RESTful + DTO 구조로 신규 설계, 사내 네이밍 표준화 기여.'},
];

export default function Profile() {
  return (
    <Layout title="프로필" description="이찬호 — 구조적 문제를 설계로 푸는 백엔드 엔지니어">
      <main className={styles.page}>
        <div className={styles.wrap}>
          <header className={styles.head}>
            <div className={styles.avatar}>이</div>
            <div className={styles.headInfo}>
              <Heading as="h1" className={styles.name}>
                이찬호 <span className={styles.en}>Chan-ho Lee</span>
              </Heading>
              <p className={styles.role}>🧩 구조적 문제를 설계로 푸는 백엔드 엔지니어</p>
              <div className={styles.contact}>
                <Link to="mailto:iloory64@gmail.com">✉️ iloory64@gmail.com</Link>
                <Link to="https://github.com/chanyoze">🐙 github.com/chanyoze</Link>
              </div>
            </div>
          </header>

          <section className={styles.section}>
            <Heading as="h2" className={styles.h2}>👋 소개</Heading>
            <ul className={styles.bullets}>
              <li>역추적이 구조적으로 불가능했던 레거시를 34개 테이블 신설로 완전 추적 가능한 구조로 전환</li>
              <li>5천 줄 레거시 스크립트를 전면 리팩토링해, 이전 도입 시도가 실패했던 상태 관리 패턴 적용</li>
              <li>IoT 장비 업체와 원격으로 통신 규격을 직접 협의하고 기술 사양으로 전환하는 End-to-End 경험</li>
              <li>현장관리 9개 메뉴 모바일 V2 API를 RESTful + DTO로 신규 설계, 사내 네이밍 표준화 기여</li>
              <li>사내 AI R&D를 겸하며 LLM 에이전트 실행환경 엔지니어링 구축 중</li>
            </ul>
          </section>

          <section className={styles.section}>
            <Heading as="h2" className={styles.h2}>💼 경력</Heading>
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardName}>클라우드랩 · 파트 리더 & 소프트웨어 엔지니어</span>
                <span className={styles.period}>2023.01 – 현재</span>
              </div>
              <p className={styles.cardDesc}>
                3명 규모 풀스택 스쿼드의 파트 리더로서 고객 미팅·DB 모델링·인프라 배포·장애 대응까지 End-to-End로 책임집니다.
                사내 AI R&D 멤버를 겸하여 DDD 기반 아키텍처 전환과 LLM 에이전트 실행환경 엔지니어링을 구축 중입니다.
              </p>
            </div>
          </section>

          <section className={styles.section}>
            <Heading as="h2" className={styles.h2}>🛠️ 기술 스택</Heading>
            <div className={styles.chips}>
              {STACK.map((s) => <span key={s} className={styles.chip}>{s}</span>)}
            </div>
          </section>

          <section className={styles.section}>
            <Heading as="h2" className={styles.h2}>📦 주요 프로젝트</Heading>
            <div className={styles.projects}>
              {PROJECTS.map((p) => (
                <div key={p.name} className={styles.proj}>
                  <div className={styles.projEmoji}>{p.emoji}</div>
                  <div className={styles.projBody}>
                    <div className={styles.cardTop}>
                      <span className={styles.projName}>{p.name}</span>
                      <span className={styles.period}>{p.period}</span>
                    </div>
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
              <Link className={styles.link} to="mailto:iloory64@gmail.com">이메일 →</Link>
              <Link className={styles.link} to="/docs">노트 보기 →</Link>
            </div>
          </section>
        </div>
      </main>
    </Layout>
  );
}
