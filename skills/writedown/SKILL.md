---
name: writedown
description: 정리가 필요한 내용(오늘 배운 것·용어·주제 메모 등)을 기록할 때 사용한다. 한 번의 입력을 raw(충실 기록 — 기계·검색·AI·아카이브용)와 readable(사람이 읽기 좋게 다듬은 글 — Docusaurus 사이트 게시용) 두 버전으로 파생 저장한다. 기존 til-note(날짜별 학습기록)·wordbank(단어장)를 통합한 단일 지식 입력 스킬. 기록 위치는 `C:\study\note`(= chanyoze/TIL 레포)이며 Docusaurus 사이트(/til, /wordbank)에 자동 반영된다.
when_to_use: 호출 예 — "writedown", "이거 정리해줘", "오늘 배운 거 raw랑 읽기용으로 남겨줘", "이 용어 단어장에 추가하고 정리", "이 주제 글로 다듬어서 기록"
argument-hint: "[til|wordbank|note] [주제]  (생략 시 내용 보고 자동 판별)"
user-invocable: true
disable-model-invocation: false
---

# writedown — raw + readable 이중 지식 노트

정리할 내용을 받아 **두 버전으로 파생**한다. 핵심 원칙: MD는 기계가 읽기 좋은 포맷이고, 사람이 읽기 좋은 글은 따로 다듬어야 한다는 전제.

| 버전 | 성격 | 위치 | 용도 |
|---|---|---|---|
| **raw** | 사용자가 준 내용을 **충실히** 보존(거의 그대로 + 최소 메타) | `raw/…` | 단일 진실·검색·AI 참조·아카이브 |
| **readable** | 사람이 **읽기 좋게 재구성**(도입·소제목·예시·흐름) | `TIL/` · `wordbank/` | Docusaurus 사이트 게시(읽기용) |

> 이 스킬은 기존 `til-note`·`wordbank`를 **대체**한다. 두 스킬이 하던 일(날짜별 학습기록·단어 누적)을 카테고리로 흡수하되, 항상 raw+readable 2층으로 남긴다.

---

## 카테고리 (자동 판별 + 사용자 지정)

| 카테고리 | 언제 | readable 위치 | raw 위치 |
|---|---|---|---|
| `til` | "오늘 배운 것"·날짜 기준 학습 기록 | `TIL/YYYY-MM-DD.md` | `raw/til/YYYY-MM-DD.md` |
| `wordbank` | 용어/단어 + 설명 누적 | `wordbank/wordbank.md` (append) | `raw/wordbank.md` (append) |
| `note` | 특정 주제를 정리한 글 | `TIL/<slug>.md` | `raw/notes/<slug>.md` |

인자로 명시하지 않으면 내용을 보고 판별한다(단어 1~수개+짧은 뜻 → wordbank, 날짜·"오늘 배움" → til, 그 외 주제 설명 → note). 애매하면 사용자에게 한 번만 되묻는다.

---

## 동작 절차

1. **입력 파악** — 사용자가 준 내용 + 카테고리 결정. 정보가 부족하면 1~2개만 간단히 되묻는다(주제·날짜 등).
2. **raw 저장** — `raw/…`에 **충실 버전** 기록. 사용자의 표현을 보존하고, 상단에 frontmatter(생성일·출처·태그)만 덧붙인다. 군더더기 정리·재작성 금지.
3. **readable 생성** — 같은 내용을 **읽기 좋게 재구성**해 사이트 위치(`TIL/`·`wordbank/`)에 기록(아래 §readable 작성 규칙).
4. **상호 링크** — 양쪽 frontmatter에 짝 파일 경로를 적어 추적 가능하게 한다.
5. **커밋·반영** — 두 파일을 stage → 커밋 → push 하면 Docusaurus 배포 워크플로가 자동으로 사이트를 갱신한다(아래 §커밋).

---

## readable 작성 규칙 (사람이 읽기 좋게)

- 한 문단 도입(왜/무엇) → `##` 소제목으로 흐름 → 핵심은 bullet, 코드/명령은 코드블록.
- 약어·전문용어는 처음 등장 시 한 줄 풀이. 예시를 1개 이상.
- raw의 단편적 메모를 **완결된 설명**으로 잇되, 사실을 바꾸지 않는다(추측 추가 금지 — 모르면 "확인 필요"로 남김).
- Docusaurus 호환 frontmatter 필수:
  - `til`/`note`: `title`, `sidebar_label`, (til은) `sidebar_position` 또는 날짜.
  - `wordbank`: 파일 상단 frontmatter는 유지하고 항목만 `## 용어` 형태로 append.

## raw 작성 규칙 (충실)

- 사용자 입력 원문 우선 보존. 오타·줄바꿈 정도만 정리.
- frontmatter: `created: YYYY-MM-DD`, `category`, `tags`, `readable: ../<readable 경로>`.
- 재구성·요약 금지 — raw는 "원천"이다.

---

## 파일 위치 규칙

```
note/                         (= chanyoze/TIL 레포, Docusaurus가 TIL/·wordbank/ 서빙)
├── raw/                      ← raw 버전(사이트 비게시, 아카이브)
│   ├── til/YYYY-MM-DD.md
│   ├── wordbank.md
│   └── notes/<slug>.md
├── TIL/                      ← readable 학습기록·주제글 (사이트 /til)
│   ├── YYYY-MM-DD.md
│   └── <slug>.md
└── wordbank/wordbank.md      ← readable 단어장 (사이트 /wordbank)
```

- `raw/`는 새 폴더다. 처음 사용 시 생성한다.
- 날짜는 사용자 환경의 오늘 날짜(`currentDate`)를 쓴다. 같은 날짜 til 파일이 있으면 **append**(덮어쓰기 금지).
- `<slug>`는 영문 소문자+하이픈(주제 요약).

---

## 커밋 (note 레포 규칙)

- 형식: `날짜 / 이름 / 요청자 / 1줄 요약` (이 레포는 **4-part**. 예: `2026-06-13 / 이찬호 / - / writedown: <주제> raw+readable 기록`).
- raw + readable 두 파일을 함께 stage. `website/`·`node_modules`·로그는 제외.
- 한글 깨짐 방지: 메시지를 `.git/CMSG.txt`에 UTF-8로 쓰고 `git commit -F`. 첫 줄이 `YYYY-MM-DD /`로 시작하면 githook이 건드리지 않음.
- push 후 사이트 갱신은 GitHub Actions가 자동 처리(1~2분). 사용자가 "push까지" 명시할 때만 push(아니면 커밋까지).

---

## 통합 안내 (til-note · wordbank 대체)

- 이 스킬이 두 스킬의 역할을 흡수한다. `til` 카테고리 = 구 til-note, `wordbank` 카테고리 = 구 wordbank.
- 단, 이제는 **항상 raw+readable 2버전**을 남긴다(기존엔 readable 한 버전만).
- 구 스킬 제거는 사용자 승인 후. (정본은 `C:\study\note\skills\writedown`, 전역 미러는 `~/.claude/skills/writedown` — 수정 시 동기화.)
