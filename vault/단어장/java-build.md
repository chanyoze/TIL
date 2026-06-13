---
title: "☕ Java·빌드"
sidebar_label: "☕ Java·빌드"
sidebar_position: 3
---

# ☕ Java·빌드

- **JDK**: Java Development Kit. 자바 코드를 컴파일·빌드·패키징하는 개발 도구 모음(javac·jar·jpackage 등 포함). 실행환경(JRE)도 내장하며, 개발자가 설치하는 쪽이다.
- **javac**: Java Compiler. `.java` 소스 코드를 JVM이 실행하는 `.class` 바이트코드로 변환하는 JDK 내장 컴파일러.
- **jar**: Java Archive. 여러 `.class`와 리소스를 하나로 묶은 zip 형식 패키지. 매니페스트에 Main-Class를 지정하면 실행 가능한 jar가 된다.
- **jpackage**: JDK 14+에 내장된 공식 도구. jar와 최소 JRE를 묶어, 자바 미설치 PC에서도 더블클릭으로 실행되는 네이티브 실행 파일(.exe/.msi/.dmg/.deb)을 생성한다.
- **Gradle**: Groovy/Kotlin DSL 기반의 현대적 빌드 자동화 도구. 의존성 관리·컴파일·테스트·패키징을 `build.gradle`로 선언한다. Android·Spring 등 다수 신규 프로젝트의 사실상 표준.
- **Gradle Wrapper**: Gradle을 프로젝트에 내장시키는 메커니즘. `gradlew`/`gradlew.bat` 스크립트로 구성되며, 지정된 버전의 Gradle을 자동 다운로드해 별도 설치 없이 빌드를 실행한다.
- **build.gradle**: Gradle 프로젝트의 빌드 스크립트. 플러그인·의존성·컴파일 옵션 등 빌드 방법을 Groovy(또는 Kotlin) DSL로 선언한다.
- **settings.gradle**: Gradle 프로젝트의 메타 설정 파일. 프로젝트 이름, 멀티 프로젝트 구성 등을 정의한다.
- **toolchain (Gradle)**: 빌드에 사용할 JDK 버전만 선언하면 경로를 자동 탐색해주는 Gradle 기능. JDK 경로 하드코딩 없이 이식 가능한 빌드를 만든다.
- **Maven**: XML(`pom.xml`) 기반의 자바 빌드 도구. "규약 우선(Convention over Configuration)" 철학과 Maven Central 의존성 저장소로 유명. Gradle 이전 세대의 표준.
- **Maven Central**: Java/JVM 생태계의 중앙 의존성 저장소. Gradle·Maven이 라이브러리(jar)를 자동 다운로드하는 기본 출처.
- **Maven 표준 디렉토리 레이아웃**: `src/main/java/`(소스), `src/main/resources/`(리소스), `src/test/java/`(테스트)로 구성하는 규약. Gradle도 동일하게 사용하며, 이 구조를 따르면 빌드 도구가 소스를 자동 인식한다.
- **JRE**: Java Runtime Environment. 컴파일된 `.class` 파일을 실행만 시키는 환경. JDK에 내장되며, 일반 사용자가 "자바 설치"라고 부르는 것이 보통 이것.
- **java (런처)**: Java Launcher. `.class` 파일을 JVM 위에서 실행하는 명령어.
- **jlink**: 앱이 실제 쓰는 JDK 모듈만 골라 최소 JRE를 만드는 도구. 일반 JRE(~150MB)를 ~40MB로 축소. `jpackage`가 내부적으로 호출한다.
- **app-image**: `jpackage`의 출력 형태 중 하나. 설치 마법사 없이 exe + JRE를 폴더로 만들어줌. 포터블 배포에 적합.
- **Launch4j**: `.jar`를 Windows `.exe`로 감싸주는 서드파티 도구. JRE를 내장하지 못해 사용자에게 자바 설치를 요구하는 옛 방식.
- **GraalVM Native Image**: 자바를 JRE 없는 진짜 네이티브 바이너리로 AOT 컴파일하는 기술. Swing/AWT 지원이 미완성이라 GUI 앱에는 부적합.
- **Ant**: XML(`build.xml`) 기반의 초기 자바 빌드 도구. 모든 빌드 단계를 수동 정의해야 해서 현재는 레거시 취급.
- **.classpath**: Eclipse가 읽는 빌드 설정 파일. 소스 경로·출력 경로·JDK 버전을 명시한다.
- **.project**: Eclipse 프로젝트 이름·빌더 종류 등 메타데이터 파일.
- **.settings/**: Eclipse 컴파일러 세부 설정(타깃 자바 버전 등)을 담는 디렉토리.
