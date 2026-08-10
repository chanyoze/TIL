# 🐛 승인팝업 — 검토의견이 다 있는데 "등록되지 않은 검토의견이 있습니다"로 막힘

**대상**: [SfasPopRegRiskAssessmentConfirm.xml](../../../src/main/webapp/wqxml/sfas/SfasPopRegRiskAssessmentConfirm.xml) `scwin.fnValidatePerItemCmt`(916~) / `scwin.fnHasItemCmt`(937~)
**재현 데이터**: `COMPANY_ID=30212` · `PROJ_CODE='GC001'` · `REGIS_SEQ=8960` (PMIS4)

## 증상
검토의견이 전 항목에 등록돼 있는데도 승인 시 차단됨.

## DB 실측 — 데이터는 문제없음 (PMIS4)

| REGIS_DETAIL_SEQ | PRIORITY | 공사의견 | 안전의견 |
|---|---|---|---|
| 769428 | O | 2 | 1 |
| 769429 | O | 1 | 1 |
| 769430 | O | 1 | 1 |
| 769471 | (null) | 1 | 1 |

→ 4항목 전부 공사·안전 의견 보유. **데이터가 아니라 화면 로직 문제.**

## 원인 — 검증 범위(전 항목)와 데이터셋 로딩 범위(선택 1건)의 불일치

**로딩 쪽**: 검토의견 데이터셋은 **현재 선택된 공사내용 1건**만 담는다.
```js
// SfasPopRegRiskAssessmentConfirm.xml 556-571
const fnFromRow = function(oDm, oParent, asCols) {
  const nIdx = oParent.getRowPosition();          // ← 현재 선택 행 하나
  asCols.forEach(function(sCol) { oDm.set(sCol, oParent.getCellData(nIdx, sCol)); });
};
…
} else if(asDataId == wdlConstrRvw.getID()) {
  fnFromRow(wdmScConstrRvw, wdlCont, [..., "REGIS_DETAIL_SEQ"]);   // ← 상세순번까지 조건에 포함
}
```
```sql
-- SfasPopRegRiskAssessmentConfirmSql.xml  selectConstrRvwList / selectSafRvwList
Where 1 = 1
And a.COMPANY_ID = #{COMPANY_ID}
…
And a.REGIS_DETAIL_SEQ = #{REGIS_DETAIL_SEQ}   -- ← 한 항목으로 필터
```

**검증 쪽**: `wdlCont` **전 행**을 돌며 각 행의 상세순번으로 그 데이터셋을 뒤진다.
```js
for(let i = 0; i < nCnt; i++) {
  const sDetailSeq = wdlCont.getCellData(i, "REGIS_DETAIL_SEQ");
  if(!scwin.fnHasItemCmt(wdlConstrRvw, sDetailSeq) || !scwin.fnHasItemCmt(wdlSafRvw, sDetailSeq)) { … 차단 }
}
```

→ **선택된 행 외의 항목은 데이터셋에 존재하지 않으므로** `getMatchedIndex`가 빈 배열 → `fnHasItemCmt` false → 무조건 차단.
첫 행이 선택된 상태라면 **두 번째 행에서 즉시 실패**한다. 항목이 2개 이상이면 사실상 항상 막힌다.

## ✅ A안 반영 완료 (2026-08-04)

**팝업 wqxml** ([SfasPopRegRiskAssessmentConfirm.xml](../../../src/main/webapp/wqxml/sfas/SfasPopRegRiskAssessmentConfirm.xml))
- `wdmScCdRvwOpChk`(키 5) + `wdlCdRvwOpChk`(REGIS_DETAIL_SEQ·SORT_NO·CHK1·CHK2) + `wsmInqCdRvwOpChk` 추가
- `setDatasets`에 `bCdData: true, bCdDataAutoLoad: false`로 등록(부모와 동일 — 자동로드 없음)
- `fnValidatePerItemCmt`를 **비동기 게이트**로 재작성: 통과 시 실행할 동작을 `afnPass`로 받고, `092=T`/`060_001='A'`면 **서버 왕복 없이 즉시 통과**
- `onDataLoad`에 `wdlCdRvwOpChk` 분기 추가 → `fnAfterCmtChkLoad()`가 판정
- `fnHasItemCmt` **삭제**(클라이언트 검증 폐기)
- 승인요청 흐름: `if(!fnValidatePerItemCmt()) return;` → `fnValidatePerItemCmt(function(){ cips.sanction.request(...) })`

**팝업 Controller** ([SfasPopRegRiskAssessmentConfirmController.java](../../../src/main/java/com/cip/defg/saas/module/sfas/web/SfasPopRegRiskAssessmentConfirmController.java))
- `private final SfasRegAtRiskasmtRcptService` 주입(기존 `@RequiredArgsConstructor` 스타일 유지 — AGENTS.md C항)
- `/sfas/SfasPopRegRiskAssessmentConfirm/selectCdRvwOpChk.do` 추가 → 부모 서비스에 위임
- **SQL·Mapper·Service 무변경** (부모 쿼리 그대로 재사용)

**넣은 안전장치**
- 키(`COMPANY_ID`·`PROJ_CODE`·`R_COMPANY_ID`·`REGIS_SEQ`) 중 하나라도 비면 **조회 전에 차단** — 빈 키는 0행을 부르고 그게 "통과"로 둔갑하기 때문
- `fnPassAfterCmtChk` 핸들이 없으면 `onDataLoad` 판정을 **건너뜀**(다른 경로의 조회에 반응하지 않도록)

**검증**: JS 파싱 OK · XML 태그 균형 0 · Java 중괄호 균형 0 · `fnHasItemCmt` 잔여 0 · 기능 변경분 `git diff -w` 기준 **+73/-21**
**미검증**: 실행 테스트 안 함 (아래 테스트 포인트 참조)

### 🐛 A안 반영 직후 발견된 후속 결함 (2026-08-05, 수정 완료)

**증상**: `SFAS_OPT_060_001 = 'A'`(검증 안 함) 현장인데도 승인요청이 차단됨.

**원인 — 팝업 `wdlCdOpt`에 `SFAS_OPT_060_001` 컬럼 선언이 없었다.**
- 팝업 SQL `selectCdOpt`는 **정상적으로 뽑고 있었다**(37행)
- 그런데 `wdlCdOpt` dataList에 컬럼이 없어 **WebSquare가 값을 버림** → `wdlCdOpt.getCellData(0, "SFAS_OPT_060_001")`이 빈 값
- → `oOptConfig.bUseOpt060001`이 `"A"`가 아님 → **단축 통과 불발** → 서버 검증 진행
- → `#{SFAS_OPT_060_001}`도 빈 값 전달 → 쿼리의 `!= 'C'` 조건이 참 → **전 항목 검사** → 차단

**데이터로 증명** (PMIS4 · `30212 / GC001 / 9009`)

| 확인 | 값 |
|---|---|
| 현장 옵션 | `060=F` · **`060_001=A`** · `060_002=T` · `060_003=T` · `092=F` |
| 평가서 | `STTS_CD=20` · `CHECK_TF=T` · `CFM_DEM_SN=12401` · `CFM_STS_CODE=REG` · 상세 13건 |
| 검토의견 | **13건 중 10건이 공사·안전 모두 0건** (중점 `PRIORITY='O'`도 1건 포함) |

→ 옵션대로면 검증 없이 통과해야 하는데, 옵션이 전달되지 않아 10건이 걸려 차단된 것.

**조치**: `wdlCdOpt`에 `<w2:column id="SFAS_OPT_060_001" …>` 추가(`SFAS_OPT_060`과 `060_002` 사이).
**재발 방지 스캔**: `wdlCdOpt.getCellData(0, "…")`로 읽는 옵션 **21종 ↔ dataList 선언** 전수 대조 → 전부 선언됨 확인.

> 💡 **교훈**: SQL이 뽑아도 **dataList에 컬럼이 없으면 값이 조용히 사라진다.** 옵션 분기는 빈 값이면 "옵션 꺼짐"이 아니라 **의도와 반대로 동작**할 수 있으므로, 새 옵션을 참조할 때는 반드시 dataList 선언을 먼저 확인할 것.

> 📌 **부수 발견(미조치)**: 팝업 `selectCdOpt`가 뽑지만 `wdlCdOpt`에 없어 버려지는 옵션 **10종** — `041`·`042`·`048_001_001`·`048_001_002`·`053`·`053_001`·`059`·`074`·`088`·`095`. 읽는 곳이 없어 무해하나 정리 대상.

### 테스트 포인트
1. 검토의견 **전부 등록** 상태에서 승인요청 → **통과**해야 함(현 버그 해소 확인)
2. 한 항목의 검토의견을 **비우고** 승인요청 → "등록되지 않은 검토의견이 있습니다"로 차단
3. `060_001 = 'C'`(중점만) 현장에서 **중점 아닌 항목**만 비어 있을 때 → **통과**해야 함(서버 필터 동작 확인)
4. `060_001 = 'A'` 또는 `092 = T` 현장 → 서버 조회 없이 즉시 진행(네트워크 탭에 `selectCdRvwOpChk.do` 미호출)

---

## 해결안 (검토 시 비교했던 3안)

### A. 서버 일괄 검증 쿼리 재사용 (권장)
[SfasRegAtRiskasmtRcptSql.xml](../../../src/main/resources/sqlmap/mappers/sfas/SfasRegAtRiskasmtRcptSql.xml) `selectCdRvwOpChk`(744~)가 **정확히 이 용도**로 이미 존재한다.
- 평가서 전체를 항목별로 집계: `REGIS_DETAIL_SEQ` + `CHK1`(공사의견 유무) + `CHK2`(안전의견 유무)
- **중점 필터 내장**: `And (#{SFAS_OPT_060_001} != 'C' Or a.PRIORITY = 'O')` (779·803)
- **결과 필터**: `And (x.CHK1 < 1 Or x.CHK2 < 1)` (814) → **의견이 빠진 항목만 반환**. 결과가 비면 통과
- 접수 화면(부모)은 이미 이걸 쓴다: `wdmScCdRvwOpChk`(414) · `wdlCdRvwOpChk`(423) · `wsmInqCdRvwOpChk`(729)

→ 팝업에서도 같은 엔드포인트를 호출하고, 반환 행 수가 0인지로 판정하면 `fnValidatePerItemCmt`/`fnHasItemCmt`를 통째로 대체할 수 있다.
타 화면이 Rcpt 서비스를 재사용하는 선례 있음(`SfasPopRegAssesmentReciveSubmissionController` → `sfasRegAtRiskasmtRcptService`).

### B. 팝업에서 전 항목 의견을 미리 로드
`selectConstrRvwList`/`selectSafRvwList`의 `REGIS_DETAIL_SEQ` 조건을 동적(`<if test>`)으로 바꿔, 표시용(선택 1건)과 검증용(평가서 전체, 별도 데이터셋)을 분리.
→ A보다 손이 많이 가고 중점 필터 로직을 클라이언트에 다시 구현해야 함.

### C. 행마다 순차 조회 — 비권장 (항목 수만큼 서버 왕복)

### 부모(접수 화면)의 실제 구현 — A안이 이식할 대상

```js
// ① 승인 버튼 콜백 (3953~) — 옵션 보고 검증 필요 여부 판단 후 조회
wdmScCdRvwOpChk.set("COMPANY_ID"/"PROJ_CODE"/"R_COMPANY_ID"/"REGIS_SEQ", …);
wdmScCdRvwOpChk.set("SFAS_OPT_060_001", wdlCdOpt.getCellData(0, "SFAS_OPT_060_001"));
cips.loadData(wdlCdRvwOpChk);                       // 비동기 조회

// ② 조회 완료 시 (onDataLoad 2214)
} else if(asDataId == wdlCdRvwOpChk.getID()) { scwin.chkCmtContList(); }

// ③ 판정 (chkCmtContList 4070~)
if(wdlCdRvwOpChk.getTotalRow() > 0) {
  for(…) {
    if(내가 공사팀장) { if(CHK1 < 1) { 메시지 + 해당 행 포커스; return false; } }
    else if(내가 안전팀장) { if(CHK2 < 1) { 메시지 + 해당 행 포커스; return false; } }
  }
}
```

> ⚠️ **역할 분기는 이식하면 안 된다 (검증 시점이 다름)**
> - 부모 `chkCmtContList` = **승인 시점**. 공사팀장이 승인하면 CHK1만, 안전팀장이면 CHK2만 본다 → 역할 분기가 맞다
> - 팝업 게이트 = **승인요청 시점**(`sAction === "request"`, 966-968). 요청은 작성자가 하므로 **역할이 아직 없다** → 양쪽(CHK1·CHK2) 모두 요구하는 현재 의도가 맞다
>
> → A안의 판정은 **역할 분기 없이 `wdlCdRvwOpChk.getTotalRow() > 0`이면 차단**. `selectCdRvwOpChk`의 결과 필터가 이미 `CHK1 < 1 Or CHK2 < 1`(814)이라 "어느 한쪽이라도 빠진 항목"만 돌려주므로 그대로 쓰면 된다.
> (초기 분석에서 "팝업이 과검증"이라 적었으나 **시점 차이를 놓친 오판**이었다. 정정함)

> 🕳️ **역함정 주의 — 빈 키가 "통과"로 둔갑한다**
> `selectCdRvwOpChk`는 `And a.R_COMPANY_ID = #{R_COMPANY_ID}` 등으로 필터한다. 키가 비면 **0행 반환 → `getTotalRow() == 0` → 검증 통과**가 되어, 의견이 없어도 조용히 승인요청이 나간다(메시지도 오류도 없음).
> → 키를 세팅하기 전에 **빈 값이면 차단**하는 가드를 반드시 둘 것. 팝업은 `wdmScAll`에 `COMPANY_ID`·`PROJ_CODE`·`R_COMPANY_ID`·`REGIS_SEQ`를 모두 보유(55행 부근)하므로 거기서 가져온다.

## 부수 관찰
- `fnValidatePerItemCmt`는 `wdlCont.getRowCount()`를 쓰는데, 이 저장소의 다른 코드는 `getTotalRow()`를 쓴다. 동작 여부는 확인 필요(현 증상의 원인은 아님 — 루프는 돌고 있음)
- 2026-07-31에도 같은 메시지가 `arIdx is not defined` 오류와 함께 발생한 이력이 있다 → 이 검증 로직은 **인덱스 처리에서 반복적으로 문제**가 있었음
