---
title: "2026-06-13 / Tailwind v4 레이어 함정"
tags: [tailwind, css, vue]
---
> 분명 `mx-auto`, `px-6` 같은 Tailwind 클래스를 줬는데 화면은 왼쪽에 딱 붙어버린다. 빌드도 멀쩡하고 클래스도 분명히 들어가 있는데 왜일까?

## 한 줄 요약

**Tailwind v4 유틸리티는 `@layer utilities` 안에 들어간다.** 그런데 레이어 없이 선언된 전역 리셋(`* { margin: 0 }`)이 있으면, CSS 규칙상 **레이어 없는(unlayered) 규칙이 레이어 규칙을 항상 이기기** 때문에 Tailwind 여백·패딩이 전부 무력화된다.

## 증상

- 레거시 바닐라 CSS와 Tailwind를 함께 쓰는 페이지에서, `mx-auto`(가운데 정렬)·`px-6`(패딩)·링크 색이 **적용되지 않음**.
- 데스크톱인데도 콘텐츠가 모바일처럼 왼쪽으로 쏠림.

## 진단

브라우저에서 해당 요소의 computed style을 찍어보면 원인이 드러난다:

```text
main.mx-auto.max-w-6xl   →  max-width: 1152px  ✅   (max-w-6xl 는 먹음)
                            margin-left: 0px   ❌   (mx-auto 가 안 먹음)
```

`max-width`는 적용되는데 `margin: auto`만 0으로 덮였다는 건, **누군가 `margin`을 더 강하게 잡고 있다**는 뜻이다.

## 원인 — 레이어 없는 규칙이 레이어 규칙을 이긴다

CSS 캐스케이드 레이어(`@layer`)의 우선순위 규칙:

> **레이어에 속하지 않은(unlayered) 일반 스타일은, 레이어 안의 스타일보다 항상 우선한다. (specificity와 무관)**

- Tailwind v4는 모든 유틸리티를 `@layer utilities`에 넣는다.
- 그런데 디자인 초안에서 가져온 전역 리셋 `* { margin: 0; padding: 0 }`이 **레이어 없이** 선언돼 있었다.
- 결과: `* { margin: 0 }` (unlayered) > `.mx-auto { margin-inline: auto }` (layered) → 정렬·패딩이 전부 0으로.

게다가 이 리셋이 든 컴포넌트가 라우터에서 즉시(eager) import 되면, 그 전역 스타일이 **모든 페이지로 새어 나간다.**

## 해결

전역 리셋을 `@layer base`로 감싸면 된다.

```css
/* Before — 레이어 없음: Tailwind 유틸리티를 덮어씀 */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* After — base 레이어로: Tailwind utilities 가 이김 */
@layer base {
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
}
```

- 이제 `@layer utilities`(Tailwind)가 `@layer base`(리셋)를 이긴다 → 정렬·패딩 정상.
- 리셋을 쓰던 기존 페이지는, 자기 클래스 스타일이 여전히 unlayered라 영향 없음.

## 교훈

- **바닐라 CSS 리셋과 Tailwind를 혼용**할 때, 전역 `*`/element 리셋은 반드시 `@layer base`에 두거나 특정 영역으로 스코프한다.
- "클래스는 분명 있는데 스타일이 안 먹는다" → specificity가 아니라 **cascade layer 우선순위**를 의심해 볼 것.
