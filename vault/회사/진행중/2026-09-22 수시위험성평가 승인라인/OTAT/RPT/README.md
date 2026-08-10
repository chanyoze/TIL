# 상시·수시위험성평가서 리포트(클립리포트) 핸드오프

> 대상 화면: `SfasRegAtRiskasmtRcpt` (상시·수시위험성평가서접수)
> 이 폴더의 `.crf` 는 **리포트 서버 배포본의 사본**이다. 애플리케이션 빌드에는 포함되지 않는다.

## 1. 파일 ↔ DB 등록 ↔ 리포트유형

리포트 실물은 `TCC_RRPT_FILE_BAS` 에 등록되어 있고, 화면은 **파일명이 아니라 `RRPT_ID` + `DVS_CD`** 로 고른다.

| 파일 | RRPT_ID | DVS_CD | 리포트명 | 배포 경로 |
|---|---|---|---|---|
| `WSfAssesmentReciveRegister.crf` | 31 | **A** | 상시/수시위험성평가서 | `/sfas/WSfAssesmentReciveRegister.crf` |
| `WSfAssesmentReciveRegisterTypeB.crf` | 31 | **B** | 〃 | `/sfas/WSfAssesmentReciveRegisterTypeB.crf` |
| `WSfAssesmentReciveRegisterTypeC.crf` | 31 | **C** | 〃 | `/sfas/WSfAssesmentReciveRegisterTypeC.crf` |
| `WSfAssesmentReciveRegisterTypeD.crf` | 31 | **D** | 〃 | `/sfas/WSfAssesmentReciveRegisterTypeD.crf` |

`DVS_CD` 는 화면에서 이렇게 만들어진다 — [SfasRegAtRiskasmtRcpt.xml:1886](../../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1886)

```js
wdmScAll.set("RPT_TYPE_CODE", "UR0000000021" + "-" + wdlCdOpt.getCellData(0, "RPT_TYPE_CODE") + "^");
```

즉 **회사 옵션 `RPT_TYPE_CODE`(TCC_PROJ_CODE)** 가 A/B/C/D 중 하나를 고른다. 현장마다 서식이 다른 이유가 이것.

> ⚠️ `RPT_TYPE_CODE` 는 2026-08-10 단어사전 반영에서 `REPORT_TYPE` 을 리네임한 이름이다(배치4). 화면 내부 컬럼 id 이며, 리포트 서버로 나가는 파라미터명이 아니다.

## 2. 호출 경로

```
[본체] SfasRegAtRiskasmtRcpt.xml  .setReportForPopup({ oDvsCd, oPara.rDclt, sPopupUrl })   ← 1168~1204
   ↓ 파라미터 23개를 팝업 파라미터로 전달
[팝업] SfasPopRtrvAssesmentReciveRptAct.xml  cips.getPopupParameter("...") 로 수신          ← 120~150
   ↓ 사용자가 리포트 선택 → rptUrl + rptParam
[리포트서버] http://<host>/REXPERT/rexservice.jsp  → .crf 실행
   ↓ .crf 가 JDBC 로 Oracle 직접 조회 (자체 SQL)
[출력] PDF
```

**중요:** `.crf` 는 애플리케이션 매퍼를 거치지 않는다. `.crf` 안에 `oracle.jdbc.driver.OracleDriver` / `jdbc:oracle:thin:@…` 접속정보와 **자체 SQL** 이 들어 있다.

## 3. 단어사전 리네임(2026-08-10)과의 관계 — **영향 없음**

| 구분 | 이번에 바뀌었나 | 근거 |
|---|---|---|
| `.crf` 내부 SQL 의 컬럼명 | ❌ | DB 컬럼(`ASSMNT_RANK`·`RISK_FACT`·`PLACE`·`MNG_DATE_FROM`·`REGIS_SEQ`·`CMT_CONTENT` 등)을 직접 씀. 단어사전 작업은 **매퍼 별칭만** 바꿨고 DB 컬럼은 하나도 안 건드렸다 |
| 본체 → 팝업 파라미터 **이름**(좌변) | ❌ | 함정12 로 전부 보존. `COND_MONTH`·`STAN_DEGREE`·`MNG_DATE_FROM`·`R_COMPANY_NM`·`REGIS_SEQ`·`SELECT_*` 그대로 |
| 파라미터 **값의 출처**(우변) | ✅ | `wdmScAll.COND_MONTH → wdmScAll.STD_YM` 처럼 우리 컬럼명만 바뀜. 넘어가는 값은 동일 |

검증: `scratchpad/popup_contract.js` 로 본체→팝업 전달키가 배치 이전과 동일함을 확인.

## 4. `.crf` 수정 시 주의

- **바이너리(REX30 포맷)** 라 `git diff` 가 안 된다. 변경하면 **아래 이력표에 사람이 직접 적을 것.**
- 편집은 Rexpert(클립리포트) 디자이너로. 이 폴더 사본을 고친 뒤 리포트 서버에 배포하고, 사본도 같이 갱신해야 둘이 안 갈라진다.
- `.crf` 안에 **DB 접속정보가 박혀 있다.** 환경(개발/운영)별로 다르므로 배포 대상 환경을 반드시 확인.
- `.crf` 가 참조하는데 화면이 안 보내는 옵션: `SFAS_OPT_084`, `SFAS_OPT_092` — 리포트가 자체 SQL 로 직접 읽는 것으로 보인다. 화면 옵션을 바꿀 때 리포트도 같이 봐야 한다.

## 5. 전달 파라미터 23개 (본체 `rDclt`)

| 파라미터(리포트 계약) | 값 출처(화면 컬럼) |
|---|---|
| `COMPANY_ID` / `PROJ_CODE` | `wdmScAll.COMPANY_ID` / `.PROJ_CODE` |
| `COND_MONTH` | `wdmScAll.STD_YM` |
| `STAN_DEGREE` | `wdmScAll.STD_TIME` |
| `R_COMPANY_ID` / `R_COMPANY_NM` | `wdmScAll.R_COMPANY_ID` / `.COOP_COMPANY_NAME` |
| `EMPHS_TF` | `wdmScAll.EMPHS_TF` |
| `SELECT_COND_MONTH` | `wdlAsmt.STD_YM` |
| `SELECT_STAN_DEGREE` | `wdlAsmt.STD_TIME_CODE` |
| `SELECT_R_COMPANY_ID` / `SELECT_R_COMPANY_NM` | `wdlAsmt.R_COMPANY_ID` / `.COOP_COMPANY_NAME` |
| `MNG_DATE_FROM` / `MNG_DATE_TO` | `wdlAsmt.MGMT_BEG_DATE` / `.MGMT_END_DATE` |
| `REGIS_SEQ` | `wdlAsmt.REG_SN` |
| `REG_DATE_RPT_TF` | `wdlCdOpt.REG_DATE_RPT_TF` |
| `SFAS_OPT_040`·`040_001`·`048`·`048_001`·`049`·`049_001`·`066_001`·`066_002` | `wdlCdOpt.*` |

`SELECT_*` 접두는 **선택한 1건** 기준, 나머지는 **조회조건** 기준이다.

## 6. 변경이력 (`.crf` 는 diff 가 안 되므로 수기 관리)

| 일자 | 파일 | 변경내용 | 작성자 |
|---|---|---|---|
| 2026-07-07 | Register / TypeB / TypeC | (사본 확보 시점) | - |
| 2026-07-07 | TypeD | (사본 확보 시점) | - |
