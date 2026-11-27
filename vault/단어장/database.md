---
title: "🗄️ 데이터베이스"
sidebar_label: "🗄️ 데이터베이스"
sidebar_position: 9
---

# 🗄️ 데이터베이스

- **UPSERT**: UPDATE + INSERT. 행이 없으면 넣고 있으면 갱신하는 연산. PostgreSQL 에서는 `INSERT ... ON CONFLICT (키) DO UPDATE SET ...` 으로 쓴다. 같은 데이터를 여러 번 써도 안전해지므로(멱등성) 재시도·중복 수집을 걱정하지 않아도 된다.
- **ON CONFLICT DO NOTHING / DO UPDATE**: 충돌(중복 키) 시의 처리 방식. `DO NOTHING` 은 기존 행을 그대로 두고 무시하고, `DO UPDATE` 는 새 값으로 덮는다. **둘을 잘못 고르면 "갱신되어야 할 값이 영원히 옛날 값으로 고착"되는 조용한 버그**가 난다.
- **LISTEN/NOTIFY**: PostgreSQL 내장 pub/sub 기능. 한쪽이 `NOTIFY 채널, 메시지` 로 보내면 `LISTEN 채널` 중인 커넥션이 즉시 받는다. Redis 같은 별도 메시지 브로커 없이 실시간 알림을 구현할 수 있다. (단, 커넥션을 계속 붙들고 있어야 해서 서버리스 환경에서는 쓰기 어렵다)
- **`date_bin`**: PostgreSQL 14+ 함수. 타임스탬프를 지정한 간격으로 잘라 묶는다(예: 1분봉 → 5분봉). 기준점(origin)을 함께 주는데, **기준점을 데이터의 첫 시각으로 잡으면 구간 경계가 수집 시작 시각에 따라 달라지므로** 보통 `epoch` 처럼 고정된 값을 쓴다.
- **윈도우 함수 (Window Function)**: `OVER (...)` 절과 함께 쓰여, 행을 묶어 하나로 줄이지 않고 **각 행마다 주변 행을 참조한 계산 결과**를 붙이는 SQL 기능. 이동평균·누적합·순위 계산에 쓴다.
- **ORM (Object-Relational Mapping)**: 객체와 관계형 DB 테이블을 이어주어 SQL 을 직접 쓰지 않고 코드로 DB 를 다루게 하는 도구. (예: Java 의 JPA/Hibernate, MyBatis, TypeScript 의 Drizzle·Prisma)
- **Drizzle ORM**: TypeScript용 **SQL-first** ORM. SQL 에 가까운 형태로 쿼리를 쓰되 타입 안정성을 얻는다. `ON CONFLICT`·집계 같은 DB 고유 기능을 그대로 표현할 수 있는 게 장점.
- **커넥션 풀 (Connection Pool)**: DB 연결을 미리 여러 개 만들어 두고 빌려 쓰는 구조. 매번 연결·해제하는 비용을 줄인다. 유휴 커넥션이 서버 쪽에서 끊길 수 있으므로 **풀의 `error` 이벤트를 반드시 처리해야** 한다 — 안 하면 처리되지 않은 예외로 프로세스가 죽는다.
