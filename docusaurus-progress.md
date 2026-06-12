# Docusaurus 사이트 작업 진행 상황 (이어서 하기용)

> 마지막 업데이트: 2026-06-12 (회사 PC에서 작업)
> 같이 볼 것: [docusaurus-todo.md](./docusaurus-todo.md) (체크리스트)

## 한 줄 요약

기존 `chanyoze/TIL` 레포 안 **`website/` 하위폴더**에 Docusaurus 사이트를 구성했고, **로컬 빌드/서빙까지 검증 완료**. 남은 건 **배포(GitHub Pages)** 뿐.

---

## ✅ 지금까지 완료

- `website/` 에 Docusaurus(classic, JavaScript) 스캐폴딩
- 콘텐츠 연결: **복사 없이** `../TIL`, `../wordbank` 폴더를 직접 문서 소스로 사용 (단일 소스 유지)
  - til-note / wordbank 스킬이 쓰는 위치 그대로 → 앞으로 노트만 쌓으면 사이트에 자동 반영
- 랜딩 페이지: `TIL/index.md`(신규, slug:/), `wordbank/wordbank.md`(상단 frontmatter 추가)
- 데모 콘텐츠(blog, docs/intro 등) 제거, 홈 CTA 링크 수정
- GitHub Actions 배포 워크플로우 `.github/workflows/deploy.yml` 작성
- 로컬 검증: `npm run build` 성공 + `npm run serve` HTTP 200 + 본문 렌더 확인
- gh CLI 설치(회사 PC, v2.93.0) — 단 **로그인은 아직 안 함**

## 핵심 설정값 (docusaurus.config.js)

| 항목 | 값 |
|---|---|
| url | `https://chanyoze.github.io` |
| baseUrl | `/TIL/` |
| organizationName / projectName | `chanyoze` / `TIL` |
| 배포 URL | `https://chanyoze.github.io/TIL/` |
| docs 인스턴스 1 (TIL) | path=`../TIL`, routeBasePath=`til`, sidebar=`tutorialSidebar` |
| docs 인스턴스 2 (단어장) | path=`../wordbank`, routeBasePath=`wordbank`, sidebar=`wordbankSidebar`, pluginId=`wordbank` |
| i18n | `ko` / blog | 비활성 |

---

## 🏠 집 PC에서 이어받는 법

```powershell
cd C:\study
git pull

# node_modules 는 커밋 안 됨(.gitignore) → 집에서 한 번 설치 필요
cd website
npm install

# 로컬 미리보기
npm start          # http://localhost:3000/TIL/ 열림 (개발 서버)
# 또는 프로덕션 빌드 검증
npm run build
npm run serve      # http://localhost:3000/TIL/
```

> ⚠️ 개발 서버(`npm start`)는 `website/` **밖**(../TIL, ../wordbank) 파일 변경을 hot-reload 못 할 수 있음. 콘텐츠 바꾸면 서버 재시작 또는 `build`로 확인.

---

## ⏭️ 남은 일 — 배포(Phase 3)

집/회사 아무 데서나 이어서 진행 가능:

1. **gh 로그인** (새 터미널): `gh auth login` → GitHub.com → HTTPS → Login with a web browser
2. **레포 public 확인**: `gh repo view chanyoze/TIL --json visibility`
   - GitHub Pages 무료는 **public 레포 필수** (private이면 Pro 필요)
3. **GitHub 레포 Settings → Pages → Source = "GitHub Actions"** 로 설정 (GUI, 1회만)
4. main 에 push 되어 있으면 Actions가 자동으로 빌드→배포
   - 진행 상황: 레포 **Actions** 탭에서 확인
   - 완료 후 `https://chanyoze.github.io/TIL/` 접속 확인

---

## 자주 쓰는 명령어

```powershell
cd C:\study\website
npm start            # 개발 서버
npm run build        # 프로덕션 빌드(배포 전 검증)
npm run serve        # 빌드 결과 로컬 서빙
```

## 파일 위치 메모

- 설정: `website/docusaurus.config.js`
- 사이드바: `website/sidebars.js`(TIL), `website/sidebarsWordbank.js`(단어장)
- 홈페이지: `website/src/pages/index.js`
- 배포 워크플로우: `.github/workflows/deploy.yml`
- 콘텐츠 소스: `TIL/*.md`, `wordbank/wordbank.md`
