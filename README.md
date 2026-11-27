# 📒 이찬호 노트 (TIL)

흩어지기 쉬운 배움을 한곳에 모아두는 **개인 지식 볼트**. 모든 기록을 Markdown으로 쓰고, **Docusaurus 웹사이트**로 제공한다.

> ⚠️ 이 저장소는 **public**입니다 — `vault/`의 모든 문서는 사이트와 GitHub 소스 양쪽에 그대로 공개됩니다. 잠근 카테고리는 없습니다. 서버 · 보안 설정 · 계정 · 실데이터 · 사람 이름처럼 공개하면 곤란한 내용은 처음부터 올리지 않습니다.

## 🌐 웹사이트

### **https://chanyoze.github.io/TIL/**

`main`에 push하면 GitHub Actions가 자동 빌드·배포(GitHub Pages)한다. 폴더 트리가 그대로 카테고리(옵시디언식, 사이드바 자동 생성).

- 🔍 **로컬 검색** — `Ctrl+K`, 한국어+영어 색인 (빌드 타임, 서버 불필요)
- 📊 **Mermaid 다이어그램** — ` ```mermaid ` 코드블록 렌더
- 🏠 **메인 페이지** — 짧은 소개 + 카테고리 바로가기
- 일반 페이지 footer 토글

## 📂 구조

```
vault/             ← 게시용 문서(readable). 폴더=카테고리, Docusaurus가 /docs로 서빙
  intro.md           시작하기(볼트 소개)
  TIL/YYYY-MM/       날짜별 학습기록 (제목 양식 "YYYY-MM-DD / 내용")
  회사/ · 개발노트/ · AI R&D/ · toyProject/  주제별 노트
website/           ← Docusaurus 앱
(writedown 스킬 정본은 2026-09-01 부터 private 저장소 RAW-DOC 의 skills/writedown)
```

## 📝 writedown 스킬 (구 til-note 통합)

입력 하나를 **raw(원본 보관) + readable(사이트 게시용)** 두 버전으로 갈라 기록하는 통합 지식 입력 스킬. raw 는 private 저장소 RAW-DOC(`raw/`)에, readable 은 이 저장소 `vault/` 에 남는다.

| 카테고리 | 역할 | 위치 |
|---|---|---|
| `til` | 오늘 배운 것 (월별) | `vault/TIL/YYYY-MM/` |
| `note` | 주제별 글 | `vault/<카테고리>/<slug>.md` |

> `wordbank`(단어장)는 2026-09-11 폐지, 남아 있던 글도 2026-11-27 에 비공개 보관함으로 옮겼다. 용어 설명은 `note` 안에 쓴다.
> 할 일(To-Do)은 이 사이트에서 다루지 않는다(데스크톱 앱으로 옮김).

**부가 동작**
- **공개 게시 확인** — public이라 기록 전 "공개돼도 되는지" 1회 확인 (민감정보 거름)
- 🔧 **빌드 검증** — 커밋 전 `npm run build`로 깨짐 점검

## 🛠 개발

```bash
cd website
npm install
npm start        # 로컬 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
```

- 커밋 형식: `<날짜> / 이찬호 / <요청자(없으면 -)> / <1줄 요약>`
- 배포 트리거: `website/**` · `vault/**` · `.github/**` 변경 시 (GitHub Actions)
