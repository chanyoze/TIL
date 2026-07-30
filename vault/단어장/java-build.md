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
- **HttpMessageConverter**: HTTP 요청/응답 본문과 자바 객체를 서로 변환하는 Spring 인터페이스. JSON은 Jackson 구현체(`MappingJackson2HttpMessageConverter`)가 담당하며, Spring은 **Content-Type을 보고 어느 컨버터를 쓸지 고른다**. 멀티파트에서는 요청 전체가 아니라 개별 파트의 Content-Type을 본다.
- **BOM**: Bill of Materials. 라이브러리 버전들을 한곳에 모아 선언한 명세. `dependencyManagement`로 import하면 개별 의존성에서 버전을 생략할 수 있다. BOM 해석이 실패하면 **버전이 하나도 배정되지 않아** 공개 저장소 라이브러리까지 함께 실패한다.
- **APT**: Annotation Processing Tool. 컴파일 중에 애노테이션을 읽어 소스 코드를 생성하는 자바 기능. Lombok·MapStruct가 이 위에서 동작하므로, APT가 꺼져 있으면 생성 클래스가 없어 **컴파일은 되지만 런타임에 빈이 없다**.
- **MapStruct**: 객체 간 매핑 코드를 컴파일 시점에 생성하는 라이브러리. `@Mapper` 인터페이스만 선언하면 구현체(`XxxImpl`)가 자동 생성된다. 리플렉션을 쓰지 않아 런타임 비용이 없다.
- **Buildship**: Eclipse의 Gradle 통합 플러그인. `.classpath`에 jar를 나열하는 대신 Gradle이 계산한 클래스패스를 **컨테이너로 동적 주입**한다. 그래서 `.classpath`에 jar 항목이 안 보이는 것이 정상이다. 단 `gradlew eclipse` 태스크는 실행하지 않으므로 APT 설정 파일은 생성되지 않는다.
- **jasypt**: Java Simplified Encryption. 설정 파일의 값을 암호화해 보관하는 라이브러리. `ENC(...)`로 감싼 값을 기동 시 마스터 비밀번호(보통 환경변수로 주입)로 복호화한다. 키가 없으면 복호화 실패가 **프로퍼티 바인딩 오류로 포장되어** 엉뚱한 항목 이름으로 나타난다.
- **truststore**: "이 인증서는 신뢰한다"를 모아둔 파일(자바에서는 `KeyStore`). TLS 통신에서 상대 서버의 인증서를 검증할 때 쓴다. 형식(JKS/PKCS12)이 코드가 기대하는 것과 다르면 "Invalid keystore format"이 난다 — 최신 JDK의 `keytool` 기본값은 PKCS12다.
