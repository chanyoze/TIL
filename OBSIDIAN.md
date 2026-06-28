# 옵시디언 + Docusaurus 공존 가이드

이 저장소(`chanyoze/TIL`)는 **같은 마크다운 파일**을 두 입구로 쓴다.

- **Docusaurus (GitHub Pages)** — 공개 발행 담당. `vault/`를 사이트로 배포. (변경 없음)
- **Obsidian** — 로컬 편집·백링크·그래프·검색 담당. `vault/` + `raw/`를 한 화면에서 본다.

## 처음 한 번만 (각 PC에서)

1. Obsidian 설치 → **"폴더를 보관소로 열기(Open folder as vault)"** → **이 레포 폴더**(`C:\study\note`) 선택.
2. 끝. `.obsidian/` 설정이 이미 커밋돼 있어 링크·제외·첨부 설정이 자동 적용된다.

## 이미 맞춰둔 설정 (`.obsidian/app.json`)

- **위키링크 끔 / 표준 상대경로 링크** (`useMarkdownLinks: true`, `newLinkFormat: relative`)
  → 옵시디언에서 만든 링크가 **Docusaurus에서도 그대로 작동**한다. (`[[ ]]` 쓰면 빌드가 깨지니 쓰지 말 것)
- **제외 폴더**: `website/`, `node_modules/`, `build/`, `.git/`, `antigravity-sync/` (인덱싱 노이즈 차단)
- **첨부 폴더**: `vault/_attachments` (루트 오염 방지)

## 역할 분담

| 작업 | 도구 |
|---|---|
| 구조적 기록(raw+readable), 단어장, 할일, 발행 | **writedown (Claude)** — 지금처럼 |
| 빠른 메모·수정, 문서 연결(백링크), 그래프 탐색, 검색 | **Obsidian** (로컬) |

옵시디언에서 파일을 고치면 그냥 마크다운이 바뀌는 것이라, 다음 커밋·배포에 자연히 반영된다.

## 주의

- **위키링크 금지** — 문서 간 링크는 `[텍스트](./파일.md)` 형식만. (Docusaurus 호환)
- `.obsidian/workspace.json`·캐시는 PC별이라 `.gitignore` 처리됨(공유 설정만 커밋).
- 이 파일(`OBSIDIAN.md`)은 레포 루트에 있어 **사이트에는 발행되지 않는다**(Docusaurus는 `vault/`만 서빙).
