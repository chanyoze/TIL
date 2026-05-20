# 단어장 (wordbank) & 학습 노트

개인 학습용 저장소. 회사/집 PC 간 git으로 동기화한다.
저장소: `github.com/chanyoze/wordbank` (비공개)

## 단어장 — `wordbank.md`
공부할 단어/용어를 카테고리별로 모아두는 단어장. Claude Code의 `wordbank` 스킬로 관리한다.
- **형식**: `## 카테고리` 섹션 아래 `- **단어**: 설명`
- **중복 처리**: 같은 단어는 의미 있는 차이가 있을 때만 갱신(아니면 skip)
- **카테고리 예**: CI/CD, 컨테이너, AWS, AI, 개발

## 구성
- `wordbank.md` — 단어장
- `TIL/` — 날짜별 학습 일지 (`til-note` 스킬)
- `claude-code-skill-guide.md` — 스킬 만들기 공부 노트
- `antigravity-sync/` — Antigravity 설정 이전용 번들 (동기화 제외, `.gitignore`)

## 동기화 방법
- 시작 전: `git -C "C:\study" pull`
- 변경 후: `git -C "C:\study" add -A` → `commit` → `push`
- 인증: PC별 SSH 키 (`~/.ssh/id_ed25519`, passphrase 없음)

## 변경 이력
- **2026-05-21**: 단어장 자동 동기화 기능 추가. `wordbank` 스킬이 단어를 추가/갱신하면 자동으로 `pull → commit → push` 하도록 함. 이 변경 사항을 함께 커밋함.
