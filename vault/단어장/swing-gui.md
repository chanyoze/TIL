---
title: "🖼️ Swing·GUI"
sidebar_label: "🖼️ Swing·GUI"
sidebar_position: 4
---

# 🖼️ Swing·GUI

- **Swing**: 자바 표준 GUI 툴킷. `JFrame`, `JButton`, `JLabel` 등의 컴포넌트로 데스크톱 UI를 구성한다.
- **AWT**: Abstract Window Toolkit. Swing의 전신으로, 일부 클래스(`Toolkit`, `Robot` 등)는 여전히 AWT 패키지에 속해 있다.
- **EDT**: Event Dispatch Thread. Swing UI를 다루는 유일하게 허용된 스레드. 다른 스레드에서 UI를 만지면 화면 깨짐·데드락 위험.
- **SwingUtilities.invokeLater()**: 람다/Runnable을 EDT 큐에 넣어 안전하게 UI 작업을 시키는 표준 패턴. 모든 Swing 앱의 `main()` 첫 줄 관례.
- **null 레이아웃**: 컴포넌트 위치를 `setBounds(x,y,w,h)`로 직접 지정하는 방식. 빠르지만 화면 크기 변하면 깨진다.
- **Layout Manager**: `BorderLayout`, `GridLayout`, `GridBagLayout` 등 자동 배치 시스템. null 레이아웃의 대안.
- **ActionListener**: 버튼 클릭 등의 이벤트 발생 시 호출되는 콜백 인터페이스. 보통 람다로 작성.
- **람다 변수 캡처**: 람다 안에서 외부 지역 변수를 쓰려면 그 변수가 `final` 또는 사실상 final이어야 하는 제약. 변하는 변수는 `final int idx = i;`로 복사해 우회.
