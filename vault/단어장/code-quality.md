---
title: "✨ 코드 품질"
sidebar_label: "✨ 코드 품질"
sidebar_position: 5
---

# ✨ 코드 품질

- **DRY**: Don't Repeat Yourself. 같은 로직을 반복하지 말라는 원칙.
- **God Method**: 한 메서드가 너무 많은 책임을 지는 안티패턴. 관심사 분리로 해소.
- **매직 넘버**: 코드에 의미 없이 등장하는 숫자 리터럴. 상수로 추출해 이름을 붙이는 것이 관례.
- **관심사 분리**: Separation of Concerns. UI 구성·이벤트 처리·외부 호출·설정 로딩 등을 각자 다른 모듈로 나누는 설계 원칙.
- **Properties 파일**: `key=value` 형식의 자바 표준 설정 파일. 코드 재빌드 없이 값을 변경할 수 있다.
- **JNativeHook**: 자바에서 OS 전역 키보드·마우스 이벤트를 받기 위한 서드파티 라이브러리. 내부적으로 JNI + 네이티브 DLL을 사용. Maven Central: `com.github.kwhat:jnativehook`.
- **전역 후킹 (Global Hook)**: OS 레벨에서 모든 키보드/마우스 입력을 가로채는 메커니즘. 일부 백신이 키로거 패턴과 유사해 의심하기도 한다.
- **java.awt.Robot**: 표준 Java가 제공하는 키·마우스 입력 시뮬레이션 도구. 이벤트를 시스템에 주입하는 용도(JNativeHook의 이벤트를 받는 용도와 반대).
- **Class-Path manifest attribute**: jar의 `MANIFEST.MF`에 `Class-Path: other.jar`를 두면 JVM이 같은 폴더의 다른 jar도 클래스패스에 자동 포함하는 기능.
- **AtomicBoolean.compareAndSet()**: 원자적 비교-치환 연산. 다중 스레드에서 race condition 없이 상태를 안전하게 전환한다.
- **Dead Code**: 호출되지 않거나 컴파일조차 안 되는, 실행에 무의미한 죽은 코드. 제거 대상.
- **리팩토링 (Refactoring)**: 외부 동작은 그대로 두고 내부 코드 구조·가독성을 개선하는 작업.
