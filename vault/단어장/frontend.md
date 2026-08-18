---
title: "🌐 프론트엔드"
sidebar_label: "🌐 프론트엔드"
sidebar_position: 6
---

# 🌐 프론트엔드

- **React**: 페이스북(Meta)이 만든 UI 라이브러리. 화면을 컴포넌트 단위로 쪼개 만들고, 상태가 바뀌면 가상 DOM으로 바뀐 부분만 다시 렌더링하는 SPA 방식의 대표 프론트엔드 기술.
- **Nuxt.js**: Vue.js 기반의 풀스택 프레임워크. 라우팅·SSR/SSG·빌드 설정이 기본 제공되어 Vue 앱을 빠르게 구성한다. (React 진영의 Next.js에 대응)
- **SPA**: Single Page Application(단일 페이지 애플리케이션). 하나의 HTML에서 JavaScript가 화면을 그리고, 페이지 이동 시 전체 새로고침 없이 필요한 부분만 바꿔 그리는 웹앱 방식. (대비: 서버가 매번 HTML을 완성해 내려주는 SSR)
- **호이스팅 (Hoisting)**: JS 엔진이 스코프 생성 시 변수·함수 선언을 미리 등록하는 동작. `var`는 선언이 함수 최상단으로 올라가 값이 `undefined`인 채로 접근되고, `let`·`const`도 블록 최상단으로 올라가되 TDZ에 놓여 접근하면 에러가 난다. (선언만 올라가고 대입은 제자리 — 런타임 비용이 드는 동작이 아니다)
- **TDZ (Temporal Dead Zone)**: `let`·`const`가 선언된 스코프 시작 지점부터 실제 선언문에 도달하기 전까지의 구간. 이 구간에서 그 변수에 접근하면 `ReferenceError`가 나서, `var`처럼 `undefined`로 조용히 넘어가지 않고 실수를 드러낸다.
- **SSE (Server-Sent Events)**: 서버가 HTTP 연결을 열어둔 채 클라이언트로 이벤트를 단방향 푸시하는 표준 기술. 브라우저의 `EventSource` 로 받는다. 양방향인 WebSocket 보다 가볍지만, 프록시가 응답을 버퍼링하면 멈출 수 있다. (`EventSource` 는 응답 **헤더**만 받아도 `open` 을 내므로, 본문이 안 와도 "연결됨"으로 보인다 — 별도 감시가 필요하다)
