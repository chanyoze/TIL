# 배포 페이지 (5단계 · GitHub Pages)

> 복지관 직원이 GitHub 코드 화면 대신, **깔끔한 웹페이지에서 버튼 한 번으로** 최신 exe(zip)를 받게 한다.
> 작업일: 2026-05-25 · 브랜치: `feature/pages` · 이전 단계: [cd.md](cd.md)

## 1. 왜 하나

CD(4단계)로 릴리스가 GitHub Releases에 자동으로 올라가지만, 일반 사용자에게 "GitHub Releases 탭에서 받으세요"는 불친절하다. **다운로드 버튼 하나짜리 정적 웹페이지**를 무료(GitHub Pages)로 띄워 진입 장벽을 없앤다.

## 2. 무엇이 생겼나

- **`docs/index.html`** — 단일 HTML(인라인 CSS) 랜딩 페이지
  - 제목/설명 + **[최신 버전 다운로드] 버튼** + 사용법 3단계 + 릴리스/소스 링크
  - 다운로드 버튼 링크: `https://github.com/chanyoze/Seongbuk-Senior-Club-Entrance-Helper/releases/latest/download/EntranceHelper.zip`
    - **버전 없는 고정 URL** → 새 릴리스가 나와도 항상 "최신"을 가리킴 (CD에서 zip 이름을 버전 없이 ASCII로 둔 이유가 여기서 빛남)

## 3. Pages 활성화 방법 (GitHub 웹)

> 저장소 설정 변경이라 **웹에서 직접** 해야 함 (git으론 불가).

1. 저장소 → **Settings** → 왼쪽 **Pages**
2. **Build and deployment → Source:** `Deploy from a branch`
3. **Branch:** `v2` 선택, 폴더 **`/docs`** 선택 → **Save**
4. 1~2분 뒤 상단에 게시 주소가 뜸:
   `https://chanyoze.github.io/Seongbuk-Senior-Club-Entrance-Helper/`

## 4. 확인

- 위 주소 접속 → 다운로드 페이지가 보이는지
- **[최신 버전 다운로드]** 클릭 → `EntranceHelper.zip`(~26MB)이 받아지는지
- 압축 풀고 `EntranceHelper.exe` 실행 확인

## 5. 메모

- 공개 저장소라 Pages·릴리스 다운로드가 무료·무인증으로 동작. (비공개였다면 유료 플랜/접근 제한 필요)
- 페이지는 `docs/`의 정적 파일이라, 내용 바꾸려면 `docs/index.html` 수정 → v2에 머지하면 Pages가 자동 재배포.
- `docs/` 폴더는 Pages 전용 — CI/CD 산출물과 무관.
- README 상단에 다운로드 페이지·최신 zip 링크를 추가함(방문자가 바로 받게).
