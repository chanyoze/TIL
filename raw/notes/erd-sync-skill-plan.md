---
created: 2026-06-19
category: note
tags: [skill, erd, oracle, vuerd, db-sync, ai-rnd]
readable: ../../vault/AI R&D/erd-sync.md
---

# erd-sync 스킬 기획 (raw)

## 동기
- ref-erd\<카테고리>\*.vuerd.json (ERD-Editor / vuerd v3) 설계 문서 관리.
- 실제 운영 DB(SKPMIS / PMIS4, Oracle, readonly MCP)와 drift.
- 문서관리(DCMT) ERD를 SKPMIS DB와 수동 대조 → 테이블 누락·컬럼 차이·타입/NN 차이 발견.
- 이 반복 작업을 스킬로 자동화.

## 무엇을
ERD 1개 + 대상 DB 입력 →
1. vuerd v3 파싱 (테이블/컬럼/타입/NotNull/PK)
2. Oracle 딕셔너리(all_tab_columns, all_col_comments 등) 조회
3. 6분류 대조
4. 🟢자동반영 / 🟡판단필요 분리
5. 승인분 vuerd.json 직접 반영(백업 후)
6. DB 결함 건 migration_*.sql 역생성 (readonly라 DB 직접 변경 불가)
7. 표준 포맷 커밋

## 차이 6분류
1. 테이블 누락 (ERD有 DB無)
2. DB有 ERD無 컬럼 (UPD_PSBL_TF, *_CYCLE.REM 등)
3. rename 추정 (DEL_PSBL_TF → DOC_DEL_PSBL_TF)
4. ERD有 DB無 컬럼 (CYC_SN, CFM_USE_TF)
5. 타입 차이 (VARCHAR2 10→30, 500→4000)
6. NN 차이 (ERD NN / DB NULL 등)

## 자동 vs 질문
- 🟢 자동: 컬럼 추가, 타입/길이 갱신, rename, stale 잔재 삭제
- 🟡 질문: 테이블 누락, ERD 전용 컬럼/제약, NN 강화
- 원칙: DB가 기준이나 NN 누락·테이블 누락은 DB 결함일 수 있음 → 무조건 덮어쓰지 않음(스킬이 분기 강제).

## 기능
- MVP: 파싱, 6분류 리포트, 자동반영(컬럼추가/타입/rename), 백업+dry-run, 질문건 확인, DDL 역생성, 표준커밋
- 2차+: PK/FK/인덱스/순서/코멘트 대조, 전체 카테고리 드리프트 대시보드, 스냅샷, alias-dict 연동, writedown 연동

## 구성
```
~/.claude/skills/erd-sync/
├── SKILL.md
└── scripts/
    ├── parse_erd.js   # vuerd v3 → 표준 JSON
    ├── diff.js        # ERD vs DB → 6분류 + 자동/질문 태깅
    ├── apply.js       # ★핵심: vuerd 변형(추가/타입/rename/삭제) + 백업
    └── gen_ddl.js     # DB 결함 → migration SQL
```
- 기존 스킬은 SKILL.md 1장이나, erd-sync는 파싱/변형 로직 많아 scripts/ 분리.
- apply.js 난이도: vuerd v3는 tableColumnEntities(ID)·columnIds·UI좌표·relationshipEntities·indexColumnEntities 얽힘 → 참조 일관 갱신 필요.

## 사용법
`/erd-sync <ERD경로|카테고리폴더> <skpmis|pmis4>`
흐름: 파싱+조회 → 6분류 리포트 → 자동/질문 제시 → 질문건 확인 → 백업 후 반영+diff → migration.sql → 커밋

## 순서
1. parse_erd.js (덤프 로직 재사용)
2. diff.js (수동 대조 발전형)
3. apply.js (문서관리 ERD로 실전 검증)
4. gen_ddl.js + SKILL.md
5. 문서관리 수정사항 첫 반영

## 제약
- Oracle MCP readonly → ALTER 불가, SQL 역생성만.
- MCP_TIMEOUT=60000 적용(2026-06-19) 오라클 안정화.
- 수동 대조 범위: 컬럼·타입·NN만 (PK/FK·인덱스·코멘트는 2차).

---

# 구현 완료 (2026-06-25, raw)

기획(위)을 실제 구현. PoC → 스킬화 → DCMT 회귀검증까지. 설계는 기획과 일부 달라짐.

## 최종 구조: 2단계 (Plan → Apply)
- PHASE1 plan: 접두어 패턴 → DB 스캔 → plan.md 자동분류(full/partial/exclude) → 사람 검토.
- PHASE2 apply: sync(기존 vuerd) 또는 bootstrap(신규 격자생성) → report.md → 사람 확인 → 무결성 통과 시 *.synced.vuerd.json 출력.
- 확인 게이트 3개: ❶계획 ❷리포트 ❸erd-editor 육안.

## 기획 대비 변경점
- 단일 흐름 → 2단계(계획/적용)로 분리. 범위지정·partial 때문에 계획 단계 필수가 됨.
- 테이블 포함 3등급 신설: full / partial(거대 참조테이블=PK+참조컬럼만) / exclude. (사용자 요구로 추가)
- 관계(FK)·코멘트 대조를 1차에 포함(기획은 2차였음). 코멘트는 DB우선 덮기.
- migration DDL 역생성(gen_ddl)은 1차 범위에서 보류(추후). 대신 sync/bootstrap·partial·무결성가드에 집중.
- 무결성 가드 신설: 참조 무결성 실패 시 파일 미출력(종료2).
- stale 컬럼·끊긴 인덱스 자동정리(원본에 누적된 미참조 엔티티 다수 발견 → 정리).

## 스크립트
~/.claude/skills/erd-sync/ : SKILL.md, 사용가이드.md, scripts/{lib,build_meta,plan,sync}.js, queries.md
- lib.js: 타입매핑(NUMBER→Number 등)·nanoid ID생성·패턴매칭·options비트/ui.keys.
- build_meta.js: 원시 MCP 쿼리결과 → 표준 meta.json.
- plan.js: 분류·partial 표시컬럼 산출(PK ∪ 참조컬럼 ∪ 사용자지정).
- sync.js: PoC 엔진. 레이아웃보존·DB우선·정리·무결성·리포트.

## 검증 (DCMT 25테이블/15FK)
- sync(회귀): 추가7 / 제거4 / 변경37 / 관계+1, 좌표0이동(레이아웃 100%보존), 무결성 OK.
- partial: 한 참조테이블 key 1개로 축소 + 관계 유지, 무결성 OK.
- bootstrap: DB만으로 25테이블·14관계·349컬럼 격자생성, 무결성 OK.
- 드러난 드리프트 예: 타입 공백→Number, VARCHAR2 길이변경, NN 다수, 코멘트에서 DB쪽 오타도 발견(DB우선이라 덮음→리포트로 사람확인).

## 한계
- erd-editor 실제 렌더는 헤드리스 불가 → 사람이 1회 육안.
- 신규/참조 테이블 격자배치라 미관은 수동보정.
- CLOB JSON_ARRAYAGG MCP 직렬화 버그 → 원시행 수집으로 우회.
