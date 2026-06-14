---
sidebar_label: "1. Gradle 빌드 표준화"
sidebar_position: 1
tags: [gradle, ci-cd, build]
---

# Gradle 마이그레이션 (1단계 · 빌드 표준화)

> `build.ps1`(수동 PowerShell 빌드) → 표준 **Gradle 빌드**로 전환.
> 작업일: 2026-05-25 · 브랜치: `feature/gradle` · 커밋: `9f4203d`
> 이전 단계: setup · 전략 큰 그림: 마스터 플랜

## 1. 왜 했나

`build.ps1`은 JDK 경로가 하드코딩(`C:\...\jdk-25.0.3.9-hotspot`)돼 있고 Windows·PowerShell에 묶여 있어 **GitHub Actions 러너에서 못 돈다.** 표준 Gradle 빌드로 바꿔야 러너가 `setup-java` + `gradlew`만으로 빌드·테스트·패키징을 할 수 있다 → **CI/CD의 토대.**

## 2. 무엇이 달라졌나 (Before → After)

| 항목 | Before (`build.ps1`) | After (Gradle) |
|---|---|---|
| **JDK 경로** | 스크립트에 하드코딩 | `toolchain { languageVersion = of(25) }` → Gradle이 자동 탐색 |
| **의존성** | `lib/jnativehook-2.2.2.jar` 직접 커밋 | `implementation 'com.github.kwhat:jnativehook:2.2.2'` (Maven Central 자동 다운로드) |
| **빌드 명령** | `powershell -File build.ps1` (Windows 전용) | `./gradlew build` (OS 무관) |
| **디렉토리** | `src/app/*.java` (비표준) | `src/main/java/app/*.java` (Maven 표준) |
| **재현성** | PC마다 JDK 경로 다를 수 있음 | Gradle Wrapper가 Gradle 버전(9.5.1)까지 고정 |
| **CI 호환** | 러너에서 실행 불가 | `setup-java` + `gradlew`로 끝 |

## 3. 구체적으로 한 일

- **소스 이동:** `src/app/` → `src/main/java/app/` (`git mv`로 rename 100%, 히스토리 보존)
- **빌드 스크립트:** `build.gradle` + `settings.gradle` 작성 (application 플러그인, toolchain 25, mainClass `app.App`, UTF-8 인코딩)
- **의존성 전환:** JNativeHook을 Maven Central에서 받도록 하고 `lib/jnativehook-2.2.2.jar` 제거
- **Gradle Wrapper:** 9.5.1 추가 (`gradlew`, `gradlew.bat`, `gradle/wrapper/`) — 별도 설치 없이 빌드
- **jpackage 연동:** `jpackageImage` 커스텀 Exec 태스크로 build.ps1의 exe 빌드를 대체
- **정리:** Eclipse 설정(`.classpath`/`.project`/`.settings/`)·`build.ps1` 제거
- **gitignore/attributes:** `.gitignore`를 Gradle 기준(`/.gradle/`, `/build/`)으로 갱신, `.gitattributes`로 줄바꿈 정규화

## 4. 새 빌드 명령 (build.ps1 대체)

```powershell
.\gradlew build          # 컴파일 + jar  → build/libs/*.jar
.\gradlew run            # GUI 실행 (시각 확인용)
.\gradlew jpackageImage  # 자바 없는 네이티브 exe → build/jpackage/출입도우미/출입도우미.exe
```

## 5. 검증 결과

- `gradlew clean build` ✅ — JNativeHook이 Maven Central에서 받아져 컴파일·jar 생성
- `gradlew jpackageImage` ✅ — `build/jpackage/출입도우미/출입도우미.exe` (76.5 MB, 내장 JRE 포함) = build.ps1과 동일 결과물
- ⚠ 작업 중 함정: `.gitignore`에서 옛 패턴을 지웠더니 build.ps1이 남긴 잔재(`bin/`·`dist/`·`staging/`)가 커밋에 딸려갈 뻔 → 디스크에서 정리 후 깨끗한 커밋만 push.

## 6. 핵심 개념 (배경지식)

| 개념 | 설명 |
|---|---|
| **Gradle Wrapper** | Gradle을 프로젝트에 내장. `gradlew` 실행 시 지정 버전(9.5.1)을 자동 다운로드 → 팀/러너가 Gradle 따로 설치 불필요 |
| **build.gradle** | 빌드 방법을 선언하는 스크립트(플러그인·의존성·옵션) |
| **settings.gradle** | 프로젝트 이름 등 메타 설정 |
| **toolchain** | 빌드에 쓸 JDK 버전만 선언하면 경로를 자동 탐색 → 경로 하드코딩 제거 |
| **application 플러그인** | `run` 태스크 + 실행 스크립트/배포본(`installDist`) 제공 |
| **Maven Central** | JVM 생태계 중앙 의존성 저장소. `lib/` 직접 커밋을 대체 |
| **표준 레이아웃** | `src/main/java`(소스), `src/main/resources`(리소스), `src/test/java`(테스트) |
| **Task** | 작업 단위. `compileJava`·`jar`·`build`·`run`·`clean` 등을 `java`/`application` 플러그인이 자동 등록 |

## 7. 메모

- **jpackage 본격 자동화(예: 아이콘·버전·CI 연동)는 CD 단계**에서 다듬는다. 지금은 로컬에서 exe까지 만들어지는 수준.
- **config.properties는 루트 유지** — 배포 시 사용자가 편집하는 파일이라 리소스(jar 내부)로 넣지 않고, jpackage가 런처 옆에 복사한다.
- Gradle 산출물은 `build/`에 생성되며 `.gitignore` 처리됨.
- 다음 단계: 2단계 테스트(JUnit) → 3단계 CI(GitHub Actions).
