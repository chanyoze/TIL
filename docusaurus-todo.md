# Docusaurus 지식 문서화 사이트 구축 TODO

> 스택: Docusaurus + GitHub Pages (chanyoze.github.io/TIL)
> 목적: 축적된 인프라/데이터 지식을 정적 문서 사이트로 공개 서빙 (이직 포트폴리오 + 개인 스터디)
> 구조: 기존 chanyoze/TIL 레포 안에 `website/` 하위폴더로 Docusaurus 구성 (단일 소스 유지)

---

## Phase 1 — 로컬 환경 세팅

- [x] Node.js / npm / git 설치 확인 (Node v24.15.0, npm 11.12.1, git 2.53.0)
- [x] 1-1. 레포 결정 — 새 레포 대신 기존 chanyoze/TIL 디벨롭으로 확정
- [x] 1-2. Docusaurus 프로젝트 생성 (`website/` 하위폴더, classic, JS)
- [x] 1-3. 로컬 빌드/서버 실행 및 렌더링 확인 (build 성공, serve HTTP 200)

## Phase 2 — 콘텐츠 세팅

- [x] 2-1. 기본 사이드바 구조 설계 (docs 인스턴스 2개: TIL=`../TIL`, 단어장=`../wordbank`)
- [x] 2-2. 기존 TIL/wordbank 콘텐츠 연결 (복사 없이 ../ 폴더 직접 소스로 사용)
- [x] TIL/index.md, wordbank.md frontmatter 추가로 랜딩 페이지(`/til`, `/wordbank`) 구성
- [ ] 2-3. (선택) 홈페이지 HomepageFeatures 기본 placeholder 3개 → 내 콘텐츠로 교체
- [ ] 2-4. (선택) Obsidian 문서 추가 이관 및 Frontmatter 정규화

## Phase 3 — 배포 자동화

- [ ] 3-0. **레포 public 여부 확인** (GitHub Pages 무료는 public 필수, 아니면 Pro)
- [ ] 3-1. GitHub Actions 워크플로우 작성 (`.github/workflows/deploy.yml`, working-dir=website)
- [ ] 3-2. GitHub 레포 Settings → Pages → Source: GitHub Actions 활성화
- [ ] 3-3. commit & push → 자동 빌드 배포 확인 (https://chanyoze.github.io/TIL/)

---

## 메모

- 배포 URL: `https://chanyoze.github.io/TIL/`
- docusaurus.config.js: url=`https://chanyoze.github.io`, baseUrl=`/TIL/`, org=`chanyoze`, project=`TIL`
- 콘텐츠는 `../TIL`, `../wordbank`를 직접 소스로 → til-note/wordbank 스킬이 쓰는 위치 그대로, 동기화 불필요
- 사이드바: 메인 docs=`tutorialSidebar`(TIL), 두 번째 인스턴스=`wordbankSidebar`(단어장)
- `website/.gitignore`가 node_modules/build/.docusaurus 제외 → 소스만 커밋됨
- 빌드 명령: `cd website && npm run build` / 로컬 확인: `npm run serve` (※ `npm start`는 dev 서버라 자동화 X)
- ⚠️ dev 서버(start)는 website/ 밖(../TIL) 파일 변경을 hot-reload 못할 수 있음 — build/serve로 확인
