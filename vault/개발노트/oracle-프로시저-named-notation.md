---
sidebar_label: "Oracle 프로시저 Named Notation"
sidebar_position: 5
tags: [oracle, plsql, procedure, named-notation]
---

# Oracle 프로시저 Named Notation & 모듈화 INSERT 패턴

> 파라미터가 많은 INSERT/공통 처리를 **프로시저로 모듈화**할 때,
> 호출부 가독성을 살리는 **Named Notation** 패턴. (가짜 스키마로 일반화한 노트)

## 1. Positional vs Named Notation

파라미터가 10개를 넘어가면 **위치(Positional) 호출**은 무엇이 어느 자리인지 알 수 없다.

```sql
-- Positional: 순서로만 매칭 → 가독성 최악
My_Proc(30212, 'GC001', NULL, NULL, 100, ...);

-- Named: 파라미터명 => 값  → 자기설명적
My_Proc(
    P_COMPANY_ID  => 30212,
    P_PROJ_CODE   => 'GC001',
    P_REG_SN      => 100
);
```

- **혼용도 가능**하다(앞쪽 몇 개는 Positional, 나머지는 Named). 단, Named가 시작되면 그 뒤는 계속 Named.

## 2. 선택 파라미터엔 `Default Null`

키가 1개뿐인 호출처럼 **뒤쪽 값이 빌 수 있는** 경우, 기본값을 줘서 호출부를 짧게 만든다.

```sql
Create Or Replace Procedure Sample_Conn_I
(
    P_COL_1ST          Varchar2,               -- 최소 1개는 필수 → Default 없음
    P_COL_2ND          Varchar2 Default Null,  -- 이후는 빌 수 있음
    P_COL_3RD          Varchar2 Default Null,
    P_SESSION_USER_NO  Number
)
Is
Begin
    -- ...
    Null;
End;
/
```

## 3. 모듈화 INSERT — "공통 연결정보" 한 곳에서

같은 형태의 연결/이력 INSERT가 여러 도메인에서 반복되면, **공통 프로시저 1개**로 모아 중복을 없앤다.

```sql
Procedure Sample_Conn_Insert
(
    P_SECT_CODE        Varchar2,   -- 어느 도메인 분기인지
    P_COMPANY_ID       Number,
    P_PROJ_CODE        Varchar2,
    P_CONN_SN          Number,     -- 없으면 시퀀스로 생성
    P_SESSION_USER_NO  Number
)
Is
    lnConnSn Number;
Begin
    lnConnSn := P_CONN_SN;

    If lnConnSn Is Null Then
        Select Sample_Conn_Seq.Nextval Into lnConnSn From Dual;  -- 시퀀스 채번
    End If;

    If P_SECT_CODE = 'A' Then
        Insert Into TB_SAMPLE_CONN (COMPANY_ID, PROJ_CODE, CONN_SN, CRTUSERNO, CRTDATE)
        Select P_COMPANY_ID, P_PROJ_CODE, lnConnSn, P_SESSION_USER_NO, Sysdate
        From   Dual;
    End If;
End;
```

## 4. 파라미터 ↔ 컬럼 매핑은 주석으로

범용 파라미터명(`P_COL_1ST` 등)을 쓰면 재사용성은 오르지만 **무엇을 넣는지 불분명**해진다.
호출부에 `파라미터: 테이블.컬럼` 형식 주석을 남기면 추적이 쉽다.

```sql
Sample_Conn_Insert(
    P_COL_1ST => 30212,    -- COL_1ST: TB_SAMPLE.COMPANY_ID
    P_COL_2ND => 'GC001'   -- COL_2ND: TB_SAMPLE.PROJ_CODE
);
```

> (실무 메모) "주석으로 매핑 남기기"는 일관 적용이 어려워 **표준에서 빠지기도** 한다. 팀 합의 후 도입 여부를 정할 것.

## 트레이드오프

| 장점 | 주의점 |
|---|---|
| 호출부 가독성↑, 선택 파라미터 생략 가능 | 범용 파라미터명은 의미 불명 → 주석/문서 필요 |
| 반복 INSERT 중복 제거(모듈화) | 분기(`SECT_CODE`)가 늘면 프로시저가 비대해짐 |
| 시퀀스 채번 등 공통 로직 일원화 | 컬럼 추가 시 공통 프로시저 영향 범위 큼 |
