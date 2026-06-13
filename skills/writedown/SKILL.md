---
name: writedown
description: 정리가 필요한 내용(오늘 배운 것·용어·주제 메모 등)을 기록할 때 사용한다. 한 번의 입력을 raw(충실 기록 — 기계·검색·AI·아카이브용)와 readable(사람이 읽기 좋게 다듬은 글 — Docusaurus 사이트 게시용) 두 버전으로 파생 저장한다. 기존 til-note(날짜별 학습기록)·wordbank(단어장)를 통합한 단일 지식 입력 스킬. 기록 위치는 `C:\study\note`(= chanyoze/TIL 레포)이며 Docusaurus 사이트(`/docs/TIL`·`/docs/wordbank` 등)에 자동 반영된다.
when_to_use: 호출 예 — "writedown", "이거 정리해줘", "오늘 배운 거 raw랑 읽기용으로 남겨줘", "이 용어 단어장에 추가하고 정리", "이 주제 글로 다듬어서 기록"
argument-hint: "[til|wordbank|note|todo] [주제]  (생략 시 내용 보고 자동 판별)"
user-invocable: true
disable-model-invocation: false
---

# writedown — raw + readable 이중 지식 노트

정리할 내용을 받아 **두 버전으로 파생**한다. 핵심 원칙: MD는 기계가 읽기 좋은 포맷이고, 사람이 읽기 좋은 글은 따로 다듬어야 한다는 전제.

| 버전 | 성격 | 위치 | 용도 |
|---|---|---|---|
| **raw** | 사용자가 준 내용을 **충실히** 보존(거의 그대로 + 최소 메타) | `raw/…` | 단일 진실·검색·AI 참조·아카이브 |
| **readable** | 사람이 **읽기 좋게 재구성**(도입·소제목·예시·흐름) | `vault/…` (예: `TIL/` · `단어장/<분야>` · `회사/…`) | Docusaurus 사이트(`/docs`) 게시(읽기용) |

> 이 스킬은 기존 `til-note`·`wordbank`를 **대체**한다. 두 스킬이 하던 일(날짜별 학습기록·단어 누적)을 카테고리로 흡수하되, 항상 raw+readable 2층으로 남긴다.

---

## 카테고리 (자동 판별 + 사용자 지정)

콘텐츠는 **단일 볼트 `vault/`** (Docusaurus 단일 docs 트리, 폴더=카테고리)에 readable을 두고, raw는 `raw/`에 보관한다.

| 카테고리 | 언제 | readable 위치 | raw 위치 |
|---|---|---|---|
| `til` | "오늘 배운 것"·날짜 기준 학습 기록 | `vault/TIL/YYYY-MM/YYYY-MM-DD.md` | `raw/til/YYYY-MM-DD.md` |
| `wordbank` | 용어/단어 + 설명 누적 | `vault/단어장/<분야>.md` (분야 파일에 append) | `raw/wordbank.md` (append) |
| `note` | 특정 주제를 정리한 글 | `vault/<카테고리경로>/<slug>.md` | `raw/notes/<slug>.md` |
| `todo` | 금주/금일 할 일 + **마감(deadline) 할 일** (메인 페이지 위젯) | `website/src/data/todos.json` | 없음(상태 데이터, raw 미생성) |

- `note`의 `<카테고리경로>`는 사용자의 주제 분류다(예: `회사/문서관리`). 해당 폴더가 없으면 만들고, 새 카테고리면 `_category_.json`(label 한글, 필요 시 `link.slug` ASCII)도 같이 생성한다 → 사이드바에 자동 추가(옵시디언식).
- `todo`는 raw+readable 이중구조가 **아니다**(글이 아니라 상태). `website/src/data/todos.json` 한 파일만 갱신하며, 메인 페이지 좌우 레이아웃 오른쪽 카드(📌 금주 / 🔥 금일)에 바로 반영된다.
- 인자로 명시하지 않으면 내용을 보고 판별한다(단어 1~수개+짧은 뜻 → wordbank, 날짜·"오늘 배움" → til, "할 일·금주·금일·todo·~하기" → todo, 그 외 주제 설명 → note + 어느 카테고리인지 1회 확인). 애매하면 한 번만 되묻는다.

---

## 동작 절차

1. **입력 파악** — 사용자가 준 내용 + 카테고리 결정. 정보가 부족하면 1~2개만 간단히 되묻는다(주제·날짜 등).
2. **공개 게시 여부 확인** ⚠️ — 이 레포(chanyoze/TIL)는 **public**이라 `vault/`에 넣는 readable은 **사이트뿐 아니라 GitHub 소스에서도 누구나** 보게 된다. 기록 시작 전 **한 번 확인한다**: "이 내용은 공개 사이트(+GitHub 소스)에 그대로 올라가는데 진행할까요?" — 민감해 보이는 내용(개인정보·회사기밀 등)이면 특히 확실히 짚는다. 사용자가 **아니오/비공개**면 vault에 쓰지 말고 어떻게 할지(로컬 보관·다른 위치 등) 지시를 받는다. **공개 처리는 사용자가 직접 컨트롤한다 — 임의로 vault에 올리지 않는다.**
3. **raw 저장** — `raw/…`에 **충실 버전** 기록. 사용자의 표현을 보존하고, 상단에 frontmatter(생성일·출처·태그)만 덧붙인다. 군더더기 정리·재작성 금지.
4. **readable 생성** — 같은 내용을 **읽기 좋게 재구성**해 볼트(`vault/…`)에 기록(아래 §readable 작성 규칙). *(2단계에서 공개 OK를 받은 경우에만)*
5. **단어장 자동 연계** 📖 — `til`/`note`면 본문에 처음 등장한 전문용어·약어를 추려 단어장에 없는 것만 추가 제안/반영한다(아래 §단어장 자동 연계).
6. **상호 링크** — 양쪽 frontmatter에 짝 파일 경로를 적어 추적 가능하게 한다.
7. **빌드 검증** 🔧 — 저장 후 `cd website && npm run build`를 돌려 frontmatter·`_category_.json`·`todos.json` 깨짐을 확인한다(특히 til frontmatter·todo JSON 문법). 실패하면 고치고 통과시킨 뒤에 커밋한다.
8. **커밋·반영** — 파일들을 stage → 커밋 → push 하면 Docusaurus 배포 워크플로가 자동으로 사이트를 갱신한다(아래 §커밋). push 전 공개 게시를 한 번 더 확인했는지 점검.

---

## readable 작성 규칙 (사람이 읽기 좋게)

- 한 문단 도입(왜/무엇) → `##` 소제목으로 흐름 → 핵심은 bullet, 코드/명령은 코드블록.
- 약어·전문용어는 처음 등장 시 한 줄 풀이. 예시를 1개 이상.
- raw의 단편적 메모를 **완결된 설명**으로 잇되, 사실을 바꾸지 않는다(추측 추가 금지 — 모르면 "확인 필요"로 남김).
- Docusaurus 호환 frontmatter 필수:
  - `til`: 월별 폴더 `vault/TIL/YYYY-MM/`에 두고 frontmatter `title: "YYYY-MM-DD / 내용"`로 **제목 양식 통일**(본문 첫 h1은 생략 → Docusaurus가 title을 h1로 렌더). 새 달이면 `vault/TIL/<YYYY-MM>/_category_.json`(label `📅 YYYY-MM`)도 생성.
  - `note`: `title`, `sidebar_label`, 필요 시 `sidebar_position`.
  - `wordbank`: **분야별 파일** `vault/단어장/<분야>.md`에 항목을 `- **용어**: 설명` bullet으로 append(파일 상단 frontmatter 유지). 적합한 분야 파일(cicd·infra·java-build·code-quality·testing·frontend·ai·etc 등)에 넣고, 새 분야면 새 `<slug>.md`(frontmatter `title`/`sidebar_label`에 이모지+분야명, 다음 `sidebar_position`)를 만든다. 단어장은 `vault/단어장/_category_.json`(generated-index, slug `/wordbank`)로 묶인 폴더다. 어느 분야인지 애매하면 한 번만 되묻는다.

## 단어장 자동 연계 (til·note → wordbank) 📖

`til`/`note`의 readable을 만들 때, 학습기록과 용어집이 **함께 쌓이도록** 새 용어를 줍는다.

1. **후보 추출** — 본문에서 처음 등장한 약어(대문자·CamelCase: `MCP`, `SSR` 등)·전문용어 중 "한 줄 풀이가 필요한 것"을 고른다.
2. **중복 확인** — `vault/단어장/**`를 grep(또는 Grep 도구)으로 훑어 **이미 있는 용어는 건너뛴다**. 표기 흔들림(대소문자·괄호)도 같은 것으로 본다.
3. **제안/반영** — 남은 후보를 한 번에 3~5개로 추려 "이 용어들 단어장에 추가할까요?"로 제안한다. 사용자가 OK이거나 명백한 표준 용어면 적합 분야 파일(§wordbank 규칙: cicd·java-build·ai·etc 등)에 `- **용어**: 설명`으로 append.
4. **경계** — raw는 건드리지 않는다(단어장은 readable 계열). 너무 지엽적이거나 일회성 단어는 넣지 않는다. 분야가 애매하면 한 번만 되묻는다.

## todo 작성 규칙 (금주/금일 할 일)

메인 페이지 우측 카드에 뜨는 할 일 목록. **`website/src/data/todos.json` 한 파일만** 편집한다(raw 미생성).

```json
{
  "updated": "YYYY-MM-DD",
  "week":  [ { "text": "할 일 내용", "done": false } ],
  "today": [ { "text": "할 일 내용", "done": false } ],
  "deadlines": [ { "text": "할 일 내용", "due": "YYYY-MM-DD", "done": false } ]
}
```

- **추가**: "금주 할 일에 X 추가" → `week`에, "금일/오늘 X" → `today`에 `{ "text": "X", "done": false }` push. 범위가 불명확하면 한 번만 되묻는다.
- **마감 할 일**: "언제까지 X 해야 해" / "X를 MM/DD까지" → `deadlines`에 `{ "text": "X", "due": "YYYY-MM-DD", "done": false }` push. `due`는 필수 — 없으면 한 번 되묻는다. 시각이 있으면 `due`에 `YYYY-MM-DDTHH:mm`까지. **캘린더 등록은 위젯이 자동 처리**(아래 §구글 캘린더 등록).
- **완료**: 사용자가 "X 끝냈어/완료" → 해당 항목 `done: true`로. 항목 텍스트가 부분만 일치해도 가장 가까운 것 1개를 매칭(애매하면 확인).
- **삭제/정리**: "X 지워줘", "금일 비워줘" → 해당 항목/배열 제거.
- **날짜 갱신**: 어떤 변경이든 `updated`를 오늘 날짜(`currentDate`)로 바꾼다.
- **주간 롤오버**: 새 주가 시작돼 "금주 새로 시작" 류 요청이면 완료된 `week` 항목을 정리하고 미완료만 남긴다(임의 삭제 금지 — 확인 후).
- JSON 문법 유지(후행 콤마 금지). 편집 후 `npm run build`로 깨지지 않는지 확인 권장.

## 구글 캘린더 등록 (deadline) — 추가 링크 방식 📅

마감 할 일은 **OAuth 없이** 구글 캘린더에 넣는다. 방식: "캘린더 추가 링크(TEMPLATE URL)"를 만들면 사용자가 **클릭→저장 한 번**으로 등록되고, 등록된 일정에 **구글 기본 알림이 붙어** 구글이 알림을 보낸다(Claude는 상주 못 하므로 알림 주체가 아니다).

- **메인 위젯이 자동 생성** — `index.js`의 `DeadlineBlock`이 `deadlines`의 `text`+`due`로 **캘린더 추가 링크를 동적으로 만든다**. 그래서 스킬은 todos.json `deadlines`에 `{text, due, done}`만 정확히 기록하면 된다(별도 링크/ID 필드 불필요).
- **대화로도 즉시 제시 가능** — 사용자가 "지금 캘린더에 바로 넣게 링크 줘"라고 하면 직접 만들어 준다:
  - 종일: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=<할일>&dates=<YYYYMMDD>/<다음날YYYYMMDD>`
  - 시각 지정: `dates=<YYYYMMDDTHHmmSS>/<+30~60분 YYYYMMDDTHHmmSS>` (로컬시간)
  - `text`는 URL 인코딩한다.
- **완전 자동 등록**(클릭 없이)을 원하면 그때 구글 캘린더 OAuth MCP를 셋업한다(선택 — 단계 많음).

## raw 작성 규칙 (충실)

- 사용자 입력 원문 우선 보존. 오타·줄바꿈 정도만 정리.
- frontmatter: `created: YYYY-MM-DD`, `category`, `tags`, `readable: ../<readable 경로>`.
- 재구성·요약 금지 — raw는 "원천"이다.

---

## 파일 위치 규칙

```
note/                          (= chanyoze/TIL 레포)
├── vault/                     ← readable 단일 볼트 (Docusaurus가 /docs 로 서빙, 폴더=카테고리)
│   ├── intro.md               ← 볼트 시작 문서
│   ├── TIL/                   ← 날짜 학습기록 (/docs/TIL), 월별 폴더로 세분
│   │   └── YYYY-MM/YYYY-MM-DD.md   (frontmatter title: "YYYY-MM-DD / 내용")
│   ├── 단어장/                 ← 용어장 (분야별 파일, _category_.json → /docs/wordbank)
│   │   ├── cicd.md  infra.md  java-build.md  code-quality.md
│   │   └── testing.md  frontend.md  ai.md  etc.md(도구·환경)  (분야별 append)
│   └── <카테고리>/             ← 주제별 (예: 회사/문서관리/, _category_.json 라벨)
│       └── <slug>.md
├── raw/                       ← raw 버전 (사이트 비게시, 아카이브)
│   ├── til/YYYY-MM-DD.md
│   ├── wordbank.md
│   └── notes/<slug>.md
└── website/                   ← Docusaurus 앱
    └── src/data/todos.json    ← todo 카테고리만 여기 편집(금주/금일, 메인 페이지 위젯). 그 외 website/는 건드리지 않음
```

- `raw/`·새 카테고리 폴더는 처음 사용 시 생성한다.
- 날짜는 사용자 환경의 오늘 날짜(`currentDate`)를 쓴다. 같은 날짜 til 파일이 있으면 **append**(덮어쓰기 금지).
- `<slug>`는 영문 소문자+하이픈(주제 요약). 카테고리 폴더명은 한글 가능(사이드바 라벨), URL 깔끔하게 하려면 `_category_.json`의 `link.slug`를 ASCII로.

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
