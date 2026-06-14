# 환경 구축 (Setup) — Git 연결 · JDK 설치 · 로컬 빌드 검증

> CI/CD 작업의 **0단계(전제조건)**. 작업일: 2026-05-24.
> 코드 리팩토링은 [refactoring.md](refactoring.md), 다음 단계는 [gradle.md](gradle.md) 참고.

## 한 일 요약

1. Git 초기화 + 원격 연결 (unrelated history 함정 해결)
2. JDK 25 설치 + 검증
3. 로컬 빌드 검증 (이 PC 최초 성공)

---

## 1. Git 초기화 + 원격 연결 — ⚠ unrelated history 함정

- 처음엔 로컬 폴더가 **git 저장소가 아니었음.** `git init -b main` 후 첫 커밋(`3342a83`) 생성.
- 원격을 확인하니 이미 히스토리가 있었음 → 무작정 push하면 덮어쓸 위험.
- `git ls-remote`로 원격 구조 파악: `master`(5년 전 원본) + `v2`(리팩토링본, 기본 브랜치).
- fetch 후 비교: **로컬 트리 == `origin/v2` 트리 (`git diff --stat` 차이 0).** 이미 같은 내용이 원격에 있었고, 내 `main`은 같은 내용을 새 해시로 중복 생성한 것뿐이었음.
- **해결:** `git checkout -B v2 origin/v2`로 원격 히스토리를 채택하고, 임시 `main`(`3342a83`)은 `git branch -D`로 삭제. → 깔끔히 동기 상태.

> **배운 점:** 이미 원격이 있는 프로젝트는 `git init` 대신 `git clone`이 정석. init으로 시작했을 땐 fetch → 트리 비교 → `checkout -B <branch> origin/<branch>`로 무관 히스토리를 안전하게 합칠 수 있다.

## 2. JDK 설치 + 검증

- 이 PC엔 JDK가 전혀 없었음(PATH·레지스트리·디스크 모두 확인). 다른 PC에 깔린 걸 기억한 것으로 추정.
- Microsoft Build of OpenJDK **25.0.3 LTS** 설치 (`C:\Program Files\Microsoft\jdk-25.0.3.9-hotspot`).
- `java -version` → `25.0.3 LTS`, `jpackage --version` → `25.0.3` 정상.

## 3. 로컬 빌드 검증 (이 PC 최초 성공)

- 당시 빌드 도구였던 `build.ps1` 6단계(clean → javac → manifest → jar → jpackage → config 배치) 전부 통과.
- 산출물: `dist\출입도우미\출입도우미.exe` (총 76.5 MB, 내장 JRE 포함).
- ※ 이 `build.ps1` 방식은 이후 **Gradle로 대체됨** → [gradle.md](gradle.md).

---

## 메모 · 주의사항

- **커밋 신원:** 이 저장소는 전역 설정 `agadou / iloory64@gmail.com`로 커밋됨. README의 `이찬호 / chanyoze`와 다름 → 맞추려면 `git config user.name/email` (이 저장소 한정).
- **`docs/` 폴더는 Phase 5(GitHub Pages) 예약석.** 진행 문서는 여기 `진행기록/`에 둔다.
- **JNativeHook**은 백신이 키로거로 오인할 수 있어 후킹 등록 실패 시 자동 비활성 폴백됨(앱은 정상 구동). CI의 자동 테스트로는 검증 불가 → 수동 확인 영역.
- ~~build.ps1의 JDK 경로 하드코딩~~ → Gradle toolchain으로 해소(완료).
