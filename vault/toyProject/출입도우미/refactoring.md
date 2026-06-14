# 출입도우미 리팩토링 정리

> **프로젝트:** Seongbuk-Senior-Club-Entrance-Helper (성북노인종합복지관 출입도우미)
> **원본 출처:** `Seongbuk-Senior-Club-Entrance-Helper-master.zip`
> **언어:** Java 8 / Swing GUI
> **목적:** 코로나 시기 어르신 출입 기록 자동화 — 버튼 클릭 한 번으로 정해진 키워드를 클립보드에 복사해, 외부 출석관리 프로그램(`ATTEND_RF.exe`)에 붙여넣는 도우미

---

## 목차

1. [리팩토링 전후 과정](#1-리팩토링-전후-과정)
2. [단계별 리팩토링 계획 (Phase 1~7)](#2-단계별-리팩토링-계획-phase-17)
3. [Phase 7 — 자바 없는 exe 빌드 상세](#3-phase-7--자바-없는-exe-빌드-상세)
4. [현재까지 진행 상황 / 다음 단계](#4-현재까지-진행-상황--다음-단계)
5. [부록: JDK 설치 가이드](#5-부록-jdk-설치-가이드)
6. [v1.1 변경분 — 외부 exe 제거 + 자동 붙여넣기](#6-v11-변경분--외부-exe-제거--자동-붙여넣기)
7. [기술 선택 메모 — Docker 미사용 이유 & 향후 CI/CD 프로젝트 계획](#7-기술-선택-메모--docker-미사용-이유--향후-cicd-프로젝트-계획)
8. [v1.2 변경 — 자동 붙여넣기 신뢰성 개선](#8-v12-변경--자동-붙여넣기-신뢰성-개선)
9. [v1.3 변경 — UI 개편 (진행 중)](#9-v13-변경--ui-개편-진행-중)

---

## 1. 리팩토링 전후 과정

### 1.1 이 프로그램이 하는 일 (한 줄)

> 사전 정의된 13개 키워드("노노케어", "스쿨존", ...) 중 하나를 버튼 클릭으로 클립보드에 복사해, 동시에 띄워둔 출석관리 프로그램의 입력 칸에 사용자가 Ctrl+V로 빠르게 붙여넣게 도와주는 GUI.

원본 README 발췌:
> 코로나 기간 동안 들어오시는 모든 어르신들의 성함과 전화번호, 체온, 방문 목적 등을 기록하는 단순 반복이 계속 이어졌기 때문에 이를 수기로 매번 입력하지 않을 수 있게 하고자 제작. 버튼에 키보드 이벤트 명령어를 할당해 자동으로 복사, 붙여 넣기를 할 수 있게 하여 마우스만 사용해서 시간을 훨씬 단축할 수 있게 되었음.

### 1.2 [리팩토링 전] — As-Is

#### 1.2.1 파일 구조

```
src/main/
├── Button.java       ← 빈 클래스 (45 bytes). 사실상 더미.
├── Main.java         ← 약 230줄. 모든 로직이 여기 집중.
└── Removed.java      ← "폐기됨" 표시된 코드. 컴파일도 안 됨 (변수 미정의).
```

#### 1.2.2 `Main.java`가 했던 일 (위에서 아래로)

원본 `main()` 메서드 단 하나에 다음이 전부 들어있었음:

1. **L26~32 전역 폰트 강제 변경**
   - `UIManager.getDefaults().keys()`를 돌면서 모든 `FontUIResource`를 `굴림 14pt`로 교체.

2. **L37~48 JFrame 기본 설정**
   - 제목 `"이찬호"`(원작자 이름으로 추정), 크기 700×700, 화면 중앙 배치, 닫기 시 종료, `null` 레이아웃, 배경 LIGHT_GRAY.

3. **L50~60 외부 프로그램 실행 — ⚠ 치명적 버그**
   ```java
   p = rt.exec("C:\\Program Files (x86)\\경성정보기술\\RF출석관리\\ATTEND_RF.exe");
   p.waitFor();  // ← 외부 exe가 종료될 때까지 GUI가 안 뜸
   ```
   주석엔 "동시 실행 시키기"라고 적혀있지만 실제로는 **외부 프로그램이 닫힐 때까지 도우미 창이 안 나타남**. 의도와 정반대.

4. **L63~69 헤더 라벨** "출입관리 도우미" (좌표 하드코딩)

5. **L71~75 미리보기용 `TextArea`** (붙여넣기 테스트 영역)

6. **L77~83 `JTextField`** "사용자 지정"용 입력칸

7. **L85~94 버튼 13개 생성 + 색상 설정 + 프레임에 추가**
   ```java
   String[] prgname = {"노노케어", "스쿨존", ..., "사용자 지정"}; // 13개
   for(int i=0; i<prgname.length; i++) { ... }
   ```

8. **L96~104 버튼 배치 — 의도는 좋았으나 로직 깨짐**
   ```java
   for(int i=0; i<prgname.length;i++) {
       if(i <= 5) {
           btn[i].setBounds(30, 60+(i*80), 150, 50);
           btn[i+6].setBounds(210, 60+(i*80), 150, 50);
       }
       else
           btn[12].setBounds(30,540,150,50);  // 반복문 안에서 7번이나 같은 줄 실행
   }
   ```
   결과는 맞지만 효율은 0.

9. **L107~122 죽은 주석 코드**
   - 위 배치 로직 이전의 수동 좌표 13줄. 폐기 후 주석으로 남아있음.

10. **L127~137 또 다른 죽은 주석**
    - 람다 캡처 문제로 좌절된 일괄 등록 시도. "람다식 관련 문제 해결해야함" 라고 메모만 남아있음.

11. **L139~210 — DRY 대참사**
    13개의 ActionListener를 거의 동일하게 복사:
    ```java
    btn[0].addActionListener(event -> {
        StringSelection data1 = new StringSelection(prgname[0]);
        Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        clipboard.setContents(data1, data1);
    });
    btn[1].addActionListener(event -> {
        StringSelection data1 = new StringSelection(prgname[1]);
        Clipboard clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
        clipboard.setContents(data1, data1);
    });
    // ... 11번 더 반복 ...
    ```

12. **L214~218 마지막 버튼만 다른 처리** — 텍스트필드에 입력된 값을 복사.

13. **L221 `frm.setVisible(true)`**

#### 1.2.3 As-Is 문제점 종합

| # | 문제 | 영향 |
|---|---|---|
| ① | `main()` 하나에 200줄 (God Method) | 가독성·테스트·수정 난이도 ↑ |
| ② | 13번 복붙된 ActionListener (DRY 위반) | 키워드 추가 시 N곳 수정 |
| ③ | `p.waitFor()` 블로킹 | 외부 exe 닫을 때까지 GUI 안 뜸 |
| ④ | 외부 exe 경로 하드코딩 | 다른 PC에 깔린 위치 다르면 코드 수정 + 재빌드 |
| ⑤ | 매직 넘버 다수 | 레이아웃 수정 시 어디 만져야 할지 추적 어려움 |
| ⑥ | EDT 위반 (`SwingUtilities.invokeLater` 없음) | 드물게 화면 깨짐·교착 |
| ⑦ | 외부 exe 실행 실패 시 stderr 출력만 | 사용자는 왜 안 되는지 모름 |
| ⑧ | 미사용 import 7~8개 | 컴파일 경고, 코드 노이즈 |
| ⑨ | `Button.java`(빈 클래스), `Removed.java`(컴파일 불가 폐기 코드) | 노이즈, 혼란 |
| ⑩ | 죽은 주석 블록 두 군데 | 노이즈 |

### 1.3 [리팩토링 후] — To-Be

#### 1.3.1 새 파일 구조

```
src/
├── app/                          ← 새 패키지
│   ├── App.java                  ← 진입점 (main 메서드)
│   ├── MainFrame.java            ← JFrame 상속, UI 구성
│   ├── UiConstants.java          ← 좌표·크기·색·폰트·문구 상수
│   ├── ClipboardService.java     ← 클립보드 복사 헬퍼
│   ├── ProcessLauncher.java      ← 외부 exe 실행 (논블로킹 + 오류 다이얼로그)
│   └── AppConfig.java            ← config.properties 로딩
└── config.properties             ← exe 경로 + 프로그램명 리스트 (UTF-8)
```

#### 1.3.2 책임 매핑 (As-Is → To-Be)

| 원본 위치 | 하던 일 | 새 위치 |
|---|---|---|
| `Main.main()` L26~32 | 전역 폰트 변경 | [App.java#applyGlobalFont()](src/app/App.java) |
| `Main.main()` L37~48 | JFrame 기본 설정 | [MainFrame.java#initFrame()](src/app/MainFrame.java) |
| `Main.main()` L50~60 | 외부 exe 실행 | [ProcessLauncher.java#launchDetached()](src/app/ProcessLauncher.java) **(논블로킹으로 수정됨)** |
| `Main.main()` L63~69 | 헤더 라벨 | [MainFrame.java#addHeader()](src/app/MainFrame.java) |
| `Main.main()` L71~75 | 미리보기 영역 | [MainFrame.java#addPreviewArea()](src/app/MainFrame.java) |
| `Main.main()` L77~83 | 사용자 입력 필드 | [MainFrame.java#addCustomField()](src/app/MainFrame.java) |
| `Main.main()` L85~104 | 버튼 13개 생성/배치 | [MainFrame.java#addProgramButtons() + placeButton()](src/app/MainFrame.java) |
| `Main.main()` L139~218 | 13개 ActionListener | [MainFrame.java#attachClipboardListener()](src/app/MainFrame.java) **(루프 1개로 통합)** |
| 클립보드 복사 3줄 | (반복) | [ClipboardService.copy()](src/app/ClipboardService.java) |
| 좌표·크기 매직 넘버 | (산재) | [UiConstants.java](src/app/UiConstants.java) |
| `prgname` 배열, exe 경로 문자열 | (코드 박힘) | [config.properties](src/config.properties) + [AppConfig.java](src/app/AppConfig.java) |

#### 1.3.3 핵심 개선 코드 예시

**(a) 13번 복붙 ActionListener → 루프 1개**

As-Is (요약):
```java
btn[0].addActionListener(event -> { StringSelection data1 = new StringSelection(prgname[0]); ... });
btn[1].addActionListener(event -> { StringSelection data1 = new StringSelection(prgname[1]); ... });
// ... 11번 더 ...
btn[12].addActionListener(event -> { StringSelection data1 = new StringSelection(textfield.getText()); ... });
```

To-Be:
```java
for (int i = 0; i < names.size(); i++) {
    final boolean isCustom = (i == names.size() - 1);
    final String fixedText = isCustom ? null : names.get(i);
    btn.addActionListener(e -> {
        String text = isCustom ? customField.getText() : fixedText;
        ClipboardService.copy(text);
    });
}
```
람다 캡처 문제는 `final` 지역변수로 해결.

**(b) 블로킹 버그**

As-Is:
```java
Process p = rt.exec(exeFile);
p.waitFor();  // ← GUI가 외부 프로그램 종료까지 대기
```

To-Be:
```java
new ProcessBuilder(exePath).start();  // 시작만 시키고 즉시 반환
```

**(c) 외부 exe 경로 — 코드 박힘 → 설정 파일**

As-Is (코드 한복판):
```java
String exeFile = "C:\\Program Files (x86)\\경성정보기술\\RF출석관리\\ATTEND_RF.exe";
```

To-Be (`config.properties`):
```properties
external.exe.path=C:\\Program Files (x86)\\경성정보기술\\RF출석관리\\ATTEND_RF.exe
```
배포 후에도 텍스트 편집만으로 수정 가능. 재컴파일 불필요.

**(d) EDT 안전성**

As-Is: UI를 메인 스레드에서 바로 만듦 (Swing 규약 위반).
To-Be:
```java
SwingUtilities.invokeLater(() -> new MainFrame(config).setVisible(true));
```

**(e) 외부 exe 실행 실패 — silent → 다이얼로그**

As-Is: `e.printStackTrace()` 만 (사용자는 못 봄).
To-Be: `JOptionPane.showMessageDialog(...)` 로 시각적 알림.

#### 1.3.4 보존한 것 (의도적)

- **`null` 레이아웃 + `setBounds()`**: 시각 검증 불가하므로 LayoutManager 전환은 보류.
- **`java.awt.TextArea`** (Swing의 `JTextArea` 아님): 원본 동작 그대로.
- **윈도우 제목 `"이찬호"`**: 원작자 표시로 추정.
- **`Color.LIGHT_GRAY` 배경, `Color.darkGray` 버튼**: 시각 정체성 유지.

---

## 2. 단계별 리팩토링 계획 (Phase 1~7)

| Phase | 내용 | 상태 |
|---|---|---|
| 1 | 정리 (죽은 파일·import·주석 제거) | ✅ 완료 |
| 2 | 중복 제거 (13개 ActionListener → 루프 1개) | ✅ 완료 |
| 3 | 관심사 분리 (단일 `Main.java` → 6개 파일) | ✅ 완료 |
| 4 | 외부 설정화 (`config.properties` 도입) | ✅ 완료 |
| 5 | 버그 수정 (`waitFor` 제거, EDT 적용, 실패 다이얼로그) | ✅ 완료 |
| 6 | 레이아웃 매니저 전환 | ⏸ 보류 (시각 검증 후 결정) |
| 7 | 자바 없는 exe 빌드 (jpackage) | ⏳ 대기 (JDK 설치 후) |

---

## 3. Phase 7 — 자바 없는 exe 빌드 상세

### 3.1 왜 필요한가

기존 `출입도우미.exe`(445KB)는 **Launch4j로 만든 런처**일 뿐, JRE를 못 갖고 다님. → 사용자 PC에 자바 없으면 `"JAVA has not been found on your computer. Do you want to download it?"` 메시지 출력.

**Phase 7의 목표**: JRE를 exe와 함께 묶어서, 자바 미설치 PC에서도 더블클릭만으로 실행되게 한다.

### 3.2 도구 선택 — `jpackage`

비교 결과는 1번 메시지에서 정리한 표대로. 요약하면:

- **`jpackage` (채택)**: JDK 14+ 기본 내장, Swing 호환성 좋음, 30~50MB 결과물
- ~~jlink + Launch4j~~: 옛 방식, 수동 작업 많음
- ~~GraalVM Native Image~~: Swing 미지원 수준, 비현실적

### 3.3 산출물 형태 선택

`jpackage`는 `--type` 옵션으로 결과물 형태를 고를 수 있음:

| `--type` 값 | 결과물 | 어르신용 배포 적합도 |
|---|---|---|
| **`app-image`** | 폴더 (exe + JRE) | ◎ — zip으로 압축해서 USB 전달, 풀어서 더블클릭. 설치 불필요. |
| `exe` | Windows 설치 마법사 (.exe) | △ — WiX Toolset 추가 설치 필요 |
| `msi` | MSI 설치 패키지 | △ — WiX Toolset 추가 설치 필요 |

→ **`app-image` 추천.** 가장 간단하고 의존성 없음.

### 3.4 빌드 단계 (예정 작업 순서)

#### Step 1. JDK 설치 (사용자 작업)
- Microsoft Build of OpenJDK 21 LTS 또는 Eclipse Temurin 21
- 설치 후 `javac --version`, `jpackage --version` 확인
- 자세한 링크는 [§6 부록](#6-부록-jdk-설치-가이드).

#### Step 2. `.classpath` JDK 21로 갱신
현재 `.classpath`는 `JavaSE-1.8` 명시. JDK 21로 변경 (jpackage 사용 위해 14+ 필수).

#### Step 3. 컴파일 검증
```powershell
javac -d bin -encoding UTF-8 src/app/*.java
Copy-Item src/config.properties bin/
```
오류 없으면 OK.

#### Step 4. 실행 검증
```powershell
java -cp bin app.App
```
GUI 정상 표시, 버튼 클릭 시 클립보드 복사 확인.

#### Step 5. jar로 패키징
실행 가능한 jar 생성:
```powershell
echo "Main-Class: app.App" > manifest.txt
jar cfm 출입도우미.jar manifest.txt -C bin .
```

#### Step 6. `jpackage`로 자바 없는 exe 빌드
```powershell
jpackage `
  --name 출입도우미 `
  --input . `
  --main-jar 출입도우미.jar `
  --main-class app.App `
  --type app-image `
  --win-console false `
  --dest dist
```

#### Step 7. 결과물 구조 확인
```
dist/출입도우미/
├── 출입도우미.exe        ← 더블클릭하면 GUI 뜸 (자바 없어도)
├── app/
│   └── 출입도우미.jar
├── runtime/             ← 내장 JRE (jpackage가 jlink로 만든 최소 JRE)
│   ├── bin/
│   └── lib/
└── config.properties    ← 텍스트 에디터로 직접 수정 가능
```

#### Step 8. 배포
`dist/출입도우미/` 폴더 전체를 zip으로 압축 → USB나 메일로 전달 → 받은 사람은 풀고 `출입도우미.exe` 더블클릭.

### 3.5 선택적 최적화

- **앱 아이콘**: `--icon icon.ico` 옵션으로 exe 아이콘 지정 (256×256 ico 권장)
- **버전 정보**: `--app-version 1.0.0`, `--vendor "성북노인종합복지관"`
- **JRE 추가 축소**: `--add-modules java.desktop,java.base` 명시해 모듈 최소화 (jpackage가 자동으로도 잘 함)
- **설치 마법사 원할 경우**: `--type msi`로 변경하고 WiX Toolset 설치

---

## 4. 현재까지 진행 상황 / 다음 단계

### 완료 (2026-05-19)

- [x] 압축 해제 (`Seongbuk-Senior-Club-Entrance-Helper-master.zip` → `C:\toyProj\`)
- [x] Phase 1: `Button.java`, `Removed.java` 삭제
- [x] Phase 2: 13개 ActionListener → 루프 1개로 통합
- [x] Phase 3: 단일 `Main.java` → 6개 파일로 분리 (`app` 패키지)
- [x] Phase 4: exe 경로·프로그램명 → `config.properties`로 외부화
- [x] Phase 5: `p.waitFor()` 블로킹 버그 수정, EDT 적용, 실패 다이얼로그 추가
- [x] 기존 `src/main/` 디렉토리 전체 제거

### 대기 중

- [ ] **사용자: JDK 21 설치** ← 현재 막혀있는 지점
- [ ] 컴파일 검증 (`javac`)
- [ ] 실행 검증 (`java -cp bin app.App`)
- [ ] (옵션) Phase 6: LayoutManager 전환 — 시각 검증 후 결정
- [ ] Phase 7: `jpackage`로 자바 없는 exe 빌드 및 배포 패키지 생성

### 막혔던 부분 회상용

- "자바 없이 동작하는 exe를 만드는데 왜 JDK가 필요한가?" → 빌드하는 사람과 최종 사용자의 역할이 다름. JDK는 **만드는 도구**, JRE는 **실행 환경**. Phase 7 산출물 안에 JRE가 들어가므로 **최종 사용자는 아무것도 안 깔아도 됨**. 하지만 그 산출물을 **만들기 위해선 빌더 PC에 JDK가 있어야 함**.

---

## 5. 부록: JDK 설치 가이드

### 5.1 추천 배포판 (Windows 11 x64, 둘 다 무료)

**1순위: Microsoft Build of OpenJDK 21**
- 안내 페이지: https://learn.microsoft.com/en-us/java/openjdk/download
- 직접 다운로드: https://aka.ms/download-jdk/microsoft-jdk-21-windows-x64.msi
- 장점: MSI 설치 시 PATH와 `JAVA_HOME` 자동 설정

**2순위: Eclipse Temurin 21**
- https://adoptium.net/temurin/releases/?version=21&os=windows&arch=x64
- "Windows x64 — MSI" 파일 다운로드
- 설치 도중 **"Set JAVA_HOME variable"** + **"Add to PATH"** 옵션 체크 필수

### 5.2 설치 확인 (PowerShell)

```powershell
java --version
javac --version
jpackage --version
```

세 명령 모두 `21.x.x` 출력되면 설치 완료. 안 뜨면 PowerShell 창 재시작 후 다시 확인 (환경변수 새 창에만 반영).

### 5.3 설치 후 알릴 것

"JDK 설치 끝났다" 한 마디면 다음 작업(컴파일 검증 → Phase 7) 이어서 진행.

---

## 6. v1.1 변경분 — 외부 exe 제거 + 자동 붙여넣기

Phase 7 완료(v1.0 = 자바 없는 exe) 이후 실사용 피드백을 받아 추가 작업한 내용.

### 6.1 변경 요청 배경

1. **외부 exe 추적 제거** — v1.0 실행 시 `ATTEND_RF.exe`가 없는 PC에서 "외부 프로그램 실행 실패" 다이얼로그가 매번 떴음. 이 기능 자체를 더 이상 쓰지 않기로 결정.
2. **자동 붙여넣기** — 기존 흐름은 "버튼 클릭(=복사) → 사용자가 ATTEND_RF로 전환 → Ctrl+V". 사용성을 더 줄이기 위해 "버튼 클릭 → 다음 좌클릭 시 자동 paste + 클립보드 비움" 동작 요구.

### 6.2 변경된 파일

| 파일 | 변경 |
|---|---|
| [src/app/ProcessLauncher.java](src/app/ProcessLauncher.java) | **삭제** |
| [src/app/AppConfig.java](src/app/AppConfig.java) | `externalExePath` 필드·기본값·getter 제거 |
| [config.properties](config.properties) | `external.exe.path` 라인 제거 |
| [src/app/App.java](src/app/App.java) | `ProcessLauncher.launchDetached(...)` 호출 제거, `AutoPasteService` 초기화 + 종료 훅 추가 |
| [src/app/ClipboardService.java](src/app/ClipboardService.java) | `clear()` 메서드 추가 |
| [src/app/MainFrame.java](src/app/MainFrame.java) | `attachAutoPaste(AutoPasteService)` + 복사 직후 `autoPaste.arm()` 호출 |
| [src/app/AutoPasteService.java](src/app/AutoPasteService.java) | **신규** — JNativeHook 기반 전역 마우스 후킹 |
| [lib/jnativehook-2.2.2.jar](lib/jnativehook-2.2.2.jar) | **신규 의존성** (Maven Central, GPL+CPE, ~657KB) |
| [.classpath](.classpath) | JDK 컨테이너 1.8 → 21, lib jar 등록 |
| [.settings/org.eclipse.jdt.core.prefs](.settings/org.eclipse.jdt.core.prefs) | 컴파일러 1.8 → 21 |
| [build.ps1](build.ps1) | **신규** — 전체 빌드 자동화 스크립트 (compile → jar → jpackage) |

### 6.3 새 동작 흐름 (v1.1)

```
[버튼 클릭]
    ├─ ClipboardService.copy(text)         ← 텍스트 클립보드에 복사
    └─ autoPaste.arm()                     ← "다음 좌클릭은 paste 신호" 표시

[사용자가 ATTEND_RF 입력칸 클릭]
    ├─ 전역 마우스 후킹이 좌클릭 감지
    ├─ 클릭 위치가 우리 앱 창 밖인지 확인 (밖이면 진행)
    ├─ 80ms 대기 (포커스 전환 시간 확보)
    ├─ Robot으로 Ctrl+V 시뮬레이션         ← 자동 paste
    ├─ 200ms 대기 (paste 완료 대기)
    └─ ClipboardService.clear()            ← 클립보드 비움
```

### 6.4 안전장치

JNativeHook은 네이티브 DLL을 사용자 PC에서 동적으로 추출·로드. 백신이 차단하거나 OS 호환성 문제가 있으면 등록이 실패할 수 있음.

`AutoPasteService.initialize()`는 `try { ... } catch (Throwable t) { }`로 감싸 어떤 실패가 나도 앱은 정상 기동하며, 자동 paste 기능만 조용히 비활성화됨. 사용자는 기존처럼 수동 Ctrl+V로 동작 유지.

### 6.5 빌드 방법 (v1.1)

[build.ps1](build.ps1) 한 번 실행하면 컴파일·jar·jpackage·config 배치까지 자동:

```powershell
cd C:\toyProj
.\build.ps1
```

산출물: `dist/출입도우미/` 폴더. v1.0과 구조 동일하되 `app/` 안에 jnativehook jar가 추가됨.

```
dist/출입도우미/
├── 출입도우미.exe
├── config.properties
├── app/
│   ├── 출입도우미.jar
│   ├── 출입도우미.cfg
│   └── jnativehook-2.2.2.jar    ← v1.1 추가
└── runtime/                      (java.base + java.desktop + java.logging)
```

### 6.6 v1.1 진행 상황

- [x] [src/app/ProcessLauncher.java](src/app/ProcessLauncher.java) 삭제 + AppConfig·config.properties 정리
- [x] [src/app/ClipboardService.java](src/app/ClipboardService.java) `clear()` 추가
- [x] [src/app/AutoPasteService.java](src/app/AutoPasteService.java) 작성 (안전장치 포함)
- [x] [src/app/App.java](src/app/App.java) + [src/app/MainFrame.java](src/app/MainFrame.java) 와이어링
- [x] JNativeHook jar 수령 (`lib/jnativehook-2.2.2.jar`)
- [x] Eclipse 진단 통과 (경고 0, 에러 0)
- [x] [build.ps1](build.ps1) 작성
- [ ] **사용자: `.\build.ps1` 실행** ← 현재 막혀있는 지점 (도구 정책상 외부 jar 접근 명령을 자동 모드가 차단)
- [ ] 새 exe 동작 검증 (auto-paste 흐름 확인)

---

## 7. 기술 선택 메모 — Docker 미사용 이유 & 향후 CI/CD 프로젝트 계획

> *(2026-05-25 추가)* CI/CD를 본격적으로 붙이기에 앞서, 처음엔 Docker 사용을 염두에 뒀던 계획이 왜 빠지게 됐는지와, 그 욕구를 어떻게 풀지 정리해 둔다.

### 7.1 이 프로젝트에서 Docker를 쓰지 않은 이유

먼저 전제: **Docker는 CI/CD의 필수 요소가 아니라, CI/CD에서 자주 쓰이는 선택적 도구**다. CI/CD의 본질은 "코드 변경 → 자동 빌드 → 자동 테스트 → 자동 전달/배포"라는 자동화 루프이고, Docker는 그 안에서 *환경을 일정하게 만들거나 배포 단위를 컨테이너로 포장*할 때 쓰인다.

이 프로젝트엔 그 자리가 구조적으로 없다:

| 이유 | 설명 |
|---|---|
| **산출물이 데스크톱 GUI(.exe)** | 사용자가 더블클릭하는 Windows 바이너리다. 서버/웹 서비스가 아니라 컨테이너로 배포할 대상이 아니다. (사용자가 `docker run`으로 GUI를 띄우지 않는다) |
| **무서버형(Serverless) 아키텍처** | 전체 계획이 GitHub Actions(빌드) + Releases(배포) + Pages(다운로드)로, **상시 구동되는 서버가 없다.** 컨테이너화할 런타임 자체가 존재하지 않는다. |
| **빌드 재현성은 이미 해결** | 빌드 환경 일관성은 GitHub Actions 러너 + Gradle Wrapper(Gradle 버전 고정)가 담당한다. 이를 위해 Docker를 더할 이유가 없다. |
| **jpackage는 타깃 OS에서 빌드해야 함** | Windows용 `.exe`(app-image)는 **Windows 러너에서만** 생성된다. Linux 컨테이너 안에선 Windows GUI 패키징이 불가능해, 빌드 단계에도 Docker가 도움이 안 된다. |

**결론:** 이 프로젝트는 Docker 없이도 완전한 CI/CD다 — **CI**(빌드+테스트 자동화) + **CD**(jpackage → exe → GitHub Releases 자동 배포) + **GitHub Pages**(다운로드 페이지). 산출물이 "컨테이너 이미지"가 아니라 "데스크톱 바이너리"일 뿐, 엄연한 지속적 전달 파이프라인이다. Docker는 서버/웹 앱에서 제 가치가 나오는 도구라, 데스크톱 배포 트랙에는 의도적으로 넣지 않는다.

### 7.2 향후 계획 — 별도 CI/CD 프로젝트 (GitHub Actions + Docker 필수)

Docker/컨테이너 기반 CI/CD를 제대로 학습하기 위해, **별도 저장소로 컴패니언 프로젝트**를 진행할 예정이다. 이 출입도우미(데스크톱 exe 배포 트랙)와 상호보완 관계로, 저쪽은 **컨테이너 배포 트랙**을 담당한다.

- **반드시 사용할 것:** GitHub Actions + Docker (이번엔 컨테이너를 핵심으로 다룬다)
- **예정 구성 (초안):**
  - 최소 웹 서비스(엔드포인트 1개) — 예: Spring Boot / Node.js / Python FastAPI 중 택1
  - `Dockerfile` (멀티스테이지 빌드)로 이미지 생성
  - GitHub Actions: build + test → **Docker 이미지 빌드 → GHCR(GitHub Container Registry)에 push**
  - 배우는 것: Dockerfile, 멀티스테이지 빌드, 이미지 레지스트리, 컨테이너 기반 CD
- **무료 유지 팁:** "무서버형" 기조를 이어가려면 *이미지 빌드 + GHCR push + 컨테이너 내 테스트*까지만 해도 충분하다(GHCR 공개 이미지 무료). 상시 구동 배포(running container)는 호스팅 비용이 생기니, 필요할 때만 무료 티어(Render/Fly.io 등)를 쓴다.

> ⚠️ **용어 주의:** 여기서 말하는 "v2 CI/CD 프로젝트"는 이 저장소의 `v2` *브랜치*(앱 버전 2)와는 **무관한 별개의 새 저장소**다. (예상 이름: `docker-cicd-practice` 등)

---

## 8. v1.2 변경 — 자동 붙여넣기 신뢰성 개선

> 작업일: 2026-05-25 · 브랜치: `feature/auto-paste`. 실사용 중 "버튼 클릭 후 좌클릭 시 자동 붙여넣기"가 **됐다 안 됐다** 하던 문제를 잡고, 앱 안에서 자체 테스트가 가능하도록 개선.

### 8.1 증상
버튼 클릭(클립보드 복사 + "다음 좌클릭 무장") 후 외부 창을 좌클릭하면 자동 Ctrl+V가 되어야 하는데, 간헐적으로 빈 값이 붙거나 아예 안 붙음.

### 8.2 원인
- **포커스 대기 80ms가 너무 짧음** — 클릭한 외부 창이 포커스를 다 받기 전에 `Robot`이 Ctrl+V를 쏴 무효가 됨.
- **클립보드 비우기 레이스** — 붙여넣기 200ms 뒤 클립보드를 비우는데, 붙여넣기가 끝나기 전에 비워지면 빈 값이 붙음.

### 8.3 변경
| 파일 | 변경 |
|---|---|
| `AutoPasteService.java` | 포커스 대기 80→**200ms** · 붙여넣기 후 **클립보드 비우기 제거**(레이스 해소 → '무조건 붙여넣기') · 미사용 `SwingUtilities` import 정리 · 메서드명 `schedulePasteAndClear`→`schedulePaste` |
| `ClipboardService.java` | 미사용이 된 `clear()` 제거 |
| `MainFrame.java` · `App.java` · `AutoPasteService.java` | **미리보기 TextArea를 자동 붙여넣기 대상으로 허용**(`isOnComponent`) — 창 안이어도 미리보기 영역 위 클릭이면 붙여넣기 → 외부 창 없이 자체 테스트 가능 |
| `build.gradle` | version 1.1.0 → **1.2.0** |

### 8.4 남은 가능성 (그래도 안 되면)
"됐다 안 됐다"가 아니라 **한 세션 내내 안 된다**면 JNativeHook 등록 실패(백신/OS)일 수 있다. 현재는 조용히 비활성화됨 → 향후 **상태 표시줄(기능 8)**로 활성/비활성을 가시화할 예정.

---

## 9. v1.3 변경 — UI 개편 (진행 중)

> 작업일: 2026-05-25~. "디자인 개선" 요청에서 시작한 UI 현대화. 기능을 배치(브랜치)별로 나눠 진행하며, 모두 끝나면 `1.3.0`으로 릴리스 예정.

### 9.1 디자인 재설계 + LayoutManager 전환 (배치 1 · 머지 완료, PR #8)
- **null 레이아웃 → LayoutManager**: `BorderLayout`(North 헤더 배너 / Center 버튼 그리드 + 미리보기 / South 사용자지정 행) + 버튼은 `GridLayout(0, 2)`.
  - 창 크기·항목 수에 적응, 좌표 매직넘버 전부 제거. **버튼 12개 초과 시 겹치던 한계 해소.**
- **플랫 모던 디자인**: accent 파랑(`#2D6CDF`), 맑은 고딕, 흰 버튼 + 호버 하이라이트, 미리보기는 스크롤되는 `JTextArea`.
- **창 타이틀**: `이찬호` → `출입도우미 v2 made by 이찬호`.
- 파일: `UiConstants`(좌표 제거 → 팔레트/폰트/간격), `MainFrame`(전면 재작성).

### 9.2 상태 표시줄 (배치 2 · 브랜치 `feature/statusbar`)
- 하단 상태 바: 좌측 **자동 붙여넣기 켜짐/꺼짐**(`AutoPasteService.isEnabled()`, 색 구분) + 우측 **마지막 복사한 값**.
- 효과: JNativeHook 등록 실패(백신/OS)를 **눈에 보이게** → §8.4에서 예고한 "됐다 안됐다" 가시화를 실현. 방금 복사한 값도 확인.
- 파일: `MainFrame`(하단을 사용자지정 행 + 상태바로 재구성), `UiConstants`(상태색 추가).

### 9.3 단축키 (배치 3 · 브랜치 `feature/hotkeys`)
- **숫자키 1~9**로 앞 9개 항목 선택(복사 + 자동붙여넣기 무장). 버튼 앞에 **①~⑨ 원문자 배지**(accent 색, HTML 라벨)로 강조해 발견성↑.
- **사용자 지정 입력칸에 타이핑 중일 때만 단축키 양보**(숫자 입력 보존), 그 외(버튼·미리보기 포커스)에선 단축키 유지. ※ 초기엔 모든 텍스트 컴포넌트에 양보해 "미리보기 클릭 후 단축키가 막히던" 버그가 있어 수정함.
- 파일: `MainFrame`(`setupHotkeys` + 버튼 번호 라벨), `UiConstants`(안내문에 단축키 힌트).

### 9.4 사용 기록/통계 (배치 4 · 브랜치 `feature/usage-stats`)
- 항목 복사 시 **날짜별 CSV**(`log/log-YYYY-MM-DD.csv`)에 `타임스탬프,항목` 한 줄 기록. 파일 I/O 실패는 무시(핵심 기능 방해 금지). 위치: 개발 실행은 프로젝트 `log/`, 패키지(exe) 실행은 **exe 옆 `log/`**(`jpackage.app-path` 기준 — 다른 PC에서도 동작).
- **항목별 횟수 집계** — 재시작해도 오늘 CSV를 읽어 카운트 복원. 상태바에 `마지막 복사: ○○ (오늘 N회)` 표시.
- 순수 함수로 분리해 단위 테스트: `csvEscape` / `formatRow` / `parseItem`(라운드트립) / `tally` → `UsageLogTest` 7개.
- 파일: 신규 `UsageLog`, `MainFrame`(record + 카운트 표시), 신규 `UsageLogTest`.

### 9.5 항목 편집 UI (배치 5 · 브랜치 `feature/item-editor`)
- 헤더 우측에 **`항목 편집`** 버튼 → **모달 다이얼로그**(`ProgramEditorDialog`)에서 버튼 항목을 **추가/삭제/위·아래 순서변경**.
  - ※ 처음엔 `✎ 항목 편집`로 넣었으나 맑은 고딕에 `✎` 글리프가 없어 두부(□)로 깨져 제거(커밋 `ecec09a`). 아이콘 깨짐 문제는 §9.7에서 일반적으로 해결.
  - 맨 끝 **`사용자 지정` 항목은 편집 대상에서 제외**하고 항상 끝에 고정(우측 입력칸 복사 버튼이라 의미가 다름).
  - `JList` + `DefaultListModel`, 사이드 버튼(＋추가 / －삭제 / ▲위로 / ▼아래로) + 하단 저장/취소.
- 저장 시 **`config.properties`에 평문(UTF-8)으로 기록**(`AppConfig.save`) 후, **버튼 그리드만 다시 그려** 즉시 반영(`reloadPrograms` — 미리보기·상태바·입력칸은 유지).
- **단축키도 편집 결과 반영**: `setupHotkeys`가 매 입력마다 `config.programNames()`를 **현재 값으로 다시 읽도록** 변경(이전엔 시작 시점 목록을 캡처해 편집 후 어긋남).
- 파일: 신규 `ProgramEditorDialog`, `AppConfig`(`save` 추가), `MainFrame`(헤더에 편집 버튼 + `openEditor`/`reloadPrograms`, `setupHotkeys` 최신값 읽기).

### 9.6 정보(About) + 업데이트 확인 (배치 6 · 브랜치 `feature/about-update`)
- 헤더 우측에 **`정보`** 버튼 추가(기존 `항목 편집`과 같은 스타일, `headerButton` 공용 헬퍼로 통일).
- **정보 다이얼로그**(`AboutDialog`): 앱 이름·**버전**·제작자·설명 + **GitHub 저장소 링크**(클릭 시 `Desktop.browse`로 브라우저 열기).
- **업데이트 확인**: GitHub Releases API(`/releases/latest`)로 최신 태그 조회 → 현재 버전과 비교.
  - **`SwingWorker`로 백그라운드 실행**(네트워크가 EDT를 멈추지 않게), "확인 중..." → 결과 표시. 새 버전이 있으면 **다운로드 페이지 링크** 노출, 최신이면 초록, 실패는 빨강.
  - JSON 라이브러리 없이 `tag_name`만 정규식으로 추출(필드 하나라 충분).
- **버전 소스**: `build.gradle` `version`을 **jar 매니페스트(`Implementation-Version`)** 에 기록 → `UiConstants.appVersion()`이 런타임에 읽음. 매니페스트가 없는 개발 실행은 `FALLBACK_VERSION`으로 대체. `build.gradle` 버전을 **`1.3.0`** 으로 상향.
- 순수 함수 단위 테스트: `parseTagName` / `normalize`(v·V 제거) / `compareVersions`(자리수 보정·접미사 무시) → `UpdateCheckerTest` 7개.
- 파일: 신규 `UpdateChecker`, `AboutDialog`, `UpdateCheckerTest`, `UiConstants`(메타데이터 + `appVersion`), `MainFrame`(헤더 `정보` 버튼 + `headerButton`/`openAbout`), `build.gradle`(버전·매니페스트).

### 9.7 UI 디자인 개편 (브랜치 `feature/ui-redesign`)
> 배치 1~6 기능 위에 시각적 완성도를 올린 작업. About(배치 6)과 분리해 별도 PR로 진행.

- **둥근 모서리 디자인 + 공용 팩토리**: `UiFactory`로 둥근 버튼(accent/neutral/ghost)·둥근 카드를 한곳에서 생성 → 메인 창과 두 다이얼로그가 같은 스타일을 공유. 직접 페인팅(`fillRoundRect` + 안티앨리어싱), 롤오버 시 호버색. 입력칸은 `RoundedBorder`(모서리 바깥을 배경색으로 덮어 잔상 제거)로 둥글게.
- **다이얼로그 현대화**: `AboutDialog`는 제목/버전 + 정보 카드(제작자·설명·GitHub 링크) + 업데이트 영역 + 닫기로 재구성. `ProgramEditorDialog`는 리스트를 둥근 카드에 담고 선택 행 하이라이트·행 높이↑, 버튼 전부 둥근 스타일.
- **색상**: 베이비핑크 등 여러 시안을 검토했으나 최종적으로 **기존 파란 accent 유지**로 결정(메인 화면 가독성·정체성). `UiConstants`에 `ACCENT_DEEP`(흰 배경 위 글자)·`ON_ACCENT`(accent 면 위 글자) 추가해 색 사용을 명시화.
- **깨지지 않는 아이콘**: `UiConstants.icon(glyph, text)` — 폰트(`맑은 고딕`)가 `canDisplayUpTo`로 **표시 가능한 글리프만** 라벨에 붙이고, 불가하면 생략 → 환경에 상관없이 두부(□) 깨짐 원천 차단. 적용: `ⓘ 정보`, `≡ 항목 편집`, 사용자 지정 `▶`, 업데이트 `↻`, GitHub `↗`, 다운로드 `↓`, 편집창 `＋ － ▲ ▼ ✓ ✕`. (배치 5의 `✎`가 글리프 부재로 깨지던 문제를 일반화해 해결.)
- 파일: 신규 `UiFactory`, `RoundedBorder` / 수정 `MainFrame`·`AboutDialog`·`ProgramEditorDialog`·`UiConstants`.

### 9.8 v1.3.0 릴리스 + 문서
- **릴리스 완료**: About(PR #13) → 디자인 개편(PR #14)을 각각 별도 PR로 `v2`에 머지한 뒤, 태그 **`v1.3.0`** 푸시 → GitHub Actions(`release.yml`)가 windows 러너에서 `jpackageImage` 빌드 → **`EntranceHelper.zip`(약 26 MB)** 를 Releases에 등록(자산 state=uploaded, 1MB 가드 통과).
- **태그 주석**: 사용자 요청으로 태그 메시지에 배치 1~6 + 디자인 개편 요약을 기입(force-push로 갱신, 재실행도 success). 릴리스 페이지 본문은 `generate_release_notes`로 자동 생성되는 PR 목록 유지(태그 메시지는 본문에 미반영 — 필요 시 `release.yml`에서 태그 메시지를 본문으로 연결 가능).
- **문서**: 사용자용 변경점을 `README.md`에 **`v3` 섹션**으로 정리(설치/사용 관점, 구현 용어 제외 · 브랜치 `docs/readme-v3`).

