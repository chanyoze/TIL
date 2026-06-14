---
sidebar_label: "3. CI · GitHub Actions"
sidebar_position: 3
tags: [ci, github-actions]
---

# CI — 지속적 통합 (3단계 · GitHub Actions)

> push/PR마다 **자동으로 빌드+테스트**를 돌려 깨진 코드를 일찍 잡는다.
> 작업일: 2026-05-25 · 브랜치: `feature/ci` · 이전 단계: [tests.md](tests.md)

## 1. 왜 했나

사람이 매번 `gradlew test`를 기억해서 돌릴 순 없다. 코드가 올라올 때마다 **자동으로** 컴파일+테스트가 돌아야 "v2(기본 브랜치)는 항상 통과 상태"를 보장할 수 있다. 이게 CI(Continuous Integration)의 핵심.

## 2. 무엇이 생겼나

- **`.github/workflows/ci.yml`** — GitHub Actions 워크플로
  - **트리거:** `v2` 푸시, 그리고 **모든 PR**
  - **러너:** `ubuntu-latest` — 테스트가 헤드리스 안전(설정 파싱)하므로 리눅스로 충분. (exe 빌드는 CD에서 windows 러너로 별도)
  - **단계:** checkout → JDK 25(temurin) → Gradle 캐시 설정 → `./gradlew build` (컴파일 + 테스트 + jar)
- **README 빌드 배지** — 현재 v2의 통과 여부를 한눈에

## 3. 동작 흐름

```
[코드 push 또는 PR]
   → Actions 러너가 깨어남
   → 코드 checkout + JDK 25 설치
   → ./gradlew build  (compileJava → test → jar)
   → 통과/실패가 PR 체크(초록 ✓ / 빨강 ✗)와 README 배지에 표시
```

## 4. 확인 방법

- GitHub 저장소 → **Actions 탭**에서 실행 로그
- **PR 화면 하단**의 체크 표시 (머지 전에 통과 여부 확인)
- README 상단 **배지** (passing / failing)

## 5. 메모

- **gradlew 실행권한:** 리눅스 러너에서 `./gradlew`가 돌아가도록 git 파일 모드에 실행권한(+x)을 부여함 (`git update-index --chmod=+x gradlew`). 안 하면 "Permission denied".
- **exe 빌드(jpackageImage)는 CI의 `build`에 포함되지 않음** → 윈도우 전용이라 CD(4단계)에서 windows 러너로 처리.
- **캐시:** `gradle/actions/setup-gradle`가 의존성·Gradle 배포본을 캐싱해 2회차부터 빨라짐.
- **자기 검증:** 이 워크플로를 담은 PR(`feature/ci → v2`)을 열면, 그 PR에서 CI가 처음 돌며 스스로를 검증한다.
- **다음(4단계 CD):** 태그(`v*`) 푸시 시 windows 러너에서 `jpackageImage` → zip → GitHub Releases 자동 업로드.
