# [백로그] 협력사(Sub) 화면 SCNT 배선 — 원청 마무리 후 착수

> 작성: 2026-07-21 / 이찬호
> 성격: 신규 기능 (협력사 SfasRegAtRiskasmtSub 를 SCNT 승인에 연동)
> 선행: 원청(SfasRegAtRiskasmtRcpt) 잔여 작업 완료 후 착수
> 관련: [SCNT_구현방식_공유.md](./SCNT_구현방식_공유.md)

## 확정된 설계 (협력사 혼란 최소화)

**협력 화면도 원청과 동일 패턴으로 미러링한다.** 제출 버튼을 레거시/SCNT 로 분리:

```
[레거시 현장]  제출 버튼      → updateSend (기존 그대로)
[SCNT 현장]    승인요청 버튼   → ① updateSend 복사(REGIS→RECEIVE)
                                 ② createDemand (승인라인 생성, 시스템 기본라인 · 협력사는 읽기전용)
                                 ③ actSanction (요청, 요청자=협력사 사용자)
               요청취소 버튼   → cancelSanction (demCancel)
```

- **협력사 멘탈모델**: "승인요청 = 기존 제출". 레거시 현장 협력사는 변화 없음(제출 그대로) → 대다수 혼란 0.
- 협력 화면은 옵션(060/060_003)을 지금 안 봄 — **아직 협력 작업을 안 해서**일 뿐, 배선 시 원청처럼 wdlCdOpt 조회 추가.

## 핵심 근거 — 왜 Merge 가 필요한가 (CESC 대비)

| | CESC | 위험성평가 |
|---|---|---|
| 테이블 | **단일** TCESC_EQUIPCHK | **이중** TSF_ASSMNT_REGIS(협력) + TSF_ASSMNT_RECEIVE(원청) |
| 협력 승인요청 | actSanction + 상태변경 끝 | actSanction + **REGIS→RECEIVE Merge 필수** |

- CESC 는 같은 행이라 협력 요청 시 원청이 바로 봄 → Merge 불필요.
- 위험성평가는 협력(REGIS)/원청(RECEIVE) 물리적 별도 행 → **복사 안 하면 원청 목록에 안 뜸**.
- 레거시에선 `updateSend`(제출)가 이 Merge 수행. SCNT 는 제출=승인요청 대체이므로 **Merge 가 승인요청 흐름에 붙어야 함**.

## Merge 위치 — (나) Sub 서비스 오케스트레이션 채택

CESC `CescPopRegCooperationEquipmentSafetyCheckServiceImpl.trscSubmit` 선례:
`cfmService.actSanction() + mapper.trscUpdSts()` 를 **서비스에서 순서 조합**.

→ 우리도 **Sub 서비스**가 `updateSend`(기존 복사 재사용) + Bridge(라인+요청)를 시퀀싱.
- handler 는 무변경 (CFM_* 기록만 담당 — 관심사 분리)
- 복사 로직은 `updateSend` 원위치 유지 (이중관리 없음)
- (가) handler 에 Merge 넣기 = 협력/원청 공용 handler 라 조건분기·불필요 실행 → 비채택
- (다) 복사 프로시저 추출 = updateSend 리팩터 필요 → 지금은 과함

## 유의점

1. **협력사는 승인라인 설정 불가 → 읽기전용**. 원청 결재자를 협력사가 정하면 안 됨.
   `selectDefaultSanctionLineStep` 이 원청 회사/현장 기준이라 자동으로 맞음.
2. **제출취소 = 요청취소(demCancel)** 로 매핑. 협력사가 되돌릴 수 있게.
3. **복사 타이밍**: updateSend 는 복사 외에 CHECK_TF='F'·STTS_CD='10' 세팅 + TBM 검증도 함.
   승인요청 시 이 부작용이 문제없는지 확인 필요.
4. REGIS 의 CFM_* 는 이미 handler(updateCfmRegis)가 기록 → Sub 화면이 REGIS 조회로 상태 표시.

## 착수 단계 (원청 미러링 순서)

- [ ] Sub SQL selectCdOpt 에 060/060_003 추가 + 화면 wdlCdOpt·oOptConfig 배선
- [ ] 제출 버튼 060_003 분기 (레거시 제출 / SCNT 승인요청)
- [ ] 승인패널(wfrmSanctnGrid/Button) + cips_sanction.js Sub 화면 include
- [ ] Sub 서비스 trscSubmit: updateSend(복사) → createDemand → actSanction 시퀀싱
- [ ] 요청취소 = demCancel 배선
- [ ] Sub 상태/단계/대기자 표시 (원청과 동일, REGIS 기준)
- [ ] 실동작 검증: 협력 승인요청 → 원청 목록 노출 확인
