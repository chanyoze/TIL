# 진행기록 — 문서 색인 & 관리 안내

이 폴더는 **작업 단위(주제)별 진행 문서** 모음이다.
(예전엔 `YYYY-MM-DD.md` 날짜별이었으나, 주제별 파일로 전환했다.)

## 문서 지도 (전체)

```
Seongbuk-Senior-Club-Entrance-Helper-2/
├── README.md                  프로젝트 소개 (무엇을 하는 앱인가, GitHub 첫 화면)
└── 진행기록/                   ← 모든 문서 (전략 + 작업 단위별 실행 기록)
    ├── README.md              (이 파일) 색인 + 관리 규칙
    ├── ci_cd_master_plan.md   전략 — Phase 1~5 큰 그림 (장기 계획)
    ├── refactoring.md         코드 리팩토링 회고 (v1 원본 → v1.1 → v1.2)
    ├── setup.md               환경 구축 (Git 연결·JDK 설치·로컬 빌드 검증)
    ├── gradle.md              Gradle 마이그레이션 (빌드 표준화)
    ├── tests.md               테스트 (JUnit 5 단위 테스트)
    ├── ci.md                  CI (GitHub Actions 자동 빌드·테스트)
    ├── cd.md                  CD (태그 push → exe → Releases 자동 배포)
    └── pages.md               배포 페이지 (GitHub Pages 다운로드)
```

## 역할 구분

| 문서 | 성격 | 내용 |
|---|---|---|
| 루트 `README.md` | 소개 | 앱이 무엇인지, 왜 만들었는지 |
| `ci_cd_master_plan.md` | **전략** | 앞으로 갈 전체 그림(Phase 1~5). "어디로 가는가" |
| `진행기록/*.md` | **실행 기록** | 각 작업에서 실제로 뭘 했고 뭐가 달라졌나. "무엇을 했는가" |

## 작성 규칙

- **작업 단위 1개 = md 파일 1개.** 파일명은 주제(소문자, 예: `gradle.md`, `tests.md`).
- 각 문서 권장 구성: **왜 했나 / 무엇이 달라졌나(Before→After) / 구체적으로 한 일 / 검증 결과 / 메모**.
- 날짜는 문서 안에 적되, 파일명에는 쓰지 않는다.

## 로드맵 진행 현황

| 단계 | 주제 | 문서 | 상태 |
|---|---|---|---|
| 0 | 환경 구축 | [setup.md](setup.md) | ✅ 완료 |
| 1 | 빌드 표준화 (Gradle) | [gradle.md](gradle.md) | ✅ 완료 |
| 2 | 테스트 (JUnit) | [tests.md](tests.md) | ✅ 완료 |
| 3 | CI (GitHub Actions) | [ci.md](ci.md) | ✅ 완료 (PR에서 첫 실행 확인) |
| 4 | CD (jpackage → Releases) | [cd.md](cd.md) | ✅ 완료 (v1.1.0 발행, EntranceHelper.zip 25.9MB) |
| 5 | 배포 페이지 (GitHub Pages) | [pages.md](pages.md) | ✅ 완료 (게시·다운로드·실행 확인) |
| — | 코드 리팩토링 (선행 작업) | [refactoring.md](refactoring.md) | ✅ 완료 |

## 참고

- `refactoring.md` 안의 일부 파일 링크는 **Gradle 마이그레이션 이전 경로**(`src/app/`) 기준이라, 현재 위치(`src/main/java/app/`)와 다를 수 있다. (회고 문서라 당시 기준 그대로 둠)
- Docker는 이 프로젝트에서 쓰지 않으며, 별도 컴패니언 프로젝트로 다룰 예정 → `refactoring.md` 7장 참고.
