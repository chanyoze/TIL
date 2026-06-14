---
sidebar_label: "WebSquare·전자정부 SI 스택 정리"
sidebar_position: 2
tags: [websquare, egovframe, spring, oracle, mybatis, si]
---

# WebSquare 기반 전자정부 SI 스택 정리

> 공공/SI 환경에서 흔히 쓰는 **WebSquare + 전자정부 표준프레임워크 + Spring + Oracle** 조합을
> 신입 관점에서 한 장에 정리한 노트. (특정 회사·고객 무관한 일반 구조)

## 전체 그림

```
[XML/JS 화면]  --WebSquare 엔진-->  [HTML]
     │ Submission(요청)
     ▼
[Spring Controller] --MyBatis--> [Oracle DB]
                                  (비즈니스 로직 상당수가 SQL/프로시저)
```

- **프론트:** WebSquare — XML 태그로 화면을 정의하면 엔진이 런타임에 **HTML로 변환**. 드래그앤드롭/스니펫으로 컴포넌트(XML 태그)를 자동 생성. 상용 라이선스 솔루션.
- **백엔드:** Spring. **전자정부 표준프레임워크(eGovFrame)** 위에서 개발 — 정부 보안 정책이 적용된 버전이라 공공사업 참여 시 사실상 필수.
- **DB:** Oracle. Spring ↔ DB 매핑은 **MyBatis**. SQL은 ANSI가 아닌 **Oracle 전통 문법**(`(+)` 아우터 조인 등)을 쓰는 현장이 많음 → [SQL 코딩 컨벤션](sql-코딩-컨벤션) 참고.
- IDE는 Eclipse 계열이 일반적.

## 화면 구조 (SPA식 탭 레이아웃)

많은 WebSquare 사이트가 **한 페이지 안에서 좌측 메뉴 → 탭으로 화면을 여는** 형태다.

```
websquare.jsp           ← 최초 진입
  └ index_tabControl.xml ← 탭 컨트롤 본체
       └ side.xml        ← 좌측 메뉴에 들어갈 화면 목록 (개발자가 주로 작업하는 단위)
```

- 공통 JS(예: `common.js`)를 모든 화면에 연결해 공통 함수·이벤트를 제공.
- `initw`류 **초기 실행 함수**: 화면이 뜰 때 가장 먼저 실행할 이벤트 정의. 그 아래에 이벤트 리스너 정의.

## 데이터 흐름 핵심 개념

| 개념 | 역할 |
|---|---|
| **Submission** | 화면 → 서버로 요청을 보내는 단위 |
| **DataCollection (= DataSet)** | 데이터 묶음. 내부에 DataMap / DataList |
| **DataMap** | 서버에 **요청 보낼 때** 쓰는 단건 맵 |
| **DataList** | 서버에서 **결과 받아올 때** 쓰는 목록 (자바 `List`와 유사) |

> 동적 기능은 자바스크립트로 처리하고, WebSquare는 **프론트(뷰)까지만** 관여. 서버 통신 본문은 보통 XML/CDATA로 오감.

## 신입이 헷갈리는 포인트

- "화면 한 개 = 파일 한 개"가 아니라 **XML(화면) + JS(동작) + 서버 SQL**이 한 세트.
- 비즈니스 로직이 자바가 아니라 **SQL/프로시저에 많이 들어있는** 현장이 흔함 → 디버깅 시 쿼리부터 본다.
- 화면 ID/메뉴는 `side.xml` 기준으로 추적하면 빠름.
