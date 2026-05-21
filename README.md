# TIL — 학습 노트 모음

개인 학습용 저장소(폴더명은 `C:\study`, GitHub 저장소명은 `TIL`). 회사/집 PC 간 git으로 동기화한다.
저장소: `github.com/chanyoze/TIL` (비공개)

## 구성
- `wordbank/` — 단어장 폴더
  - `wordbank.md` — 카테고리별 용어집 (`wordbank` 스킬로 관리)
- `TIL/` — 날짜별 학습 일지 폴더 (`til-note` 스킬로 관리)
  - `YYYY-MM-DD.md`
- `skills/` — 위 스킬들의 SKILL.md 사본 (집 PC 동기화용)
- `claude-code-skill-guide.md` — 스킬 만들기 공부 노트
- `antigravity-sync/` — Antigravity 설정 이전용 번들 (동기화 제외, `.gitignore`)

## 단어장 (wordbank/wordbank.md)
공부할 단어/용어를 카테고리별로 모아두는 단어장.
- **형식**: `## 카테고리` 섹션 아래 `- **단어**: 설명`
- **중복 처리**: 같은 단어는 의미 있는 차이가 있을 때만 갱신(아니면 skip)
- **자동 동기화**: 단어 추가 시 스킬이 `pull → commit → push`를 자동 수행

## 동기화 방법
- 시작 전: `git -C "C:\study" pull`
- 변경 후: `git -C "C:\study" add -A` → `commit` → `push`
- 인증: PC별 SSH 키 (`~/.ssh/id_ed25519`, passphrase 없음)
- 커밋 메시지 형식: `<날짜> / 이찬호 / <요청자(없으면 -)> / <1줄 요약>`

## 변경 이력
- **2026-05-21**: 단어장 자동 동기화(commit·push) 기능 추가.
- **2026-05-21**: GitHub 저장소명을 `TIL`로 변경하고, TIL·wordbank를 각각 폴더로 분리. (`wordbank.md` → `wordbank/wordbank.md`)
