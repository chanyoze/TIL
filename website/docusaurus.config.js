// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'TIL — 이찬호 기술 노트',
  tagline: '매일 배운 것(TIL)과 용어를 정리한 개인 기술 문서',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // 배포 URL: https://chanyoze.github.io/TIL/
  url: 'https://chanyoze.github.io',
  baseUrl: '/TIL/',

  // GitHub Pages 배포 설정
  organizationName: 'chanyoze', // GitHub 사용자/조직명
  projectName: 'TIL', // 레포명

  onBrokenLinks: 'throw',

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
          // 기존 ../TIL 폴더(스킬이 쌓는 데일리 노트)를 그대로 문서 소스로 사용
          path: '../TIL',
          routeBasePath: 'til',
          sidebarPath: './sidebars.js',
        },
        // 블로그 기능은 사용하지 않음
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  // 단어장(wordbank)을 두 번째 docs 인스턴스로 추가 — ../wordbank 폴더를 소스로 사용
  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      /** @type {import('@docusaurus/plugin-content-docs').Options} */
      ({
        id: 'wordbank',
        path: '../wordbank',
        routeBasePath: 'wordbank',
        sidebarPath: './sidebarsWordbank.js',
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'TIL',
        logo: {
          alt: 'TIL Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'TIL',
          },
          {
            type: 'docSidebar',
            sidebarId: 'wordbankSidebar',
            docsPluginId: 'wordbank',
            position: 'left',
            label: '단어장',
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
            title: '문서',
            items: [
              {
                label: 'TIL',
                to: '/til',
              },
              {
                label: '단어장',
                to: '/wordbank',
              },
            ],
          },
          {
            title: '더보기',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/chanyoze/TIL',
              },
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
