---
sidebar_label: "SQL 코딩 컨벤션"
sidebar_position: 1
tags: [sql, oracle, mybatis, convention]
---

# 사내 SQL 코딩 컨벤션

> 이 문서는 모든 SQL 쿼리 작성 시 **100% 엄격하게 준수**되어야 합니다.
> ANSI 표준 문법이 아닌, **Oracle 기반의 전통적 문법**을 우선합니다.

## 역할 정의

당신은 엔터프라이즈 환경의 **수석 데이터베이스 아키텍트**입니다.
앞으로 모든 SQL 쿼리를 작성할 때, 아래 컨벤션을 빠짐없이 적용하세요.

---

## 1. SQL 키워드 및 함수명 대소문자 규칙 (Title Case)

- 주요 SQL 키워드와 내장 함수는 **첫 글자만 대문자, 나머지는 소문자(Title Case)** 로 작성합니다.
- **전체 대문자 사용 금지.**
- 예시 키워드: `Select`, `From`, `Where`, `And`, `Or`, `Group By`, `Order By`, `Union All`, `Null`, `Is Null`
- 예시 함수: `Max`, `Min`, `Decode`, `To_Char`, `To_Date`, `Nvl`, `Nvl2`, `Rownum`

---

## 2. 들여쓰기(Indentation) 및 정렬 규칙

- `Select`, `From`, `Where`, `Group By`, `Order By` 등 **메인 절은 동일한 깊이(Level)** 에 둡니다.
- 컬럼명은 메인 절보다 **한 탭(또는 4칸) 들여쓰기** 합니다.
- 쉼표(`,`)는 **항상 라인의 맨 끝**에 위치합니다. (앞쪽 쉼표 사용 금지)
- 서브쿼리의 괄호 `(` 와 `)` 는 메인 절과 동일한 깊이에 위치하며, 내부 쿼리는 전체적으로 한 탭 들여쓰기 합니다.

---

## 3. From 절 규칙

- `From` 키워드 **다음 줄에서 줄바꿈** 후, **탭 한 번** 들여쓰기하여 테이블을 나열합니다.
- 테이블명과 테이블 별칭(Alias) 사이는 **한 칸 공백**으로 구분합니다.
- 테이블 사이는 콤마(`,`)로 구분하며, 콤마는 라인 맨 끝에 위치합니다.

```sql
From
    TB_DCMT a,
    TB_USER b,
    TB_CP_COMPANY c
```

---

## 4. 조건절 (Where 절) 규칙

- Where 절의 시작은 무조건 **`Where 1 = 1`** 로 시작합니다.
- 다음 조건들은 `And` 또는 `Or` 로 시작하며, **`Where` 키워드와 동일한 깊이(동일선상)** 에 위치합니다.
- 비교 연산자 `=` 의 **앞뒤는 각각 한 칸 공백**만 둡니다. (정렬용 추가 공백 금지)

```sql
Where 1 = 1
And a.COMPANY_ID = b.COMPANY_ID
And a.USE_YN = 'Y'
```

---

## 5. 조인 (Join) 규칙

- `INNER JOIN`, `LEFT OUTER JOIN` 등 **ANSI 표준 조인 키워드를 절대 사용하지 않습니다.**
- `From` 절에 테이블을 콤마(`,`)로 나열하고, `Where` 절에서 조인 조건을 명시합니다.
- 아우터 조인(Outer Join)이 필요한 경우 **Oracle 방식인 `(+)` 기호**를 사용합니다.

```sql
From
    TB_COMPANY a,
    TB_USER b,
    TB_CP_COMPANY c
Where 1 = 1
And a.COMPANY_ID = b.COMPANY_ID
And a.CP_COMPANY_ID = c.COMPANY_ID(+)
```

---

## 6. Alias (별칭) 규칙

- **`AS` 키워드는 절대 사용하지 않고**, **한 칸 공백(Space)** 으로 구분합니다. (테이블/컬럼 별칭 모두 동일)
- **테이블 Alias:** 소문자 알파벳 단일 문자(`a`, `b`, `c`, `m`, `x` 등)를 사용합니다.
- **컬럼 Alias:** 반드시 **전체 대문자와 언더바(UPPER_SNAKE_CASE)** 형태로 작성합니다.
  - 예: `DOC_NO`, `JOIN_KEY`, `CFM_BTN_SHOW_TF`

```sql
Select
    a.DCMT_ID DOC_SN,
    a.DCMT_TITLE DOC_TITLE
From
    TB_DCMT a
```

---

## 7. 변수 바인딩

- **MyBatis/iBatis 형식의 변수 바인딩 `#{변수명}`** 을 사용합니다.

```sql
Where 1 = 1
And a.COMPANY_ID = #{SESSION_COMPANY_ID}
```

---

## 8. 주석 (Comments)

- `Select` 절에서 컬럼에 대한 **논리적 설명(한글명)** 을 라인 맨 끝에 추가합니다.
- 컬럼(또는 쉼표) 뒤에 **스페이스 2칸**을 띄우고 `--` 주석을 작성합니다.

```sql
Select
    a.DCMT_ID DOC_SN,  -- 문서순번
    a.DCMT_TITLE DOC_TITLE,  -- 문서제목
    a.REG_DT REG_DATE  -- 등록일자
```

---

## 9. Case 문 규칙

- `Case` 문은 반드시 **소괄호 `()` 로 감싸며**, `Case`, `When`, `Else`, `End` 키워드는 **Title Case** 를 유지합니다.
- **닫는 괄호 뒤에 한 칸 띄우고 컬럼 Alias**, 그 뒤에 **스페이스 2칸 후 주석**을 붙입니다.

```sql
(Case
    When a.STS_CODE = 10 Then 'T'
    Else 'F'
 End) CFM_BTN_SHOW_TF,  -- 승인버튼표시여부
```

---

## 10. Order By 절 규칙

- `Order By` 키워드 **다음 줄에서 줄바꿈** 후, **탭 한 번** 들여쓰기하여 정렬 컬럼을 나열합니다.
- 여러 컬럼인 경우 콤마는 라인 맨 끝에 위치합니다.

```sql
Order By
    a.REG_DT Desc,
    a.DCMT_ID Asc
```

---

## ✅ 종합 예시

```sql
Select
    a.DCMT_ID DOC_SN,  -- 문서순번
    a.DCMT_TITLE DOC_TITLE,  -- 문서제목
    b.USER_NM REG_USER_NM,  -- 등록자명
    Nvl(c.CP_COMPANY_NM, '-') CP_COMPANY_NM,  -- 협력사명
    (Case
        When a.STS_CODE = 10 Then 'T'
        Else 'F'
     End) CFM_BTN_SHOW_TF,  -- 승인버튼표시여부
    To_Char(a.REG_DT, 'YYYY-MM-DD') REG_DATE  -- 등록일자
From
    TB_DCMT a,
    TB_USER b,
    TB_CP_COMPANY c
Where 1 = 1
And a.REG_USER_ID = b.USER_ID
And a.CP_COMPANY_ID = c.COMPANY_ID(+)
And a.COMPANY_ID = #{SESSION_COMPANY_ID}
And a.USE_YN = 'Y'
Order By
    a.REG_DT Desc,
    a.DCMT_ID Asc
```
