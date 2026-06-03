# 단어장 (wordbank)

## CI/CD
- **CI**: Continuous Integration(지속적 통합). 코드 변경을 자주 통합하고 자동으로 빌드·테스트해 통합 오류를 일찍 잡는 개발 방식.
- **CD**: Continuous Delivery/Deployment(지속적 전달/배포). CI를 통과한 코드를 자동으로 릴리스 가능한 상태로 만들거나(Delivery), 운영 환경에 자동 배포(Deployment)하는 방식.
- **Pipeline**: 빌드→테스트→배포 등 일련의 단계를 정해진 순서대로 자동 실행하는 자동화 흐름.
- **VCS**: Version Control System(버전 관리 시스템). 소스 코드의 변경 이력을 기록·관리하는 시스템. 대표적으로 Git.
- **GitHub Actions**: GitHub에 내장된 CI/CD 플랫폼. 워크플로(YAML)를 작성해 빌드·테스트·배포를 자동화한다.
- **Runner**: GitHub Actions 워크플로의 작업(Job)을 실제로 실행하는 머신. GitHub 호스팅형과 self-hosted형이 있다.
- **YAML**: 들여쓰기로 구조를 표현하는, 사람이 읽기 쉬운 데이터 직렬화 포맷. 워크플로·설정 파일에 많이 쓰인다.
- **Workflow (워크플로)**: GitHub Actions에서 자동 작업을 정의한 YAML 파일. 트리거·잡(Job)·스텝으로 구성한다(예: ci.yml, release.yml).
- **Pull Request (PR)**: 변경을 기본 브랜치에 합치기 전에 검토·논의·자동 검사(CI)를 거치는 병합 요청 단위.
- **Git Tag (태그)**: 특정 커밋에 붙이는 고정 이름표. 버전 릴리스 표시(v1.3.0)에 쓰며, 푸시하면 release 워크플로 트리거로 활용한다.
- **semver**: Semantic Versioning. 버전을 `major.minor.patch`로 매겨 변경 규모를 약속하는 규칙.
- **GitHub Pages**: 저장소의 정적 파일(HTML 등)을 무료로 웹 호스팅해 주는 기능. 다운로드/문서 페이지에 사용.
- **GitHub Releases**: 버전 태그에 맞춰 빌드 산출물(zip 등)을 첨부·배포하는 기능. `/latest/download/` 고정 링크를 제공한다.
- **재현성 (Reproducibility)**: 사람·PC·환경이 달라도 동일한 빌드 결과가 나오는 성질. toolchain·Wrapper·의존성 고정으로 확보한다.

## 컨테이너
- **Docker**: 애플리케이션을 컨테이너로 패키징·실행하는 플랫폼. 환경에 상관없이 동일하게 동작하게 해준다.
- **Image**: 컨테이너 실행에 필요한 코드·라이브러리·설정을 담은 읽기 전용 템플릿. 이미지로부터 컨테이너가 생성된다.
- **Container**: 이미지를 실행한 격리된 프로세스 단위. 가볍고 이식성이 높다.

## AWS
- **AWS S3**: Simple Storage Service. AWS의 객체 스토리지 서비스로, 파일을 버킷(bucket)에 저장·관리한다.
- **IAM**: Identity and Access Management. AWS에서 사용자·권한을 관리해 누가 어떤 리소스에 접근할 수 있는지 제어하는 서비스.

## AI
- **MCP**: Model Context Protocol. AI 모델(예: Claude)이 외부 도구·데이터·서비스에 표준화된 방식으로 연결하도록 해주는 개방형 프로토콜. 호스트의 MCP 클라이언트와 MCP 서버가 통신하는 클라이언트-서버 구조로 동작한다. (USB-C처럼 AI와 외부 기능을 잇는 공통 규격에 비유됨)

## 개발
- **npm**: Node Package Manager. Node.js의 기본 패키지 관리자로, 자바스크립트 라이브러리(패키지)를 설치·관리하며 package.json으로 프로젝트 의존성을 다룬다.
- **ps1**: PowerShell 스크립트 파일 확장자. Windows 자동화·빌드 스크립트를 작성하는 데 쓴다(예: 이 프로젝트의 build.ps1).

## 네트워크
- **SSH**: Secure Shell. 네트워크 너머의 컴퓨터에 안전하게 접속·명령하기 위한 암호화 프로토콜. 공개키/개인키 쌍으로 비밀번호 없이 인증할 수 있다(GitHub 연결에 사용).

## Java / 빌드
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

## Swing / GUI
- **Swing**: 자바 표준 GUI 툴킷. `JFrame`, `JButton`, `JLabel` 등의 컴포넌트로 데스크톱 UI를 구성한다.
- **AWT**: Abstract Window Toolkit. Swing의 전신으로, 일부 클래스(`Toolkit`, `Robot` 등)는 여전히 AWT 패키지에 속해 있다.
- **EDT**: Event Dispatch Thread. Swing UI를 다루는 유일하게 허용된 스레드. 다른 스레드에서 UI를 만지면 화면 깨짐·데드락 위험.
- **SwingUtilities.invokeLater()**: 람다/Runnable을 EDT 큐에 넣어 안전하게 UI 작업을 시키는 표준 패턴. 모든 Swing 앱의 `main()` 첫 줄 관례.
- **null 레이아웃**: 컴포넌트 위치를 `setBounds(x,y,w,h)`로 직접 지정하는 방식. 빠르지만 화면 크기 변하면 깨진다.
- **Layout Manager**: `BorderLayout`, `GridLayout`, `GridBagLayout` 등 자동 배치 시스템. null 레이아웃의 대안.
- **ActionListener**: 버튼 클릭 등의 이벤트 발생 시 호출되는 콜백 인터페이스. 보통 람다로 작성.
- **람다 변수 캡처**: 람다 안에서 외부 지역 변수를 쓰려면 그 변수가 `final` 또는 사실상 final이어야 하는 제약. 변하는 변수는 `final int idx = i;`로 복사해 우회.

## 코드 품질
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

## 테스트
- **JUnit**: 자바 표준 단위 테스트 프레임워크. `@Test` 메서드로 검증하고 `assertEquals` 등으로 결과를 단언한다(현재 JUnit 5).
- **단위 테스트 (Unit Test)**: 함수·클래스 같은 작은 단위의 동작을 독립적으로 자동 검증하는 테스트.
- **순수 함수 (Pure Function)**: 같은 입력에 항상 같은 출력을 내고 화면·파일·전역 상태 같은 부수효과가 없는 함수. 테스트하기 쉬워 CI 검증 대상으로 분리한다.
- **헤드리스 (Headless)**: 모니터·키보드·마우스가 없는 실행 환경(서버·CI 러너). GUI 작업을 시도하면 예외가 난다.
- **HeadlessException**: 헤드리스 환경에서 화면·클립보드 등 GUI 기능을 호출할 때 자바가 던지는 예외.

## 프론트엔드
- **React**: 페이스북(Meta)이 만든 UI 라이브러리. 화면을 컴포넌트 단위로 쪼개 만들고, 상태가 바뀌면 가상 DOM으로 바뀐 부분만 다시 렌더링하는 SPA 방식의 대표 프론트엔드 기술.
- **Nuxt.js**: Vue.js 기반의 풀스택 프레임워크. 라우팅·SSR/SSG·빌드 설정이 기본 제공되어 Vue 앱을 빠르게 구성한다. (React 진영의 Next.js에 대응)
- **SPA**: Single Page Application(단일 페이지 애플리케이션). 하나의 HTML에서 JavaScript가 화면을 그리고, 페이지 이동 시 전체 새로고침 없이 필요한 부분만 바꿔 그리는 웹앱 방식. (대비: 서버가 매번 HTML을 완성해 내려주는 SSR)
