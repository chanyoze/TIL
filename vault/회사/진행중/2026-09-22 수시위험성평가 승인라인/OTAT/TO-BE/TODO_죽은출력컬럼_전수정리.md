# TODO — 죽은 출력컬럼 전수 정리 → 단어사전 반영

**대상**: [SfasRegAtRiskasmtRcptSql.xml](../../../src/main/resources/sqlmap/mappers/sfas/SfasRegAtRiskasmtRcptSql.xml) (8,336줄, select 16개) + [SfasRegAtRiskasmtRcpt.xml](../../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml)

**순서**: ① 1차 후보 처리 → ② 2차 데이터셋별 차집합 → ③ **단어사전 일괄반영**
리네임을 **정리 후에** 돌리는 이유: 대상 컬럼이 줄어야 리네임 표면적이 작아진다(이전 batch1·2 롤백 전례).

**기 완료** (커밋 `363c78ca2` DEAD CODE 정리): selectAsmtList 옵션 에코 11개 · selectContList 죽은 에코 4개(+wdlCont/wdlCdContHistory/wdmScCont) · CRT_IF/MOD_IF 3쌍.

---

## ① 1차 패스 결과 — 스캔 후보 13건

도구: [`docs/OTAT/dead_column_scan.sh`](../dead_column_scan.sh) (저장소 루트에서 `bash docs/OTAT/dead_column_scan.sh`)
판정식: `nSQL == 1`(서브쿼리 내부 소비 아님) **&&** `nWQ ≤ 1`(0=wqxml 미정의 / 1=컬럼정의만·읽기 없음)

### A. 1차 후보 9건 — **사용자 판단 완료 (2026-08-04)**

| 쿼리 | 라인 | 컬럼 | 판정 |
|---|---|---|---|
| selectCdStddList | 159-165 | `RANK_STDD_SEQ`·`LOWER_BOUND`·`LOWER_STDD`·`UPPER_BOUND`·`UPPER_STDD`·`LOWER_STDD_NM`·`UPPER_STDD_NM` (7) | ✋ **유지 확정** — `EXPRESSION`으로 합쳐 쓰지만, dataCollection에서 **어떤 값이 들어가는지 눈으로 보는 용도**. 읽기 0이어도 진단 가치로 남긴다 |
| selectCdOptList | 74 | `TD_PATH` | ✋ **유지 확정** — 주석 처리된 3D 로직(3062 등)이 살아날 여지가 있어 현상 유지 |
| selectCdOptList | 53 | `SFAS_OPT_088` | 🗑️ **삭제 대상** — 아래 검수로 잔재 확정 |

#### `SFAS_OPT_088` 검수 결과 (2026-08-04)

- **원래 의미**: 옵션88 = **회의록(초안/확정) 회차구분 사용여부**. 회의록 화면 전용 옵션이고 거기선 살아있다 —
  [SfasInqCompanyMeetingConfirm.xml](../../../src/main/webapp/wqxml/sfas/SfasInqCompanyMeetingConfirm.xml) 426(`SECT_CODE` 표시)·488(`TIME_SECT_NAME` 표시), Supv·Cooperation 회의록 및 `CcmsRegSfasOption*`(옵션관리)에서도 사용
- **이 화면에 들어온 경위**: `66f8ba8a3`(2025-03-17 특별회차 추가)에서 `var bSfasOpt088`을 3곳에 도입.
  주석이 "산출식텍스트"·"근로자 QR"로 **제각각** — 타 화면에서 복붙되며 의미가 섞인 흔적. 한 곳은 `SECT_CODE == "S"`(특별회차)와 묶여 있었음
- **소비처 소멸**: `b7a68682f`(2025-03-24)에서 1곳 제거 → `688e05f01`(2025-04-08 가져오기 기능개선)에서 마지막 파라미터 전달 제거 → **2025-04-08 이후 소비처 0**
- **현재 회차구분 제어는 088이 아니라 `SFAS_OPT_095`**: 4356 `wgrdAsmt.setColumnVisible("SECT_CODE", bUseOpt095)`
- **현 상태**: SQL 53행 출력 + wqxml 365행 컬럼정의뿐. JS 읽기 0 · `#{SFAS_OPT_088}` 바인딩 0 · Java 0
- **삭제 범위**: SQL 53 + wqxml 365 (2줄). 타 화면(회의록·옵션관리)은 무관하므로 손대지 않음
- 참고: 형제 화면 `SfasRegAtRiskasmtSub.xml` 75행에도 같은 잔재가 있으나 **담당 다름 → 건드리지 않음**

### B. 🟡 보류 — SCNT 배선 대기 스캐폴딩 (지우면 안 될 수 있음, **사용자 판단 필요**)

`039c2dd91`(07-20 상시/수시 승인모듈)에서 들어온 컬럼들. SoT [SCNT_구현방식_공유.md](../현행/SCNT_구현방식_공유.md)에 **설계상 존재**로 기재돼 있음.

| 쿼리 | 라인 | 컬럼 | 상태 |
|---|---|---|---|
| selectAsmtList | 864 | `CFM_COMPANY_ID` | SoT 111행 "SCNT 승인요청 링크" 4컬럼 중 하나. 형제 `CFM_DEM_SN`(5114·5140)·`CFM_STS_CODE`(4282)는 **현재 사용 중** |
| 〃 | 865 | `CFM_PROJ_CODE` | 〃 |
| 〃 | 872 | `CFM_STS_NAME` | SoT 164행 — `060_003`일 때 노출할 **상태 그리드 컬럼**(미배선). wqxml에 컬럼정의조차 없음(nWQ=0) |

→ 판단 기준: [SfasRcpt_옵션060_영향목록.md](./SfasRcpt_옵션060_영향목록.md)의 남은 배선을 진행할 거면 **유지**, SCNT 상태표시를 다른 방식으로 갈 거면 삭제.

| 쿼리 | 라인 | 컬럼 | 상태 |
|---|---|---|---|
| selectAsmtList | 988 | `APPRV_USER_NM` | 레거시 승인자명(STTS_CD Decode 단수). SoT가 명시한 건 `APPRV_C/BD/A_USER_NM` **3컬럼**(906·910·914)이고 이건 **4번째 중복** → 잔재 가능성 높음. wqxml 122 컬럼정의만 |

### C. 오탐 — 재조사 불필요
`TSFAS_RISK_CALC_STD` · `TSFAS_RISK_FQ` · `TSFAS_RISK_GR` · `TSFAS_RISK_STR` · `TSF_WBS_CPN` · `TCC_PROJ_LINK` → From 절 **테이블명**. 스크립트에 제외 규칙 반영함.

---

## ①-2 역방향 스캔 — **SQL이 요구하는데 아무도 안 넣는 파라미터** (2026-08-04, 수확 큼)

방법: SQL의 `#{X}` 91개 전수 → wqxml·Java(sfas 모듈) 양쪽에 X가 **0회**면 항상 null 바인딩.
결과 **5건**. 이건 "안 읽는 컬럼"과 달리 **동작이 틀어지는 쪽**이라 우선순위가 높다.

**추적 완료 (2026-08-04) — 5건 중 실제 손봐야 하는 건 1건뿐.**

| 판정 | 파라미터 | 위치 | 내용 |
|---|---|---|---|
| 🔴 **버그(수정 대상)** | `#{IMPROV_EDU_USER_NO}` | 3967 (`insertCont` → `TSF_ASSMNT_REGIS_DETAIL`) | **오타**(`IMPROV`↔`IMPRV`). 컬럼은 `IMPRV_EDU_USER_NO`(3927), 값은 `#{IMPROV_EDU_USER_NO}` → 공급 **0** → REGIS 쪽 감소조치자 사번 **항상 NULL**. 같은 파일 RECEIVE insert(3873)는 `#{IMPRV_EDU_USER_NO}`로 정상 → **REGIS만 빠지는 비대칭** |
| 🟢 무해(정합성만) | `#{EXAMINE_CONSTRCT}` · `#{EXAMINE_SAFETY}` | 4066-4067 (`updateCont` → RECEIVE) | `insertCont`가 같은 두 컬럼에 **명시적 `Null, Null`**(3871-3872)을 넣는다 → 이 모듈에선 **처음부터 항상 NULL**. update의 null 재기록은 **데이터 손실 아님**. 2575·2673·4991·5089는 `DTDB_TSF_ASSMNT_RECEIVE_DETAIL`(**삭제 백업 테이블**) 복사라 live write 아님 |
| ✅ **살아있음(건드리지 말 것)** | `#{MGMT_DATE_TF}` (246) · `#{SUB_STS_TF}` (266) | `selectCdCondDegreeList` / `selectCdRegDegreeList` | **타 화면이 우리 서비스를 재사용하며 공급**한다. `SfasPopRegAssesmentReciveSubmission`(211 `SUB_STS_TF="T"`) → `SfasPopRegAssesmentReciveSubmissionController:65`가 `sfasRegAtRiskasmtRcptService.selectCdCondDegreeList` 호출. `SfasPopRtrvAssesmentReciveRptAct`(306·325 `MGMT_DATE_TF`) → 동 컨트롤러 49행도 우리 서비스. 주석 그대로 정상 동작 |

> ⚠️ **스캔 사각지대 교훈**: 역방향 스캔을 *이 화면의* wqxml + sfas Java로만 한정하면, **다른 화면이 같은 mapper를 재사용하며 넣어주는 파라미터**가 죽은 것처럼 보인다. 파라미터 판정은 반드시 **`grep -rn <파라미터> src/main/webapp/wqxml`(전 화면)** 까지 확인할 것.

### 🔴 오타 버그 상세 (수정 착수 가능)

- **히스토리**: `git log -S"IMPROV_EDU_USER_NO"` → **`23bbd41ec`(2025-03-13 SVN → Git 이관) 단 1건**. 즉 git 이전(SVN 시절)부터 있던 문제이고, 최근 네이밍 표준화·DEAD CODE 정리 작업과는 **무관**
- **영향**: 제출 화면 [SfasRegAtRiskasmtSubSql.xml](../../../src/main/resources/sqlmap/mappers/sfas/SfasRegAtRiskasmtSubSql.xml) 379행이 `a.IMPRV_EDU_USER_NO`를 REGIS에서 읽는다 → 접수 화면에서 추가한 행은 **제출 화면에서 사번이 빈 값**. 이름(`IMPROV_EDU_USER`)은 정상 저장되어 화면상으론 눈치채기 어려움
- **수정**: 3967 `#{IMPROV_EDU_USER_NO}` → `#{IMPRV_EDU_USER_NO}` (1글자). 기존 NULL 데이터 보정이 필요한지는 별도 판단
- ⚠️ **일괄치환 금지** — 운영 DB(SKPMIS) 실측 결과 **두 테이블의 컬럼명이 실제로 다르다**:

  | 컬럼 | `TSF_ASSMNT_RECEIVE_DETAIL` | `TSF_ASSMNT_REGIS_DETAIL` |
  |---|---|---|
  | 감소조치자(이름) | **`IMPROV_EDU_USER`** (O 있음) | **`IMPRV_EDU_USER`** (O 없음) |
  | 감소확인자(이름) | `IMPRV_CHECK_USER` | `IMPRV_CHECK_USER` |
  | 감소조치자(사번) | `IMPRV_EDU_USER_NO` | `IMPRV_EDU_USER_NO` |
  | 감소확인자(사번) | `IMPRV_CHK_USER_NO` | `IMPRV_CHK_USER_NO` |

  → SQL의 `IMPROV_EDU_USER`(3827·3869·4064) 및 `IMPRV_EDU_USER = #{IMPROV_EDU_USER}`(3926·4119)는 **DB와 정확히 일치하는 정상 코드**. `IMPROV`를 전부 `IMPRV`로 바꾸면 RECEIVE 쪽이 깨진다.
  → DB 컬럼명 자체의 표기 불일치는 **단어사전 단계(③)의 논의 대상**이지 이번 버그 수정 범위가 아니다.

부수 결과:
- **죽은 쿼리 0건** — statement 39개 전부 Java 호출부 존재
- `wdmScAll`의 13개 키(PROJ_NAME·P_COMPANY_ID 등)는 SQL이 안 받지만 **표준 고정 맵**이므로 제외(AGENTS.md D항)
- `wdmScCdDrCaseRegChk.REG_INFO_LIST`(718)는 `foreach` 컬렉션으로 소비 → 살아있음

> 도구: [`dead_column_scan.sh`](../dead_column_scan.sh)와 같은 방식의 역방향 스크립트. `grep -o '#{[A-Za-z0-9_]*}'` 로 뽑아 wqxml/Java 카운트.

---

## ①-3 쿼리 정합성 테스트 (2026-08-04)

### 통과한 검사
| 검사 | 결과 |
|---|---|
| INSERT 컬럼 개수 vs VALUES 개수 | **16/16 일치, 불일치 0** |
| UPDATE `X = #{Y}` 좌우 이름 불일치 32건 | **전부 정당** — `Decode(옵션,…)`·`Case`·`Nvl2` 분기이거나 `MODUSERNO = #{SESSION_USER_NO}` 류. 실제 오류 0 |
| SQL 사용 컬럼 vs **PMIS4(개발)** 실측 (라이브 테이블 15개, 약 380쌍) | **불일치 0 — 전부 존재** ✅ |
| SQL 사용 컬럼 vs **SKPMIS(운영)** 실측 | `CCTV_MON_TF`·`CFM_*` 미존재 → **9/22 배포 예정분이라 정상** ↓ |

### ✅ 운영 DB(SKPMIS) 컬럼 미반영 — **의도된 상태 (조치 불필요)**

> **2026-08-04 확인**: 아래 컬럼들은 **`20260922` 브랜치에서 추가된 것**이고, 운영 DB에는 **2026-09-22 배포 시점에 DDL이 함께 반영**된다. 지금 SKPMIS에 없는 게 정상.
> - `CCTV_MON_TF` ← `5626b95e0`(2026-07-07 이경훈, CCTV관제여부 컬럼 추가) — **main에 없는 브랜치 전용 커밋**으로 확인
> - `CFM_*` 4컬럼 ← `039c2dd91`(2026-07-20 승인모듈) — 동일
>
> ⚠️ **향후 DB 정합성 검사 기준**: 이 브랜치에서는 **PMIS4(개발)를 정답으로** 볼 것. SKPMIS와의 차이는 9/22 배포 전까지 **전부 기대된 차이**이므로 오탐이다. (SKPMIS 기준 검사는 배포 이후에나 의미 있음)

`ALL_TAB_COLUMNS` 실측 대조 결과, 코드가 쓰는 컬럼이 **개발(PMIS4)에는 있고 운영(SKPMIS)에는 없다**.

| 컬럼 | 테이블 | PMIS4(개발) | SKPMIS(운영) |
|---|---|---|---|
| `CCTV_MON_TF` | `TSF_ASSMNT_RECEIVE_DETAIL` · `TSF_ASSMNT_REGIS_DETAIL` (+ DTDB 아카이브 2종) | ✅ 있음 | ❌ **없음** |
| `CFM_COMPANY_ID`·`CFM_PROJ_CODE`·`CFM_DEM_SN`·`CFM_STS_CODE` | `TSF_ASSMNT_RECEIVE` · `TSF_ASSMNT_REGIS` | ✅ 있음 | ❌ **없음** |

- 테이블 자체는 SKPMIS에도 전부 존재(컬럼수 21~101) → **테이블 부재가 아니라 컬럼 DDL 미반영**
- `CCTV_MON_TF` 사용처 **15곳**: `selectContList`(1139), insert(3814·3856·3913·3953), update(4035·4090), DTDB 아카이브 복사(2641·2739·3396·3483·5057·5155·5696·5783) → 이대로 배포되면 **공사내용 CRUD 전반이 ORA-00904**
- `CFM_*`는 SoT [SCNT_구현방식_공유.md](../현행/SCNT_구현방식_공유.md) 113행이 이미 "운영 DB 반영은 배포 전 별도 확인 필요"로 남겨둔 항목 → **이번 실측으로 미반영 확정**
- ⚠️ 단, SKPMIS가 이 모듈을 실제 서비스하는 DB인지·배포 시 DDL이 함께 나가는지는 **배포 체계 확인 필요**. 그 전까지는 "확인 요망"이지 확정 장애는 아님

> 재현: `docs/OTAT/dead_column_scan.sh`와 같은 방식으로 (테이블,컬럼) 쌍을 뽑아
> `Select Column_Value From Table(Sf_Split('<컬럼목록>', ',')) Where Column_Value Not In (Select COLUMN_NAME From ALL_TAB_COLUMNS Where TABLE_NAME = '<테이블>')` 를 DB별로 실행.

---

## ② 2차 패스 — **실행 완료 (2026-08-04)**

**판정식(1차보다 정밀)**: `wqxml 전체 등장횟수 == 선언 횟수` **AND** SQL이 `#{컬럼}`으로 받지도 않음
→ 즉 **선언만 있고 읽기·그리드바인딩·서버전달 어디에도 없음**. 이름이 여러 데이터셋에 겹쳐도 정확하므로 1차의 사각지대가 해소된다.

**모수**: 선언 513개 / 고유 컬럼명 239개 → **미사용 27종(34선언)**

### A. 이미 판단 끝난 것 (재론 불필요)
`wdlCdStdd` 7종(RANK_STDD_SEQ·LOWER/UPPER 6) · `wdlCdOpt` TD_PATH → **유지 확정**(진단용/3D 주석로직).

### B. 🆕 1차가 못 잡은 신규 발견 — 이름이 겹쳐서 안 보이던 것들

| 데이터셋 | 컬럼 | 선언 | SQL | 성격 |
|---|---|---|---|---|
| `wdlConstrRvw`·`wdlSafRvw`·각 History | `EVL_CMT_SEQ` | 282·318·671·699 | 26회(컬럼명으로만, 바인딩 X) | 서버는 쓰는데 **화면 데이터셋은 안 읽음** |
| 〃 | `PRE_ASSMNT_CMT_SEQ` | 284·320·673·701 | 26회 | 〃 |
| `wdlCont`·`wdlCdContHistory` | `MK_CNSTRCT_MD_KND_SEQ` | 244·643 | 9회 | 〃 |
| `wdlAsmt` | `APPRV_C_DTTM`·`APPRV_BD_DTTM`·`APPRV_A_DTTM` | 107·111·115 | 4회 | 승인일시 3종, 화면 미표시 |

#### ❌ 오탐 정정 — `wdlDrCaseSelectedData.COL_1ST~COL_6TH`(731-736)는 **살아있다**

2차 판정식이 `#{컬럼}` 바인딩만 "서버 사용"으로 쳤는데, 이 데이터셋은 **JSON 리스트째로 전달**되어 SQL이 **컬렉션의 컬럼으로 직접 읽는다**. 삭제하면 재해사례 복사가 깨진다.
- 채움: JS 4187 `wdlDrCaseSelectedData.setJSON(aoRtnDat.data.SELECTED_DATA || [])` (팝업 반환)
- 전달: submission ref 808에 `"wdlDrCaseSelectedData"` 포함
- 소비: `CopyDrCaseSelectedData`(6985~) — 7011~ `COL_2ND PROJ_CODE`, `COL_5TH DR_CASE_SN`, `To_Number(a.COL_6TH) WBS_SN`, 조인 `Nvl(a.COL_1ST,0) = Nvl(b.COMPANY_ID,0)`
- 매핑(6995-7000 주석): COL_1ST=회사ID, COL_2ND=현장코드, COL_3RD=기업/협력사ID, COL_4TH=등록순번, COL_5TH=재해사례순번, COL_6TH=공종순번

> ⚠️ **교훈**: `#{}` 바인딩이 없어도 **데이터셋 통째 전달 + SQL이 컬럼명으로 읽는 패턴**이 있다. 판정 전 submission ref와 컬렉션 소비 쿼리를 확인할 것.

→ 정정 후 B = **6종 / 13선언**

### C. 🟡 SCNT 스캐폴딩 — 삭제 판단 보류 (B와 분리)

| 데이터셋 | 컬럼 | 선언 | 근거 |
|---|---|---|---|
| `wdlAsmt` | `DEM_PSBL_TF`·`DEM_CANC_PSBL_TF`·`SANCTN_PSBL_TF`·`CANC_PSBL_TF` | 100-103 | **이 mapper는 안 뽑는다**(0회). 출처는 [CommonSanctionSql.xml](../../../src/main/resources/sqlmap/mappers/common/CommonSanctionSql.xml) 529-532 — SCNT 공통 승인모듈의 **버튼 가능여부 플래그**. wdlAsmt에 미리 자리만 잡아둔 상태 |
| `wdlAsmt` | `CFM_COMPANY_ID`·`CFM_PROJ_CODE` | 94·95 | ①-1 B항과 동일(SoT 111행 승인요청 링크) |
| `wdlAsmt` | `APPRV_USER_NM` | 122 | ①-1 B항과 동일(레거시 4번째 중복 추정) — **미결** |

#### 사용자 판단 (2026-08-04 인터뷰)

- **SCNT 배선은 이번 브랜치(9/22) 내 진행 확정** → 관련 컬럼은 원칙적으로 유지
- `CFM_COMPANY_ID`·`CFM_PROJ_CODE`·`CFM_DEM_SN` → **필요, 유지 확정**
- 버튼 플래그 4종(`DEM_PSBL_TF`·`DEM_CANC_PSBL_TF`·`SANCTN_PSBL_TF`·`CANC_PSBL_TF`) → **불필요** (출처가 [CommonSanctionSql.xml](../../../src/main/resources/sqlmap/mappers/common/CommonSanctionSql.xml) 529-532의 공통모듈 자체 데이터셋) → **✅ 삭제 완료**(wqxml 4줄)
- `APPRV_USER_NM` → **✅ 삭제 완료**(SQL Decode 1줄 + wqxml 1줄). 레거시 승인에서도 안 쓰였고 060_003은 `SANCTN_STEP_USER_NAME`이 대체하므로 되살릴 필요 없음
  - 보존 확인: 형제 `APPRV_C/BD/A_USER_NM`(19·18·18회)·`SANCTN_STEP_USER_NAME`(5회) 그대로

#### `APPRV_USER_NM` 상세 (판단용)

**정의** — `selectAsmtList` 988:
```sql
Decode(d.SFAS_OPT_060, 'T',
   Decode(a.STTS_CD, '30', 공사팀장명, '40', 안전팀장명, '50', 현장소장명, ''),
'') APPRV_USER_NM
```
= **옵션060(레거시 승인선)일 때 "현재 결재 차례인 담당자 1명"**. STTS_CD 30/40/50이 각 단계.

**형제 3컬럼과 결정적 차이 — 배선 유무**

| | `APPRV_C/BD/A_USER_NM` | `APPRV_USER_NM` |
|---|---|---|
| 그리드 컬럼 | 있음 (5412 등) | **없음** |
| 노출 제어 | `setColumnVisible(…, bUseOpt060)` 4347 | 없음 |
| 사용자검색 팝업 연동 | `sCpntId: "wgrdAsmt:APPRV_C_USER_NM"` / `sInColMap` 1174-1193 | 없음 |
| 저장 검증 | 1351에서 참조 | 없음 |
| wqxml 등장 | 다수 | **122행 선언 1개뿐** |

**SCNT에는 같은 개념이 이미 구현돼 있다**: `SANCTN_STEP_NAME`(단계)·`SANCTN_STEP_USER_NAME`(대기자) — 그리드 컬럼 5302·5303/5369·5371, 노출 제어 4343-4344(`bUseOpt060003`). 즉 "현재 차례인 사람 한 칸"은 SCNT 쪽에 있고, `APPRV_USER_NM`은 **그 레거시 대응물인데 화면에 붙지 않은 상태**.

**히스토리**: `git log -S` → **SVN 이관(`23bbd41ec`) 1건뿐**. 이후 수정 이력 없음 = 한 번도 배선된 적 없을 가능성.

**타 화면의 동명 컬럼은 무관**: `SfasReg*SafetyOperation*PopReport` 등의 `APPRV_USER_NM`은 리포트 파라미터 맵 키(`APPRV_USER_NM: wdmScAll.get("CHKR_USER_NAME")`)로 용도가 다름.

**판단 기준**: 9/22 SCNT 배선 때 **레거시 060 화면도 SCNT와 UI 대칭(단계·대기자 한 칸)으로 맞출 것인가**
- 맞춘다 → **유지**(이번에 배선하면 됨)
- 레거시는 3컬럼 방식 그대로 간다 → **삭제**(SVN 시절부터 안 쓰인 잔재)

> 도구: `pass3` 방식 — 선언 추출(awk) → 컬럼별 `grep -c -w` 총등장 vs 선언수 비교 → `#{}` 바인딩 제외.

---

## ①-4 배선 정합성 스캔 (2026-08-04) — 그리드·submission·엔드포인트

| 검사 | 결과 |
|---|---|
| 그리드 컬럼 ↔ 바인딩된 데이터셋 컬럼 | **전부 존재** (그리드에만 있는 유령 컬럼 0) |
| Controller `@RequestMapping` ↔ 화면 action | **전부 사용** |
| SQL statement id ↔ Mapper 인터페이스 메서드 | **전부 매핑** |
| `scwin.*` 함수 재참조 | 미참조 **0** |
| submission 호출부 | **1건 미호출** ↓ |

### 🗑️ `wsmTrscCalc` + `wdmTrscCalc` — 존재하지 않는 엔드포인트를 향한 죽은 세트

- `wsmTrscCalc`(740-743) action = `/sfas/SfasRegAtRiskasmtRcpt/trscDisasterCalc.do`
- **`trscDisasterCalc`는 Java·SQL 어디에도 없다**(전 소스 0건) → 호출되면 404
- 호출부도 없음(파일 내 등장 1회)
- 전용 파라미터 맵 `wdmTrscCalc`(485-491, 키 `PROJ_CODE`·`STAN_MONTH`·`STAN_DEGREE`)도 이 submission의 ref로만 존재
- **✅ 삭제 완료(2026-08-04)**: dataMap 7줄(485-491) + submission 4줄(740-743) = **11줄**
  - 검증: 세 문자열 잔여 **0** · XML 태그 균형(dataMap/dataList/submission/keyInfo/columnInfo 전부 0) · JS 파싱 OK · CRLF 유지 · 배선 스캔 4종 재실행 **전부 통과**
  - 인접한 `wdmScTransExecuteSumOfDisasterForm`·`wsmTransExecuteSumOfDisasterForm`(살아있는 대체 기능)은 무손상

### `wsmTrscCalc` 이력 추적 — **금번 리네임 작업과 무관**

`git log -S`(저장소 전체) 결과, `trscDisasterCalc`·`wsmTrscCalc`·`wdmTrscCalc`·`executeSumOfDisasterForm` **네 문자열 모두 `23bbd41ec`(2025-03-13 SVN→Git 이관) 단 1건**에만 나타나고 이후 어떤 커밋도 건드리지 않았다.
최근 네이밍 표준화 3커밋(`416b3562e`·`cd65cf488`·`2289b025f`)도 `TrscCalc`를 전혀 변경하지 않음.
→ **리네임 잔재가 아니라 기능 교체(→`executeSumOfDisasterForm`) 후 옛 화면 정의만 남은 것**이며, git 이관 시점에 이미 그 상태였다(SVN 이전은 추적 불가).

## ①-5 Java 레이어 죽은 코드 스캔 (2026-08-04) — **0건**

| 검사 | 모수 | 결과 |
|---|---|---|
| Mapper 메서드 ↔ SQL statement id | 39개 | **전부 매핑** |
| Mapper 메서드 ↔ ServiceImpl 호출 | 39개 | **전부 호출** |
| Service 인터페이스 ↔ 외부 호출부 | 23개 | 1건 플래그 → **오탐**(아래) |
| ServiceImpl 메서드 정의 (인터페이스 미선언 + 미호출) | 25개 | **0** |
| Controller `@RequestMapping` ↔ 전 화면 action | 27개 | **전부 사용** |

> **오탐 주의**: `deleteSumOfDisasterForm`이 "호출부 없음"으로 걸렸으나, **ServiceImpl 내부에서 3회 호출**된다(378·435·569 — 평가서/이력/접수 시 재해형태 집계 삭제). 스캔이 Impl 파일을 코퍼스에서 제외해 생긴 오탐.
> 다만 **외부(Controller 등) 호출은 실제로 없으므로**, 인터페이스에 노출할 필요는 없다(내부 헬퍼). 동작엔 영향 없는 설계 취향 사안.

> ⚠️ **스캔 함정 기록**: Java 메서드명 추출 시 `grep -oE '…\($'`처럼 **행 끝 앵커**를 쓰면 파라미터가 뒤따르는 선언은 0건이 잡혀 "전부 정상"이라는 **거짓 통과**가 난다. 반드시 추출 개수를 먼저 검증할 것. 또 `mapper.xxx(…);` 호출문을 메서드 정의로 오인하지 않도록 접근제어자(`public|private|protected`)로 정의 라인을 한정해야 한다.

### 오탐 (조치 불필요)
`wdmScCdRegDegree`(32)는 **키가 하나도 없는 빈 맵**이라 스캔에 걸렸으나, 대응 쿼리 `selectCdRegDegreeList`(282)가 `Select Level … From Dual Connect By Level <= 10`인 **파라미터 불필요한 정적 목록(1~10회차)** 이라 빈 ref가 정상이다.

---

## ②-2 🔴 출처 이력 이관 미완료 — `CONN` 테이블에 검토의견 출처가 안 쌓인다 (2026-08-04 발견)

`EVL_CMT_SEQ`/`PRE_ASSMNT_CMT_SEQ`(구 FK 방식) → `TSF_ASSMNT_*_DETAIL_CONN`(연결정보 테이블) 이관 상태를 운영(SKPMIS) 실측으로 확인한 결과, **이관이 절반만 이뤄져 있다.**

### (1) 구 FK는 지금도 기록 중 — 폐기된 게 아님

| 테이블 | 2026년 전체 | `EVL_CMT_SEQ` | `PRE_ASSMNT_CMT_SEQ` |
|---|---|---|---|
| `TSF_ASSMNT_RECIVE_CONST_CMT` | 414,205 | 13,823 | **152,152** |
| `TSF_ASSMNT_RECIVE_SAFE_CMT` | 462,256 | 14,307 | **164,542** |
| `TSF_ASSMNT_REGIS_CONST_CMT` | 414,977 | 13,930 | **152,817** |
| `TSF_ASSMNT_REGIS_SAFE_CMT` | 463,106 | 14,418 | **165,281** |

2022년까지 0 → **2023년부터 본격 기록** → 2026년 현재도 유지. CONN과 **병행** 중.

### (2) CONN 행은 만들어지는데 **검토의견 출처 컬럼만 비어 있다**

`CONN`은 출처 종류별 컬럼군을 가진 와이드 테이블이고, 상시/수시 출처는 `AT_*` 군이다:
`AT_REG_SN`(평가서) · `AT_REG_DTL_SN`(상세) · **`AT_CONSTR_CFM_OP_SN`(공사 검토의견)** · **`AT_SAF_CFM_OP_SN`(안전 검토의견)**

**2026-07 한 달, 검토의견 출처 FK가 찍힌 상세 27,627건을 CONN과 조인:**

| 항목 | 건수 | 비율 |
|---|---|---|
| CONN 행 자체가 없음 | **0** | 0% |
| CONN 행은 있으나 `AT_CONSTR_CFM_OP_SN` **NULL** | **27,536** | **99.7%** |
| 정상 기록 | 91 | 0.3% |

연간으로도 같은 그림: 2026년 CONN 775,309행 중 `AT_REG_SN` 668,533(86%)인데 `AT_CONSTR_CFM_OP_SN`은 **26,840(3.5%)** 뿐.
→ **"어느 평가서에서 가져왔나"는 CONN이 잘 받고 있고, "어느 검토의견에서 가져왔나"는 여전히 구 FK에만 남는다.**

### 원인 — 수시평가서 가져오기가 CONN을 안 건드린다

- [SfasPopRegPreAssmntSql.xml](../../../src/main/resources/sqlmap/mappers/sfas/SfasPopRegPreAssmntSql.xml) `trscCpAc`(793) — CMT 복사 시 `PRE_ASSMNT_REGIS_DETAIL_SEQ`·`PRE_ASSMNT_CMT_SEQ`만 기록(1049·1092). **파일 전체에 `DETAIL_CONN` 참조 0건**
- [SfasPopRegPreAssmntReceiveSql.xml](../../../src/main/resources/sqlmap/mappers/sfas/SfasPopRegPreAssmntReceiveSql.xml) — 동일(1136·1179·1309·1352). **`DETAIL_CONN` 참조 0건**
- 반면 `AT_CONSTR_CFM_OP_SN`을 실제로 쓰는 곳은 15개 파일(전회차 가져오기·TBM·회의록·작업허가서 등)로 **따로 있다** → 남은 0.3%는 그 경로로 들어온 것으로 추정
- 우리 화면([SfasRegAtRiskasmtRcptSql](../../../src/main/resources/sqlmap/mappers/sfas/SfasRegAtRiskasmtRcptSql.xml))의 `AT_CONSTR_CFM_OP_SN`(1984·2015·2056·2087)은 **전부 `DTDB_` 아카이브 복사 컬럼목록**일 뿐, 기록 주체가 아님

### (3) 대조군 — **상세 단위 출처는 CONN 이관이 사실상 완결됐다**

`selectContList`가 뽑는 `TSF_ASSMNT_RECEIVE_DETAIL`의 구 FK 컬럼군을 같은 방식으로 검증(2026-07 조인 테스트):

| 구 FK (DETAIL) | 대응 CONN 컬럼 | 상세건수 | CONN에 동일값 | 누락 |
|---|---|---|---|---|
| `EVL_*`(최초/정기) | `FST_REG_DTL_SN` | 2,540 | **2,540** | **0** |
| `OTH_*`(타현장 수시) | `AT_REG_DTL_SN` (AT_PROJ_CODE≠PROJ_CODE) | 2,517 | **2,517** | **0** |
| `PRE_ASSMNT_*`(이전 수시) | `AT_REG_DTL_SN` | 104,321 | **104,300** | 21 (0.02%) |
| **`EVL_CMT_SEQ`/`PRE_ASSMNT_CMT_SEQ`(검토의견)** | `AT_CONSTR_CFM_OP_SN` | 27,627 | **91** | **27,536 (99.7%)** ❌ |

**구 FK 기록이 아예 멈춘(=CONN 단독 전환 완료) 컬럼군** — `TSF_ASSMNT_RECEIVE_DETAIL` 연도별 기록:

| 컬럼 | 2024 | 2025 | **2026** | 대응 CONN(2026) |
|---|---|---|---|---|
| `MK_CNSTRCT_MD_KND_SEQ`(평가모델) | 2,104 | 431 | **0** | `STD_WBS_SN` 314,969 |
| `ADD_INST_NO`(추가지시) | 1,305 | 179 | **0** | `ADD_SN` 2,609 |
| `NCR_NCR_SEQ`(부적합) | 140 | 51 | **0** | `IMPROP_SN` 555 / `NM_SN` 961 |

→ **결론: "어느 평가서/상세에서 가져왔나"는 CONN 이관 완료. 오직 "어느 검토의견에서 가져왔나"만 미이관.**

### ✅ 반영 완료 (2026-08-04) — CONN이 대체한 출처 FK 22종을 화면에서 제거

**삭제**: `selectContList` 출력 22컬럼 + `wdlCont`·`wdlCdContHistory` 선언 각 22개(80줄) + JS "가져오기 키 값들 초기화" 21줄
- `ADD_*`(3) · `NCR_*`(3) — 구 FK 2026년 기록 **0**, CONN `ADD_SN`/`IMPROP_SN`·`NM_SN`이 대체
- `EVL_*`(5) · `PRE_ASSMNT_*`(5) · `OTH_*`(5) — CONN `FST_*`/`AT_*`에 **누락 0~0.02%로 완전 미러링**
- `MK_CNSTRCT_MD_KND_SEQ`(1) — 기록 0, CONN `STD_WBS_SN`이 대체

**보존**
- 검토의견 출처 4쌍(`EVL_REGIS_DETAIL_SEQ`+`EVL_CMT_SEQ`, `PRE_ASSMNT_REGIS_DETAIL_SEQ`+`PRE_ASSMNT_CMT_SEQ`)은 `wdlConstrRvw`·`wdlSafRvw`·각 History에 **4곳 그대로** — CONN 미이관이라 유일 소스
- `deleteAsmt`/`deleteCont`의 **DTDB 아카이브 복사**(각 8회)는 손대지 않음 — DB 컬럼이 실재하므로 백업에서 빠지면 안 됨
- 검증: wqxml 잔여 **0**, JS 파싱 OK, CRLF 유지

#### 남은 "가져오기 키 값들 초기화" 블록 검수 (2026-08-04) — 12줄 중 11줄 정상

| 줄 | 대상 | 판정 |
|---|---|---|
| `AD_CD = "150"` | 등록방법코드를 '라인추가'로 | ✅ 저장 바인딩 2회, 핵심 로직 |
| `PREV_ASSMNT_RANK` | 이전등급 | ✅ **그리드 실컬럼**(5549)·노출제어(4256 `bUseOpt066001`)·readOnly(954). 표시 전용이라 초기화가 맞음 |
| `PLACE` | 현재 행 값 복사 | ✅ 초기화가 아니라 `nwdlContRow`(1444 정의) 행에서 **복사**. 주석 구간에 있을 뿐 동작 정상 |
| `TD_*`(3) · `TDP_*`(5) | 3D 좌표·마커 | ✅ 전부 wdlCont 선언 + JS 5~10회 참조, `TDP_MARKER_JSON`·`TDP_POI_JSON`·`TDP_FILE_GRP_SN`은 저장 바인딩 4회씩 |

> 🐛 **`"PRE_REGIS_DETAIL_SEQ,"`(1479, 컬럼명 문자열에 콤마)** — 존재하지 않는 컬럼이라 무동작. `git log -S` 기준 **SVN 이관(`23bbd41ec`) 때부터** 그대로.

#### `PRE_REGIS_DETAIL_SEQ`(이전상세순번) — CONN 도입과 함께 기록 중단 (2026-08-04 실측)

| 테이블 | 2024 | **2025** | **2026** |
|---|---|---|---|
| `TSF_ASSMNT_RECEIVE_DETAIL` | 1,682 | **0** | **0** |
| `TSF_ASSMNT_REGIS_DETAIL` | 1,684 | **0** | **0** |
| `TSF_ASSMNT_RECIVE_CONST_CMT` | 1,355 | **0** | **0** |

- **CONN 테이블의 최초 기록도 2025년부터**(2024년 이전 CONN 행 없음) → 세대 교체 시점이 정확히 일치
- 2024년 값이 있던 1,682건을 CONN과 조인하면 **전부 "CONN 행 없음"** — 두 방식이 시간적으로 겹치지 않는다(= 구 FK → CONN 전환)
- 대체 위치는 `REG_SECT_CODE` + `AT_REG_DTL_SN`. 다만 **어느 sect 코드였는지는 데이터로 확정 불가**(시대가 안 겹침). 참고: 2026년 분포는 `AT` 450,725 · `AT_ACCUM` 194,084 · `STD_MDL` 76,708 · `FST` 27,764 · **`AT_OT` 14,822** — `AT_OT`는 타현장(구 `OTH_*` 14,265와 거의 일치)이므로, 이전 회차 이어받기는 `AT_ACCUM` 쪽이 더 자연스럽다

**왜 2025년부터 0인가 — 파이프가 끊겨 있었다**
`sTgtWdl`(1633: `wdlConstrRvw` 또는 `wdlSafRvw`)에 `setCellData(…, "PRE_REGIS_DETAIL_SEQ", …)`(구 1657)를 하는데, **두 Rvw 데이터셋은 이 컬럼을 선언하지 않는다**(선언은 `wdlCont`·`wdlCdContHistory`뿐) → **무동작**. 저장 바인딩은 그래서 항상 null이었다.

### ✅ 반영 완료 (2026-08-04) — CONN 일원화: 구 FK 저장 중단

**SQL 17줄 삭제 + 1줄 수정**
- 조회 출력 3: `selectContList`(1155) · `selectConstrRvwList`(1268) · `selectSafRvwList`(1312)
- 라이브 INSERT 6쌍 12줄: `TSF_ASSMNT_RECEIVE_DETAIL`(3802·3844) · `REGIS_DETAIL`(3898·3938) · `RECIVE_CONST_CMT`(6030·6049) · `REGIS_CONST_CMT`(6069·6088) · `RECIVE_SAFE_CMT`(6498·6517) · `REGIS_SAFE_CMT`(6537·6556)
- UPDATE 2: `updateCont` RECEIVE(4039) · REGIS(4091)
  - ⚠️ RECEIVE 쪽은 **SET 절 마지막 항목**이라 앞줄 `ACC_TF = #{ACC_TF},`의 **콤마를 제거**해야 했다(4038). 수정 후 `ACC_TF = #{ACC_TF}` → `Where 1 = 1` 확인

**wqxml 6줄 삭제**: 선언 2(`wdlCont` 186 · `wdlCdContHistory` 545) · 오타줄 1(`"PRE_REGIS_DETAIL_SEQ,"`) · 무동작 if 블록 3(구 1656-1658)

**보존**: DTDB 아카이브 **32곳** — 구 데이터가 실재하므로(`DTDB_TSF_ASSMNT_RECEIVE_DETAIL` 407건, `DTDB_TSF_ASSMNT_RECIVE_CONST_CMT` 181건) 2024년 이전 행이 삭제될 때 백업에서 빠지면 안 됨

**검증**: 라이브 잔여 0 · 바인딩 0 · INSERT 컬럼수↔VALUES **16건 일치** · DTDB Insert-Select **38건 균형** · JS 파싱 OK · CRLF 유지 · `PRE_ASSMNT_REGIS_DETAIL_SEQ`(wq 4·sql 34)·`ACC_TF` 무변

### ✅ `MONTHLY_COUNT`(월회차) 완전 제거 (2026-08-04)

주석에 이미 `-- 월회차[사용안함]`으로 박혀 있던 컬럼. 운영 DB 실측으로 확정:

| 테이블 | 전체 | 값 있는 행 | 비고 |
|---|---|---|---|
| `TSF_ASSMNT_RECEIVE` | 361,021 | **113 (0.03%)** | **전부 2016년**, 값이 `'1'`~`'회차'`(문자열 쓰레기) |
| `TSF_ASSMNT_REGIS` | 368,272 | 108 | 〃 |
| `DTDB_TSF_ASSMNT_RECEIVE` | 6,196 | **0** | 아카이브도 전무 |

2017년 이후 **10년간 기록 0건**. wqxml `dataCollection`에서는 이미 제거된 상태여서 `#{MONTHLY_COUNT}`는 그 시점부터 이미 null 바인딩이었다.

**삭제 11곳**(SQL): `selectAsmtList` 출력 1 · `insertAsmt` RECEIVE/REGIS 컬럼+값 4 · `updateAsmt` SET 2 · DTDB 아카이브 컬럼+Select 4
**검증**: 잔여 0 / INSERT 컬럼수↔VALUES **16건 전부 일치** / DTDB Insert-Select **43=43, 24=24** / CRLF 유지

**타 화면(손대지 않음)**: [SfasPopRegPreAssmntReceiveSql](../../../src/main/resources/sqlmap/mappers/sfas/SfasPopRegPreAssmntReceiveSql.xml) 116·120(`a.MONTHLY_COUNT MONTHLY`)·314·318이 select하지만 해당 wqxml에서 **미사용** → 기록을 멈춰도 무해. `SfasRegAtRiskasmtSub`·`CcmsRegDemoData`도 담당이 달라 제외.

### ✅ `wdmScAll.SFAS_OPT_113` 제거 (2026-08-04) — 옵션113 본체는 유지

- **옵션113 자체는 살아있다**: `wdlCdOpt`가 SQL 55에서 공급받아 JS **7곳**(1277·1950·2117·2167·2234·2567·3102)에서 `== "T"` 판정에 쓰인다 → **그대로 유지**
- **죽은 것은 `wdmScAll` 경유 경로**: 키 선언(60) + `onBeforeDataLoad`에서 `wdmScAll.set("SFAS_OPT_113", …)`(1993) 뿐인데, **어느 쿼리도 `#{SFAS_OPT_113}`로 안 받는다(0회)**
  → `wsmInqAsmt`(667, ref=`wdmScAll`)로 평가서 조회 때마다 서버에 실려 가지만 그대로 버려짐. 애초에 `selectAsmtList`는 `TCC_PROJ_CODE d`를 조인하고 있어 필요하면 `d.SFAS_OPT_113`을 직접 읽으면 되므로 파라미터 전달 자체가 불필요
- **삭제 2곳**: wqxml 키 1줄 + set 1줄. 빈 `if(asDataId == wdlAsmt.getID())` 분기는 제거하고 `else if`를 `if`로 승격. JS 파싱 OK
- 참고: 같은 스캔에서 걸린 `wdmScAll.REPORT_TYPE`(59)은 **살아있음** — 1888에서 리포트 경로 문자열을 세팅해 리포트 컴포넌트가 소비(SQL 바인딩이 아닌 다른 경로)

### 판단 필요 / ②-B 재판정

- **`MK_CNSTRCT_MD_KND_SEQ` → 삭제 가능으로 정정**: 2026년 구 FK 기록 **0**이고 `CONN.STD_WBS_SN`이 완전 대체. 화면 미사용 + DB 기록 중단 = 남길 이유 없음 (앞서 "유지 권장"했던 판단을 실측으로 뒤집음)
- **`EVL_CMT_SEQ`·`PRE_ASSMNT_CMT_SEQ` → 유지 필수**: CONN이 못 받고 있어 **검토의견 출처의 유일한 기록 수단**
- 이관을 완결할 거면 `trscCpAc`(및 Receive판)에 **CONN `AT_*_CFM_OP_SN` Merge 추가**가 필요. 참고 구현: [SfasPopRegAtRiskAsmtSql.xml](../../../src/main/resources/sqlmap/mappers/sfas/SfasPopRegAtRiskAsmtSql.xml) 1475·1750 `Merge Into TSF_ASSMNT_*_DETAIL_CONN`

---

## ②-옛 계획 (참고: 위 실행으로 대체됨)

1차 판정식은 **이름이 여러 쿼리에 겹치는 컬럼을 구조적으로 못 잡는다**(`nSQL > 1`이라 필터에서 탈락).
실증: `selectCdStddList`는 `COMPANY_ID`·`PROJ_CODE`도 뽑는데 `wdlCdStdd`는 이 둘을 **안 읽는다** — 위 A표에 없음.

**방법** — 데이터셋 D마다:
1. D를 채우는 select의 **출력 alias 집합** 수집
2. D의 **실사용 키 집합** = JS `D.getCellData/setCellData("X")` + D를 물린 **그리드 컬럼 `id`** + **submission ref/target**
3. `1 − 2` = 죽은 컬럼

**대상 데이터셋(9)**: `wdlAsmt`·`wdlCont`·`wdlCdOpt`·`wdlCdStdd`·`wdlCdFqc`·`wdlCdStrth`·`wdlCdGr`·`wdlConstrRvw`·`wdlSafRvw`
(+ `wdlCdContHistory` 등 미러는 원본과 동일 컬럼셋 유지)

> ⚠️ **①을 반영한 파일에 대해 실행할 것.** 컬럼을 지우면 차집합의 기준 집합이 바뀐다.

---

## ③ 단어사전 일괄반영 (정리 완료 후 착수)

- 대비 문서: [단어사전_일괄적용_대비.md](../단어사전_일괄적용_대비.md) — **함정 5종 반드시 선독**
- 도구: [wordbook_rename.js](../wordbook_rename.js)
- 매핑표: `SfasRegAtRiskasmtRcpt_단어사전매핑.xlsx` / `수시 단어사전.xlsx`
- 전례: 이전 batch1·2는 **롤백됨** → 컬럼 수를 줄이고 스코프를 좁힌 뒤 재시도하는 게 이번 순서의 목적
- 적용 범위: Controller ~ Service ~ Mapper ~ SQL ~ wqxml **동시** (한 곳만 바뀌면 런타임에서 조용히 빈값)
