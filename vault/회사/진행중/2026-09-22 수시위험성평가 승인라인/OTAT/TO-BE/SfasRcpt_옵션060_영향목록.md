# SfasRegAtRiskasmtRcpt — `SFAS_OPT_060=T` 활성 항목 전수 목록

> **목적**: 신규 옵션 `SFAS_OPT_060_003`(SCNT 표준승인) 도입 시, 기존 결재(060=T)에서만 켜지는 컬럼·로직을 **비활성화 / SCNT 분기로 교체**해야 하는 지점을 미리 카탈로그화.
>
> **전제(상호배타 D11)**: `060_003=T`이면 `060=F`로 저장 → 아래 모든 `bUseOpt060`/`SFAS_OPT_060=='T'` 분기는 **자동으로 "else(비승인)" 경로로 빠짐**. 단, else 경로는 "승인 없음(접수/20)"이라 **SCNT가 원하는 상태가 아님** → 각 항목은 **SCNT 로직이 끼어들 seam(이음매)**. "060=T 분기 죽이기"만으로는 부족하고, 그 자리에 `060_003=T` SCNT 경로를 넣어야 함.
>
> 중앙 플래그: `scwin.oOptConfig.bUseOpt060`(= `SFAS_OPT_060=='T'`, "승인프로세스 사용여부") — [2132](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L2132)

---

## A. 컬럼 표시(Visible) — `columnVisibleControl` (4189~)

| 컬럼 | 규칙 | 060=T 효과 | 참조 |
|---|---|---|---|
| `C_USER_NM`(작성자) | `!bUseOpt060` | **숨김** | [4191](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4191) |
| `APPRV_C_USER_NM`(공사팀장) | `bUseOpt060` | **표시** | [4192](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4192) |
| `APPRV_BD_USER_NM`(안전팀장) | `bUseOpt060` | **표시** | [4193](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4193) |
| `APPRV_A_USER_NM`(현장소장) | `bUseOpt060` | **표시** | [4194](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4194) |

→ 승인선(공사팀장/안전팀장/현장소장) 3컬럼이 060=T 전용. SCNT는 승인선을 SCNT STEP로 관리 → 이 3컬럼 표시 방식 재검토(승인패널로 이전 or 유지).

## B. 컬럼 ReadOnly / 클래스 — `gridMainControl` (4332~)

| 컬럼 | 규칙 | 참조 |
|---|---|---|
| `SYNTH_CONSTR_OP`(공사팀의견) | `readOnly = bUseOpt060` (060=T면 본문에선 잠금, 승인단계에서만 입력) | [4388](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4388) |
| `SYNTH_SAF_OP`(안전팀의견) | `readOnly = bUseOpt060` | [4389](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4389) |
| `C_USER_NM` | `readOnly = bUseOpt060` | [4391](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4391) |
| `APPRV_C_USER_NM` | `readOnly = !bUseOpt060 \|\| APPRV_C_TF=='T'` | [4392](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4392) |
| `APPRV_BD_USER_NM` | `readOnly = !bUseOpt060 \|\| APPRV_BD_TF=='T'` | [4393](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4393) |
| `APPRV_A_USER_NM` | `readOnly = !bUseOpt060` | [4394](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4394) |
| `APPRV_CMT`(승인의견) | `readOnly = (!bUseOpt060 && bEditImpsbl) \|\| (bUseOpt060 && STTS_CD!='20')` | [4395](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4395) |
| `APPRV_C/BD/A_USER_NM` notnull class | `STTS_CD!=20 && bUseOpt060` → `cipc-notnull` | [4364-4368](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4364-L4368) |

## C. 필수값(NotNull) — `optControl` (4261~)

| 대상 | 규칙 | 참조 |
|---|---|---|
| wgrdMain 추가필수 = `APPRV_C_USER_NM, APPRV_BD_USER_NM, APPRV_A_USER_NM` | `if(bUseOpt060)` | [4261-4263](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4261-L4263) |

→ 060=T면 승인선 3명 지정이 저장 필수. SCNT는 승인선 유효성을 SCNT USETGT/LINE에서 검증 → 이 notnull 규칙 제거/대체.

## D. 상태코드(STTS_CD)·상태명(STATUS) 부여 — 승인 여부로 분기

| 지점 | 060=T | 060=F(else) | 참조 |
|---|---|---|---|
| 추가(add) 시 | STATUS=`공사팀장승인대기`, STTS_CD=`30` | `접수`, `20` | [1407-1408](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1407-L1408) |
| 접수전송(send) 시 | STTS_CD=`30` | `20` | [3299](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3299) |
| 추가 시 승인선 컬럼 세팅 | `APPRV_C/BD/A_USER_NO/NM` + `APPRV_*_TF='F'` (프로젝트권한 wdlProjAuth에서) | 동일하게 세팅되나 무의미 | [1416-1424](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1416-L1424) |

→ **SCNT seam 핵심**: 이 자리에서 060_003=T면 SCNT 초기상태(STS_CODE=10/20 + DEM 생성)로 분기. else(비승인) 경로로 두면 SCNT 현장이 "접수/20"에 머물러 승인이 안 걸림.

## E. 승인 액션 서브시스템 (060=T 전제로만 동작)

| 구성 | 설명 | 참조 |
|---|---|---|
| 승인/승인취소 버튼 노출 | `rBtnCstCtr`: `wbtnApprv`←`APPRV='T'`, `wbtnApprvCnc`←`APPRV_CNC='T'`. 이 컬럼은 **SQL이 `SFAS_OPT_060='T'`일 때만 T 산출**(SfasRegAtRiskasmtRcptSql 643~710) | [1023-1024](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1023-L1024) |
| 승인 클릭 | `wbtnApprv_onclick` → 검토의견 게이트 → `executeApprv` or `wsmTrscCmtCont` | [3796](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3796), [3980-3992](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3980-L3992) |
| 승인 실행 | `executeApprv` → `wdmTrscApprv`(TAG=APPRV) → `wsmTrscApprv`(`/trscApprv.do`) | [4129](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4129), [834](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L834) |
| 승인취소 | `wbtnApprvCnc_onclick` → `wbtnApprvCnc_onclick_callback`(TAG=CANCEL) | [3965](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3965), [4016](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4016) |
| 승인의견 팝업 | `SfasPopRegConfirmOpinion` | [3942](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3942), [3959](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3959) |
| 상태별 수정불가 안내 | `scwin.sMsg`(STTS_CD 40/50/60) | [4139-4151](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L4139-L4151) |

→ 전체를 **SCNT 승인패널(`cips.sanction.request/act/cancel` + `CommonSanctionPanel`)로 대체**. 060_003=T면 이 레거시 버튼군 대신 SCNT 패널 노출.

## F. 수정/삭제/순서변경 잠금 — `060=T && EDIT_TF=F` (승인 진행중 잠금)

| 지점 | 동작 | 참조 |
|---|---|---|
| 추가/삽입 전 | 060=T면 `sMsg` 안내 후 차단 | [1363-1366](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1363-L1366) |
| 삭제 조건 | `bUpdImpsbl && bUseOpt060` → 차단 | [1815](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1815), [1824-1831](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1824-L1831) |
| 순서변경(up/down) | 060=T면 차단 | [1874-1877](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L1874-L1877) |
| 일괄수정(BdlUpdAll) 진입 | 060=T면 차단 | [3401-3404](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3401-L3404) |
| 일괄수정(Main) 대상 검증 | 060=T면 차단 | [3609-3613](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3609-L3613) |
| 일괄수정 팝업 높이 | 060=T=290 / else=225 | [3619-3623](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3619-L3623) |
| 일괄수정 파라미터 | `SFAS_OPT_060` 팝업 전달 → `SfasPopRegAssesmentApplyAll`도 060 분기 | [3640](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3640) |
| 일괄수정 콜백 | 060=T면 `APPRV_C_USER_*` 세팅 / else `C_USER_*` | [3654-3664](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3654-L3664) |

→ SCNT는 "잠금" 여부를 DEM 진행상태로 판단해야 함. `EDIT_TF`/`sMsg`(APPRV_BD/A_USER_NM 참조)를 SCNT 단계정보 기반으로 교체.

## G. 검토의견 필수 게이트 (승인 직전) — 060_001/060_002/092 연동

| 지점 | 규칙 | 참조 |
|---|---|---|
| 승인 시 게이트 | `(092=F && 060_001=='A') \|\| (092=T && 060_002!='T')` → 바로 승인 / else 검토의견작성 요청(`wsmTrscCmtCont`) | [3982-3991](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3982-L3991) |
| 종합검토의견 검증파라미터 | `SMR_CFM_OP_VER_TF: SFAS_OPT_060_002` | [3937](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3937), [3954](../../src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml#L3954) |

→ 계획 A3/A5: **검토의견 필수검증을 SCNT `validateBeforeDemand`(요청 전 게이트)로 이전**. 060_003=T면 060_001/060_002 무의미(admin에서 readonly) → 이 게이트는 SCNT 검증으로 대체.

---

## 요약 — 060_003 도입 시 처리 원칙

1. **자동 무력화(별도 작업 불필요)**: A~G의 `060=T` 분기는 060=F가 되면 자동으로 안 탐. 레거시 승인 컬럼·버튼·잠금이 사라짐. ✅
2. **반드시 SCNT 분기 삽입(seam)**: D(상태부여)·E(승인액션)·F(잠금판단)·G(검토의견게이트)는 else 경로가 "비승인"이라 **SCNT 경로를 새로 넣어야** 함. 안 넣으면 SCNT 현장이 승인 없는 "접수/20"에 방치됨.
3. **컬럼 재배치(A/B/C)**: 승인선 3컬럼(APPRV_C/BD/A_USER_NM)·의견 컬럼은 SCNT 승인패널로 이전할지, 그리드에 유지할지 결정 필요.
4. **SQL 연동**: 버튼 노출 컬럼 `APPRV`/`APPRV_CNC`(SfasRegAtRiskasmtRcptSql 643~710)도 `060='T'` 기준 → SCNT는 이 산출식을 `060_003` 대응으로 확장 or SCNT 패널로 대체.

> Sub(협력사) 화면 `SfasRegAtRiskasmtSub.xml`도 동일 패턴 예상 — 별도 목록 작성 예정.
