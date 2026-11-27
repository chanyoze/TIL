# Obsidian 으로 이 저장소 열기

이 저장소(`C:\study`, `chanyoze/TIL`)는 **공개 사이트용 보관함**이다. `vault/` 아래 마크다운만 Docusaurus 로 빌드돼 GitHub Pages 에 나가고, 저장소 자체도 공개다. Obsidian 은 이 마크다운을 로컬에서 고치고 찾아보는 입구로 쓴다.

## 보관함은 두 개다

| 보관함 | 경로 | 담는 것 | 공개 |
|---|---|---|---|
| 이 저장소 | `C:\study` | 사이트에 올리려고 다시 쓴 글(readable) — `vault/` | 공개 |
| RAW-DOC | `C:\RAW-DOC` (`chanyoze/RAW-DOC`) | 원문(raw), 회사 작업 산출물, 개인 스킬 | 비공개 |

- 두 보관함은 Obsidian 에서 **각각 따로** 연다(보관함 전환). 한 화면에 합치지 않는다.
- 두 보관함 사이의 연결은 글 frontmatter 의 `raw: RAW-DOC:…` · `source: RAW-DOC:…` 표기로만 남는다. 이건 출처를 적어 둔 글자일 뿐이라 Obsidian 에서 눌러 열리지 않는다. RAW-DOC 쪽에서는 `readable: study:vault/…` 로 이 저장소의 글을 가리킨다.
- 무엇을 공개해도 되는지, raw 와 readable 을 어떻게 나눠 쓰는지는 `writedown` 스킬의 공개 기준을 따른다. 회사 산출물 원문은 이 저장소에 두지 않는다.

## 처음 한 번 (PC 마다)

1. Obsidian → **폴더를 보관함으로 열기** → `C:\study` 선택.
2. `.obsidian/app.json` 이 커밋돼 있어 링크 · 제외 · 첨부 설정은 그대로 적용된다.
3. 원문을 볼 일이 있으면 `C:\RAW-DOC` 을 별도 보관함으로 연다.

## 맞춰 둔 설정 (`.obsidian/app.json`)

- **위키링크 끔, 상대경로 마크다운 링크** (`useMarkdownLinks: true`, `newLinkFormat: relative`) — Obsidian 에서 만든 링크가 Docusaurus 에서도 그대로 동작한다.
- **제외 폴더**: `website/`(사이트 코드 · 빌드 산출물), `.git/`.
- **첨부 폴더**: `vault/_attachments` — 붙여 넣은 이미지가 여기에 생긴다.

## 지킬 것

- **위키링크(`[[ ]]`) 금지.** 글 사이 링크는 `[텍스트](./파일.md)` 같은 상대경로만 쓴다. 위키링크는 사이트 빌드에서 깨진다.
- 사이드바 라벨과 순서는 폴더의 `_category_.json` 과 글의 `sidebar_position` 으로 정한다.
- `.obsidian/workspace.json` 과 캐시는 PC 마다 달라 `.gitignore` 로 뺐다. 공유 설정만 커밋한다.
- 이 파일은 저장소 루트에 있어 사이트에는 나가지 않는다(사이트는 `vault/` 만 쓴다). 저장소가 공개라 GitHub 에서는 보인다.
