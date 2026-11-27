---
title: "Oracle 전통 문법 SQL 코딩 컨벤션"
sidebar_label: "SQL 코딩 컨벤션"
sidebar_position: 1
tags: [sql, oracle, mybatis, convention]
date: 2026-06-14
kind: 갱신
---

회사에서 MyBatis 매퍼 XML 에 SQL 을 쓸 때 맞추는 형식이다. ANSI 표준 조인 대신 **Oracle 전통 문법**(`From` 에 콤마로 나열 · `Where` 에서 조인 · 아우터 조인은 `(+)`)을 쓰고, 키워드는 첫 글자만 대문자로 쓴다. 처음에는 AI 에게 SQL 을 시킬 때 붙이는 지시문으로 썼던 것을, 규칙만 남겨 사람이 읽는 문서로 다시 정리했다. (예시의 테이블 · 컬럼 이름은 설명용이다.)

## 규칙 한눈에

| 항목 | 규칙 | 예 |
|---|---|---|
| 키워드 · 함수 대소문자 | 첫 글자만 대문자(Title Case). 전부 대문자는 쓰지 않는다 | `Select` `Group By` `Is Null` `Nvl` `To_Char` |
| 메인 절 | `Select` · `From` · `Where` · `Group By` · `Order By` 는 같은 깊이 | |
| 컬럼 | 메인 절보다 한 탭(4칸) 들여쓴다 | |
| 쉼표 | 항상 줄 끝. 앞쪽 쉼표는 쓰지 않는다 | `a.DOC_ID DOC_SN,` |
| `From` | 줄을 바꾸고 한 탭 들여 테이블을 나열한다. 테이블과 별칭은 한 칸 | `TB_DOC a,` |
| `Where` | 항상 `Where 1 = 1` 로 시작하고, 이어지는 `And` · `Or` 는 `Where` 와 같은 깊이 | |
| 비교 연산자 | `=` 앞뒤 한 칸씩만. 줄 맞춤용 공백은 넣지 않는다 | `a.USE_YN = 'Y'` |
| 조인 | ANSI 조인 키워드(`INNER JOIN` 등)를 쓰지 않는다. 아우터 조인은 `(+)` | `a.CP_ID = c.COMPANY_ID(+)` |
| 별칭 | `AS` 를 쓰지 않는다. 테이블 별칭은 소문자 한 글자, 컬럼 별칭은 UPPER_SNAKE_CASE | `a.DOC_TITLE DOC_TITLE` |
| 바인딩 | MyBatis `#{변수명}` | `#{SESSION_COMPANY_ID}` |
| 주석 | `Select` 컬럼 끝에 공백 두 칸 + `--` 한글명 | `a.REG_DT REG_DATE,  -- 등록일자` |
| `Case` | 소괄호로 감싸고, 닫는 괄호 뒤 한 칸 + 별칭, 그 뒤 두 칸 + 주석 | 아래 예시 |
| `Order By` | 줄을 바꾸고 한 탭 들여 정렬 컬럼을 나열한다 | |

서브쿼리의 괄호는 메인 절과 같은 깊이에 두고, 안쪽 쿼리는 통째로 한 탭 들여쓴다.

## 종합 예시

```sql
Select
    a.DOC_ID DOC_SN,  -- 문서순번
    a.DOC_TITLE DOC_TITLE,  -- 문서제목
    b.USER_NM REG_USER_NM,  -- 등록자명
    Nvl(c.CP_COMPANY_NM, '-') CP_COMPANY_NM,  -- 협력사명
    (Case
        When a.STS_CODE = 10 Then 'T'
        Else 'F'
     End) CFM_BTN_SHOW_TF,  -- 승인버튼표시여부
    To_Char(a.REG_DT, 'YYYY-MM-DD') REG_DATE  -- 등록일자
From
    TB_DOC a,
    TB_USER b,
    TB_CP_COMPANY c
Where 1 = 1
And a.REG_USER_ID = b.USER_ID
And a.CP_COMPANY_ID = c.COMPANY_ID(+)
And a.COMPANY_ID = #{SESSION_COMPANY_ID}
And a.USE_YN = 'Y'
Order By
    a.REG_DT Desc,
    a.DOC_ID Asc
```

## 몇 가지 규칙이 주는 것

- **`Where 1 = 1`** — 모든 조건이 `And` 로 시작하게 만든다. MyBatis 동적 SQL 에서 조건을 붙였다 뗐다 할 때 첫 조건만 다르게 처리할 필요가 없다.
- **연산자 앞뒤 한 칸, 정렬용 공백 금지** — 줄 맞춤 공백을 넣으면 한 줄만 바뀌어도 diff 가 여러 줄로 번진다.

## 배운 것

- AI 에게 주던 지시문에는 "당신은 수석 아키텍트다", "100% 엄격히 준수" 같은 문장이 붙어 있었다. 규칙 자체는 그 문장이 없어도 똑같이 전달된다. 사람과 AI 가 같이 읽는 규칙은 **표와 예시 하나**로 충분했다.
