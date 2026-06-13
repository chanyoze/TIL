# 📒 이찬호 노트 (TIL)

흩어지기 쉬운 배움을 한곳에 모아두는 **개인 지식 볼트**. 모든 기록을 Markdown으로 쓰고, **Docusaurus 웹사이트**로 제공한다.

> ⚠️ 이 저장소는 **public**입니다 — `vault/`의 모든 문서는 사이트뿐 아니라 GitHub 소스로도 공개됩니다. 민감한 내용은 올리지 않습니다.

## 🌐 웹사이트

### **https://chanyoze.github.io/TIL/**

`main`에 push하면 GitHub Actions가 자동 빌드·배포(GitHub Pages)한다. 폴더 트리가 그대로 카테고리(옵시디언식, 사이드바 자동 생성).

- 🔍 **로컬 검색** — `Ctrl+K`, 한국어+영어 색인 (빌드 타임, 서버 불필요)
- 📊 **Mermaid 다이어그램** — ` ```mermaid ` 코드블록 렌더
- 🗓️ **메인 To-Do 위젯** — 금주 / 금일 / 마감(D-day) + 클릭 시 **구글 캘린더 추가**(OAuth 불필요)
- 🏠 **시작하기 로드맵** — 추후 기능 체크리스트
- 메인 navbar/footer 정리 · 일반 페이지 footer 토글

## 📂 구조

```
vault/             ← 게시용 문서(readable). 폴더=카테고리, Docusaurus가 /docs로 서빙
  intro.md           시작하기(볼트 소개 + 로드맵)
  TIL/YYYY-MM/       날짜별 학습기록 (제목 양식 "YYYY-MM-DD / 내용")
  단어장/<분야>.md    분야별 용어집 (CI/CD·Java·AI·프론트엔드·…)
  회사/ · 토이프로젝트/  주제별 노트
raw/               ← 원본 보관(archival). 사이트 비게시
data/todos.json    ← To-Do 데이터. 사이트가 런타임 fetch → 변경 시 재배포 불필요
website/           ← Docusaurus 앱
skills/writedown/  ← 입력 스킬 정본(SKILL.md)
```

## 📝 writedown 스킬 (구 til-note · wordbank 통합)

입력 하나를 **raw(원본 보관) + readable(사이트 게시용)** 두 버전으로 갈라 기록하는 통합 지식 입력 스킬. 기존 `til-note`(날짜별 학습기록)·`wordbank`(단어장)를 흡수해 단일화했다.

| 카테고리 | 역할 | 위치 |
|---|---|---|
| `til` | 오늘 배운 것 (월별) | `vault/TIL/YYYY-MM/` |
| `wordbank` | 분야별 용어 | `vault/단어장/<분야>.md` |
| `note` | 주제별 글 | `vault/<카테고리>/<slug>.md` |
| `todo` | 금주/금일/마감 할 일 | `data/todos.json` |

**부가 동작**
- 🔒 **공개 게시 확인** — public이라 기록 전 "공개돼도 되는지" 1회 확인 (민감정보 거름)
- 📖 **단어장 자동 연계** — TIL/note 작성 시 새 용어를 단어장 후보로 추출(중복 자동 체크)
- 🔧 **빌드 검증** — 커밋 전 `npm run build`로 깨짐 점검
- 📅 **마감 → 구글 캘린더** — 마감 항목 클릭으로 캘린더 등록(OAuth 없이)

## 🛠 개발

```bash
cd website
npm install
npm start        # 로컬 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
```

- 커밋 형식: `<날짜> / 이찬호 / <요청자(없으면 -)> / <1줄 요약>`
- 배포 트리거: `website/**` · `vault/**` · `.github/**` 변경 시 (GitHub Actions)
- **To-Do(`data/todos.json`)는 배포 경로 밖** → 할 일만 바꿀 땐 push만 하면 됨(재빌드·재배포 0)
