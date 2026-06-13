---
sidebar_label: "2. JUnit 테스트"
sidebar_position: 2
tags: [test, junit, ci-cd]
---

# 테스트 (2단계 · JUnit 5)

> 순수 로직에 단위 테스트를 붙여 CI(3단계)가 자동 검증할 토대 마련.
> 작업일: 2026-05-25 · 브랜치: `feature/tests` · 이전 단계: [gradle.md](gradle.md)

## 1. 왜 했나

CI는 PR/푸시마다 "자동으로 돌릴 검증"이 있어야 의미가 있다. 그런데 이 앱의 GUI(`MainFrame`)·전역 후킹(`AutoPasteService`)·`Robot`·클립보드는 **헤드리스(화면 없는) CI 환경에서 테스트 불가**다. 그래서 화면과 무관한 **순수 로직(설정 파싱)부터** 단위 테스트를 붙인다.

## 2. 무엇이 달라졌나

- 빌드에 **JUnit 5**가 들어왔고, `gradlew test`로 검증 가능.
- `AppConfig`의 CSV 파싱이 `load()`(파일 읽기) 안에 묻혀 있어 테스트하기 어려웠음 → **순수 함수 `parsePrograms(String)`로 추출**해 파일 없이 검증 가능하게 함.

## 3. 한 일

- **build.gradle:** JUnit 5 추가
  ```groovy
  testImplementation platform('org.junit:junit-bom:5.11.4')
  testImplementation 'org.junit.jupiter:junit-jupiter'
  testRuntimeOnly 'org.junit.platform:junit-platform-launcher'  // Gradle 9는 런처를 자동 제공하지 않음
  tasks.named('test') { useJUnitPlatform() }
  ```
- **AppConfig.java:** 파싱을 `static List<String> parsePrograms(String csv)`로 추출 (동작 동일, 테스트 가능화)
- **src/test/java/app/AppConfigTest.java:** 테스트 4개
  - 콤마로 분리 / 콤마 주변 공백 트림 / 단일 항목 / `load()`가 비어있지 않고 마지막 항목이 `"사용자 지정"`

## 4. 검증 결과

```
.\gradlew test  →  tests=4, failures=0, errors=0  ✅
```
리포트: `build/reports/tests/test/index.html`

## 5. 메모

- **CI 테스트 대상에서 제외(수동 확인 영역):** `MainFrame`(GUI), `AutoPasteService`(JNativeHook 네이티브 후킹), `ClipboardService`(AWT 시스템 클립보드 — 헤드리스에서 `HeadlessException`).
- 새 테스트는 `src/test/java/app/`에 `*Test.java`로 두면 `gradlew test`가 자동 수집.
- **다음(3단계 CI):** GitHub Actions에서 `gradlew build`(테스트 포함)를 push/PR마다 자동 실행.

## 6. 수동으로 테스트 하는 방법

> CI 자동화 전에(또는 별개로) 직접 돌려 확인하는 방법. 환경: **Antigravity IDE**(VS Code 계열).

### A. 단위 테스트 실행 (JUnit)

**① Antigravity 테스트 탐색기 — 추천**
1. 왼쪽 사이드바의 **플라스크(시험관) 아이콘 = `Testing`** 클릭
2. `AppConfigTest` 아래 테스트 4개가 보임 → 맨 위 **▶▶ (Run All Tests)**
3. 각 테스트 옆 **초록 ✓ = 통과**, 빨강 ✗ = 실패
   - 또는 `src/test/java/app/AppConfigTest.java`를 열고, 클래스/`@Test` 메서드 옆 **▶** 아이콘으로 개별 실행

**② 터미널**
```powershell
cd C:\study\Seongbuk-Senior-Club-Entrance-Helper-2
.\gradlew test --rerun-tasks   # 변경 없으면 UP-TO-DATE로 건너뛰므로 강제 재실행
```
통과 → `BUILD SUCCESSFUL` / 실패 → 깨진 테스트명 + 리포트 경로 출력.

**③ HTML 리포트 (브라우저)**
`build/reports/tests/test/index.html` — tests·failures·성공률 + 테스트별 결과.
(※ `build/`는 git에 안 올리는 로컬 폴더라 테스트를 돌려야 생성·갱신됨)

### B. 앱 육안 확인 (GUI 동작)

자동 테스트로 못 잡는 GUI·자동 붙여넣기는 직접 띄워서 확인한다.
- 실행: `src/main/java/app/App.java`의 `main()` 옆 **▶ Run**, 또는 터미널 `.\gradlew run`
- 확인 체크리스트:
  1. 창이 뜸 — 제목 `이찬호`, 헤더 "출입관리 도우미", 버튼 13개
  2. 버튼 클릭 → 클립보드 복사 (메모장에 `Ctrl+V`로 확인)
  3. **자동 붙여넣기:** 버튼 클릭 후 다른 창의 입력칸을 좌클릭 → 자동 paste + 클립보드 비움
  4. `사용자 지정` 버튼 → 오른쪽 입력칸 내용 복사
- ※ 이 육안 확인은 헤드리스 CI에서 불가 → **릴리스 전 수동 점검 항목**으로 남긴다.
