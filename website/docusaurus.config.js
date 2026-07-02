// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';
import {createRequire} from 'module';

// ESM config에서 require.resolve 사용 (검색 테마 등록용)
const require = createRequire(import.meta.url);

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '이찬호 노트',
  tagline: '배운 건 흘려보내지 않기 — 매일의 기술 기록',
  favicon: 'img/favicon.png',

  // 사이트 게이트 비밀번호는 "평문"이 아니라 SHA-256 "해시"만 보관한다.
  //  - 소스/깃헙에는 아래 해시만 노출(평문 0000 은 소스에 없음).
  //  - 배포(CI)에서 secret SITE_GATE_PW_HASH 로 override 가능(그때는 해시조차 소스에서 사라짐).
  //  - fallback 해시는 '0000' 의 SHA-256 (env 미설정 시 로컬/기본 동작 유지).
  //  ⚠️ 정적 사이트라 해시는 결국 브라우저 번들에 담긴다 — 약한 비밀번호는 무차별 대입 가능.
  //     "진짜" 비공개가 필요하면 서버측 게이트(Cloudflare Access 등) + private 레포로 가야 한다.
  customFields: {
    gatePwHash:
      process.env.SITE_GATE_PW_HASH ||
      '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0',
  },

  future: {
    v4: true,
  },

  // Mermaid 다이어그램 활성화 (```mermaid 코드블록 렌더)
  markdown: {
    mermaid: true,
    // .md = CommonMark(레거시 일반 마크다운 허용: <br>, {}, <details> 등), .mdx = MDX
    format: 'detect',
    // 레거시 문서의 깨진 이미지/링크는 빌드 실패 대신 경고만
    hooks: {
      onBrokenMarkdownImages: 'warn',
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // 배포 URL: https://chanyoze.github.io/TIL/
  url: 'https://chanyoze.github.io',
  baseUrl: '/TIL/',
  organizationName: 'chanyoze',
  projectName: 'TIL',

  onBrokenLinks: 'warn',

  i18n: {
    defaultLocale: 'ko',
    locales: ['ko'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // 단일 볼트(../vault) — 폴더 구조 = 카테고리. 사이드바는 폴더 트리로 자동 생성(옵시디언식).
          path: '../vault',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/chanyoze/TIL/edit/main/vault/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: [
    // Mermaid 다이어그램 렌더 테마
    '@docusaurus/theme-mermaid',
    // 로컬 검색 (서버 없이 빌드 타임 색인, 한국어+영어)
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'ko'],
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        searchResultLimits: 8,
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og-card.png',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: '이찬호 노트',
        logo: {
          alt: '이찬호 노트',
          src: 'img/mascot.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: '📒 노트',
          },
          {
            to: '/profile',
            label: '👤 프로필',
            position: 'left',
          },
          {
            href: 'https://github.com/chanyoze/TIL',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '노트',
            items: [
              {label: '전체 보기', to: '/docs'},
              {label: 'TIL', to: '/docs/TIL'},
              {label: '단어장', to: '/docs/wordbank'},
            ],
          },
          {
            title: '더보기',
            items: [
              {label: 'GitHub', href: 'https://github.com/chanyoze/TIL'},
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 이찬호. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
