# 통합 스모크 가이드 — 상시·수시위험성평가 접수 / 승인팝업

> 2026-08-04~05 작업분을 **한 번에** 확인하기 위한 가이드. 통과 후 이 문서는 삭제.

## 검증 대상 3건

| # | 작업 | 상태 | 성격 |
|---|---|---|---|
| A | 접수 화면 미사용 컬럼 정리 + 감소조치자 사번 오타 수정 + 파일프레임 네이밍 | 커밋 `b6e68ba52` | 죽은 코드 제거(기능 무변) + **버그 수정 1건** |
| B | 승인팝업 항목별 검토의견 검증 서버 일원화 | 커밋 `98f42b62a` | **동작 변경** |
| C | 접수 화면 `dataCollection` 물리 순서 정렬 | **미커밋** | 순수 이동(기능 무변) |
| D | 코드성 데이터셋 2종 네이밍 보정 (`ProjAuth`→`CdProjRo`, `ChkDr`→`CdCoopRoCnt`) — **URL 포함** | **미커밋** | 리네임(기능 무변) |

> **A·C는 "아무것도 안 바뀌는 게 정상"**, **B와 A의 오타 수정만 동작이 바뀐다.**

---

## 0. 준비

1. Eclipse(m2e) 빌드 → **톰캣 재기동**
   - SQL 매퍼 XML은 MyBatis가 **기동 시** 읽으므로 재기동 필수
   - Java(Controller) 변경분도 재기동 필요
2. 브라우저 **Ctrl+F5** (wqxml은 정적 리소스 — 캐시 주의)
3. **브라우저 콘솔 + 서버 로그를 열어둔 채** 진행
   - WebSquare는 조용히 실패하는 경우가 많아 콘솔이 유일한 단서일 때가 있다
   - `ORA-` 오류는 서버 로그에 먼저 찍힌다

---

## 1. 접수 화면 (A + C)

### 1-1. 화면 진입 — 🔴 최우선
| 확인 | 통과 기준 |
|---|---|
| 화면이 정상적으로 그려지는가 | 콘솔 에러 0. **C(정렬)와 A(파일프레임 리네임)가 깨졌다면 여기서 바로 드러난다** |
| **공정표 / 참석자·서명지 사진 탭 전환** | 두 탭 모두 열리고 첨부 목록이 보임 — `wfrmFilePic→wfrmPhoto`, `wtabReq→wtctrFile` 리네임 자리 |
| **검토의견 그리드 2개**(공사/안전) 표시 | `wcpntGrpGrdSub2/3 → wcpntGrpGrdConstrRvw/SafRvw` 리네임 자리 |
| 옵션별 컬럼 표시(중점·이전등급·3D 등) | 이전과 동일 — `SFAS_OPT_088`·`wdmScAll.SFAS_OPT_113` 제거 영향 확인 |

### 1-2. 공사내용 저장 — 🔴 SQL 문법 위험 구간
| 확인 | 통과 기준 |
|---|---|
| **기존 행 수정 후 저장** | 정상 저장. `updateCont`에서 **SET 절 마지막 항목의 콤마를 제거**한 자리라, 틀렸으면 `ORA-00933`/`ORA-00971` 즉시 발생 |
| **라인 추가 후 저장** | 정상 저장 (`insertCont` 컬럼 제거분 개수 일치 확인) |
| 저장 후 재조회 | 값이 그대로 보임 |

### 1-3. 평가서 등록·수정·삭제
| 확인 | 통과 기준 |
|---|---|
| 평가서 등록 | `MONTHLY_COUNT` 제거 영향 — 정상 등록 |
| 평가서 수정 | 정상 |
| **평가서 삭제** | 정상. 삭제 시 `DTDB_` 아카이브 복사가 도는데, 컬럼/Select 개수가 어긋나면 `ORA-00913` |

### 1-4. 가져오기 4종
| 확인 | 통과 기준 |
|---|---|
| 전회차 / 타현장 / 표준모델 가져오기 | 정상 동작 + 가져온 행 **수정 시 오류 없음**(초기화 21줄 제거 자리) |
| **재해사례 가져오기** | 정상. `COL_1ST~COL_6TH`는 유지했으므로 **반드시 동작해야 함** |

### 1-5. 검토의견 / 3D
| 확인 | 통과 기준 |
|---|---|
| 검토의견 등록·수정·삭제(공사/안전) | 정상 (CMT insert에서 컬럼 1개 제거) |
| 3D 좌표 등록/수정, 마커 표시 | 정상 |

### 1-5b. 🔴 리네임된 코드성 데이터셋 2종 (D) — **엔드포인트가 바뀌었다**

| 확인 | 통과 기준 |
|---|---|
| **평가서 신규 등록(라인 추가)** 시 승인선 담당자 자동 세팅 | 공사팀장·안전팀장·현장소장이 **자동으로 채워짐**. `wdlCdProjRo`(구 `wdlProjAuth`)가 공급원 — 조회가 실패하면 **빈 값으로 조용히 넘어간다** |
| **접수 버튼** 클릭 시 협력사 직책 검증 | 직책 미지정 협력사면 *"○○사 현장소장, 근로자대표가 지정되지 않았습니다"* 노출. `wdlCdCoopRoCnt`(구 `wdlChkDr`) |
| 네트워크 탭 | `selectCdProjRoList.do` · `selectCdCoopRoCntList.do` 호출되고 **404 아님** |

> URL까지 바꿨으므로 **화면 action ↔ Controller `@RequestMapping`이 어긋나면 404**가 난다. 위 두 건이 이번 리네임의 유일한 실패 지점이다.

### 1-6. ⭐ 감소조치자 사번 — **유일하게 "없던 동작이 생기는" 항목**
1. 공사내용 **라인 추가** → **감소조치자 지정**(반드시 사용자 검색 팝업으로 선택. 직접 타이핑하면 이름만 들어갈 수 있음) → **저장**
2. 아래 쿼리로 확인 (**PMIS4**)

```sql
Select
    a.REGIS_SEQ,
    a.REGIS_DETAIL_SEQ,
    a.IMPRV_EDU_USER,
    a.IMPRV_EDU_USER_NO
From
    TSF_ASSMNT_REGIS_DETAIL a
Where 1 = 1
And a.CRTDATE >= Trunc(Sysdate)
Order By
    a.REGIS_DETAIL_SEQ Desc
```

| 결과 | 판정 |
|---|---|
| 이름·사번 **둘 다** 채워짐 | ✅ 통과 (수정 전에는 사번이 항상 null이었다) |
| 사번만 비어 있음 | ❌ 오타 수정이 안 먹음 |

> 원청(`TSF_ASSMNT_RECEIVE_DETAIL`)은 원래 정상이었으므로 **양쪽 사번이 같은 값**인지 비교하면 확실하다.
> 사번이 채워지면서 영향받는 하위 로직(알림 발송 대상 등)이 없는지도 함께 확인.

---

## 2. 승인팝업 (B) — 동작 변경

**무엇이 바뀌었나**: 검토의견 검증을 **클라이언트 → 서버**로 옮겼다.
기존에는 화면 데이터셋(`wdlConstrRvw`/`wdlSafRvw`)이 **선택된 1건만** 담는데 전 항목을 검사해서, 의견이 다 있어도 항상 차단됐다.
이제 부모(접수 화면)와 **같은 쿼리**(`selectCdRvwOpChk`)로 서버가 평가서 전체를 판정한다.

| # | 시나리오 | 통과 기준 |
|---|---|---|
| 2-1 | 검토의견 **전 항목 등록** 상태에서 승인요청 | ✅ **통과해야 함** (기존 버그 해소 확인 — 재현 데이터: `30212 / GC001 / 8960`) |
| 2-2 | 한 항목의 검토의견을 **비우고** 승인요청 | "등록되지 않은 검토의견이 있습니다"로 **차단** |
| 2-3 | `060_001 = 'C'`(중점만) 현장에서 **중점 아닌 항목만** 비어 있을 때 | ✅ **통과해야 함** (서버 중점 필터 동작 확인) |
| 2-4 | `060_001 = 'A'` 또는 `092 = T` 현장 | 서버 조회 **없이** 즉시 진행 — 네트워크 탭에 `selectCdRvwOpChk.do` **미호출** |
| 2-5 | 승인 / 반려 / 요청취소 / 승인취소 | 기존과 동일 (검증 게이트는 **승인요청에만** 걸린다) |

### 확인용 SQL — 항목별 검토의견 현황
```sql
Select
    a.REGIS_DETAIL_SEQ,
    a.PRIORITY,
    (Select Count(*) From TSF_ASSMNT_RECIVE_CONST_CMT x
      Where 1 = 1
      And x.COMPANY_ID = a.COMPANY_ID
      And x.PROJ_CODE = a.PROJ_CODE
      And x.R_COMPANY_ID = a.R_COMPANY_ID
      And x.REGIS_SEQ = a.REGIS_SEQ
      And x.REGIS_DETAIL_SEQ = a.REGIS_DETAIL_SEQ) CONST_CNT,
    (Select Count(*) From TSF_ASSMNT_RECIVE_SAFE_CMT x
      Where 1 = 1
      And x.COMPANY_ID = a.COMPANY_ID
      And x.PROJ_CODE = a.PROJ_CODE
      And x.R_COMPANY_ID = a.R_COMPANY_ID
      And x.REGIS_SEQ = a.REGIS_SEQ
      And x.REGIS_DETAIL_SEQ = a.REGIS_DETAIL_SEQ) SAFE_CNT
From
    TSF_ASSMNT_RECEIVE_DETAIL a
Where 1 = 1
And a.COMPANY_ID = 30212
And a.PROJ_CODE = 'GC001'
And a.REGIS_SEQ = 8960
Order By
    a.REGIS_DETAIL_SEQ
```
`CONST_CNT`/`SAFE_CNT`가 0인 항목이 곧 차단 대상이다. 전부 1 이상이면 2-1이 통과해야 정상.

---

## 3. 문제 발생 시 — 원인 역추적

| 증상 | 유력 원인 | 확인처 |
|---|---|---|
| 화면 자체가 안 그려짐 | **C(정렬)** 또는 A의 파일프레임 리네임 | 콘솔 첫 에러의 컴포넌트명 → 정의(`id="..."`) 존재 여부 |
| 특정 탭·그리드만 안 보임 | 리네임 누락 | `wfrmPhoto`·`wtctrFile`·`wcpntGrpGrdConstrRvw`·`wcpntGrpGrdSafRvw` 정의/참조 짝 |
| 저장 시 `ORA-00933`/`00971` | `updateCont` SET 절 콤마 | SQL 4031행 부근 `ACC_TF = #{ACC_TF}` 뒤에 콤마 없어야 함 |
| 저장/삭제 시 `ORA-00913` | INSERT 컬럼수 ≠ VALUES | 해당 statement 컬럼·값 개수 |
| 승인요청이 무조건 차단 | B의 키 세팅 | `wdmScAll`의 `COMPANY_ID`·`PROJ_CODE`·`R_COMPANY_ID`·`REGIS_SEQ` 값 |
| 승인요청이 **검증 없이 통과** | B의 빈 키 → 0행을 통과로 오인 | 위와 동일. 가드가 걸리면 "검토의견을 확인할 수 없습니다" 메시지가 떠야 정상 |

### 되돌리기
- C(미커밋)만 되돌리기: `git checkout -- src/main/webapp/wqxml/sfas/SfasRegAtRiskasmtRcpt.xml`
- A / B는 각각 커밋 `b6e68ba52` / `98f42b62a` 단위로 revert 가능

---

## 4. 통과 후

1. **C + D 커밋** (성격이 같은 정리 작업이므로 함께, 또는 2개로 분리)
   ```
   2026-08-05 / 이찬호 / - / 상시수시위험성평가서접수 코드성 데이터셋 네이밍 보정(ProjAuth→CdProjRo, ChkDr→CdCoopRoCnt) 및 dataCollection 물리 순서 정렬
   ```
   > 분리한다면 D(리네임) → C(정렬) 순서. 정렬은 리네임 결과를 전제로 하기 때문.
2. 이 문서 삭제 + README 행 제거
3. 다음 후보: 사내 SQL 컨벤션 전수 점검 → 동적 컬럼 참조 전수 → 쿼리 실행계획 → 단어사전 일괄반영
