---
created: 2026-06-13
category: note
tags: [tailwind, css, cascade-layers, docusaurus, vue]
readable: ../../TIL/tailwind-v4-layer-override.md
---

# Tailwind v4 유틸리티 안 먹힘 — 전역 리셋 충돌 (raw)

- 증상: 게시판(Tailwind) 페이지가 데스크톱에서도 왼쪽으로 치우침. `mx-auto`(가운데정렬) 안 먹음. 패딩·링크색도 깨짐.
- 진단(puppeteer): `main` 요소가 `max-width:1152px`은 적용되는데 `margin-left/right: 0px`. → mx-auto 무력화 확인.
- 원인: Tailwind v4 유틸리티는 `@layer utilities` 안에 들어감. HomeView.vue의 전역 리셋 `*{margin:0;padding:0}`이 **레이어 없이(unlayered)** 선언됨. CSS 규칙상 **레이어 없는 규칙이 레이어 규칙을 항상 이김**(specificity 무관) → 리셋이 mx-auto/px 등 모든 Tailwind 여백·패딩을 덮어씀.
- 누수 경로: HomeView가 router에서 eager import라 그 전역 `<style>`이 전 페이지에 주입됨.
- 해결: 그 전역 리셋을 `@layer base { ... }`로 감쌈 → Tailwind utilities가 이김. 홈은 자기 클래스(unlayered)가 여전히 우선이라 무영향.
- 검증: 수정 후 marginLeft 0 → 224px(가운데정렬), 빌드·라이트/다크 스크린샷 OK.
- 교훈: 디자인드래프트 바닐라 CSS와 Tailwind 혼용 시, 전역 element/`*` 리셋은 반드시 `@layer base`에 두거나 스코프할 것.
