import React, {useState, useEffect} from 'react';
import {useLocation} from '@docusaurus/router';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// ──────────────────────────────────────────────────────────────
// 사이트 내 캐주얼 비밀번호 게이트
//  - 대상 섹션: /docs/회사 , /docs/TIL , /docs/ai-rnd 등
//  - 비밀번호는 "평문"이 아니라 SHA-256 "해시"로만 비교한다(소스에 0000 평문 없음).
//    해시 출처: docusaurus.config.js customFields.gatePwHash
//    (env SITE_GATE_PW_HASH override 가능 — 기본값은 '0000'의 해시)
//  - 세션 단위로 1회 입력하면 해당 세션 동안 유지(sessionStorage)
//  ※ GitHub 레포가 public이라 원본 .md는 그대로 공개됩니다.
//    이 게이트는 "사이트 화면 안에서의 가림"만 제공하며, 정적 사이트 특성상
//    해시는 브라우저 번들에 담깁니다(약한 비밀번호는 무차별 대입 가능).
// ──────────────────────────────────────────────────────────────

// 입력 문자열의 SHA-256 16진 문자열을 반환(Web Crypto).
async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

const STORAGE_KEY = 'site-gate-unlocked';
// 잠긴 섹션: 폴더 경로(/docs/회사 …)와 카테고리 인덱스 커스텀 slug(/docs/company …) 모두 포함
const PROTECTED = /\/docs\/(회사|company|TIL|toyProject|toy|개발노트|devnote|AI R&D|ai-rnd|준비중|wip)(\/|$)/;

function isProtected(pathname) {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (e) {
    /* malformed URI → 원본으로 검사 */
  }
  return PROTECTED.test(decoded);
}

export default function Root({children}) {
  const {pathname} = useLocation();
  const {siteConfig} = useDocusaurusContext();
  const gatePwHash = siteConfig.customFields?.gatePwHash;
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isUnlocked =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(STORAGE_KEY) === '1';
    setUnlocked(isUnlocked);
    // 해제 여부를 html 클래스로 반영 → 사이드바 CSS가 잠긴 섹션 하위 목록을 가림
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('gate-unlocked', isUnlocked);
    }
  }, []);

  const protectedNow = isProtected(pathname);

  // 비보호 페이지거나 이미 해제된 경우 → 정상 렌더
  if (!protectedNow || unlocked) {
    return <>{children}</>;
  }

  // SSR / 첫 클라이언트 렌더는 잠금화면으로 통일(하이드레이션 불일치 방지)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const inputHash = await sha256Hex(input);
    if (inputHash === gatePwHash) {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
      document.documentElement.classList.add('gate-unlocked');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setInput('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--ifm-background-color)',
        color: 'var(--ifm-font-color-base)',
        padding: '1rem',
      }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 360,
          textAlign: 'center',
          border: '1px solid var(--ifm-color-emphasis-300)',
          borderRadius: 12,
          padding: '2rem 1.5rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
        <div style={{fontSize: 40, marginBottom: 8}}>🔒</div>
        <h2 style={{marginBottom: 4}}>비밀번호를 입력해 주세요</h2>
        <p style={{color: 'var(--ifm-color-emphasis-600)', marginBottom: 20, fontSize: '0.9rem'}}>
          이 섹션은 비밀번호 입력 후 열람할 수 있습니다.
        </p>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="비밀번호"
          aria-label="비밀번호"
          style={{
            width: '100%',
            padding: '0.6rem 0.8rem',
            fontSize: '1rem',
            borderRadius: 8,
            border: `1px solid ${error ? 'var(--ifm-color-danger)' : 'var(--ifm-color-emphasis-400)'}`,
            background: 'var(--ifm-background-surface-color)',
            color: 'var(--ifm-font-color-base)',
            marginBottom: 12,
          }}
        />
        {error && (
          <div style={{color: 'var(--ifm-color-danger)', fontSize: '0.85rem', marginBottom: 12}}>
            비밀번호가 올바르지 않습니다.
          </div>
        )}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.6rem',
            fontSize: '1rem',
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: 'var(--ifm-color-primary)',
            color: '#fff',
          }}>
          확인
        </button>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') window.history.back();
          }}
          style={{
            width: '100%',
            marginTop: 8,
            padding: '0.5rem',
            fontSize: '0.85rem',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            background: 'transparent',
            color: 'var(--ifm-color-emphasis-600)',
          }}>
          ← 돌아가기
        </button>
      </form>
    </div>
  );
}
