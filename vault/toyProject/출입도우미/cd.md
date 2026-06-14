---
sidebar_label: "4. CD · Releases"
sidebar_position: 4
tags: [cd, release]
---

# CD — 지속적 배포 (4단계 · GitHub Actions → Releases)

> 빌드된 exe를 자동으로 GitHub **Releases**에 올린다. 사용자는 Releases에서 받아 쓴다.
> 작업일: 2026-05-25 · 브랜치: `feature/cd` · 이전 단계: [ci.md](ci.md)
> ⚠ **현재 상태:** 설계 고려사항(장단점) 정리 단계. 선택 확정 후 `release.yml` 구현 예정.

## 1. 왜 하나

CI(3단계)는 "코드가 통과하는지"를 본다. CD는 한 발 더 나가 **사용자가 받을 결과물(exe)을 자동으로 만들어 배포**한다. 수작업(`gradlew jpackageImage` → zip → 업로드)을 없앤다.

배포를 자동화하려면 두 가지를 정해야 한다: **(2.1) 언제 배포할지(트리거)**, **(2.2) 무엇을 배포할지(산출물 형태)**.

## 2. 설계 고려사항 (장단점 비교)

### 2.1 언제 배포하나 — 트리거

#### (A) 매 push (예: v2에 머지될 때마다)
- 👍 항상 최신 빌드가 자동 생성됨 / 태그를 신경 쓸 필요 없음 / 별도 행동 없이 최신 exe가 늘 준비됨
- 👎 오타·문서 수정에도 릴리스가 쏟아짐 / 정식 버전 구분 불가 / windows+jpackage는 느리고 산출물이 76MB라 매번 빌드하면 자원 낭비 / Releases 탭이 지저분해짐 / 사용자가 "뭘 받아야 하나" 혼란

#### (B) 수동 버튼 (`workflow_dispatch`)
- 👍 완전한 통제(원할 때만 실행) / 실수로 릴리스되는 일 없음 / 긴급 재배포 등 유연
- 👎 사람이 기억해서 눌러야 함(자동화 이점 반감) / 버전이 자동으로 안 붙음 / 어느 커밋이 릴리스됐는지 추적이 약함

#### (C) 버전 태그 push (`tags: ['v*']`)
- 👍 릴리스 ↔ 버전이 1:1(`v1.1.0` 태그 = `v1.1.0` 릴리스) / git에 릴리스 지점이 영구 기록됨 / semver로 변경 규모를 소통 / CI(자주)·CD(가끔) 역할이 깔끔히 분리 / 오픈소스 업계 표준
- 👎 태그를 push하는 한 단계가 필요 / `build.gradle` 버전과 태그를 수동으로 맞춰야 함(불일치 위험) / 잘못 단 태그는 정리(삭제·재push)가 번거로움

> 정리: (A)는 "계속 최신본 제공"엔 좋지만 릴리스로는 과함. (B)는 통제력↑이나 버전 추적↓. (C)는 의도적 배포 + 버전 추적이 릴리스 본질에 맞음. — (C)에 (B)를 보조로 함께 둘 수도 있음.

### 2.2 무엇을 배포하나 — 산출물 형태

#### (A) exe 파일 하나만 첨부
- 👍 파일 1개라 단순해 보이고 다운로드가 작음
- 👎 **치명적: 실행이 안 됨.** jpackage의 exe는 런처일 뿐, 옆에 `runtime/`(내장 JRE)·`app/`(jar)이 있어야 동작. 단독 exe는 무용지물 → 사실상 탈락

#### (B) app-image 폴더 → zip
- 👍 자바 없는 PC에서도 압축 풀고 더블클릭이면 끝(JRE 내장) / WiX 같은 추가 도구 불필요 / 포터블(설치 흔적 없이 USB로 전달 가능) / 워크플로가 단순
- 👎 용량 큼(~76MB, JRE 포함) / "압축 풀기" 한 단계가 필요 / 시작메뉴·바탕화면 바로가기가 자동 생성 안 됨 / 업데이트 시 폴더 통째 교체(증분 없음)

#### (C) MSI/EXE 설치 마법사 (`--type msi` 또는 `exe`)
- 👍 친숙한 설치 경험(다음→다음) / 시작메뉴·바로가기 자동 / "프로그램 추가/제거"에 등록 / 버전 업그레이드 처리 깔끔
- 👎 러너에 **WiX Toolset 설치 필요**(워크플로 복잡↑) / 설치에 관리자 권한이 필요할 수 있음 / 빌드 시간·설정 증가 / 어르신 사용자에겐 "설치" 자체가 오히려 허들일 수 있음

> 정리: (A)는 동작 불가라 제외. (B)는 의존성 0·포터블·단순. (C)는 설치 UX는 최고지만 도구·복잡도 비용이 큼(정식 설치본이 필요해질 때의 옵션).

## 3. 선택 (확정)

- **트리거: (C) 버전 태그 push (`tags: ['v*']`)** — 의도적·버전 단위 배포가 릴리스 본질에 맞고, CI(자주)와 역할이 분리되며 업계 표준이라서.
- **산출물: (B) app-image 폴더 → zip** — 자바 미설치 PC에서도 풀고 더블클릭이면 끝, WiX 같은 추가 도구 없이 가장 단순. (정식 설치본이 필요해지면 추후 MSI 추가 가능.)

## 4. 구현 (`.github/workflows/release.yml`)

- **트리거:** `on: push: tags: ['v*']`
- **러너:** `windows-latest` (Windows exe 빌드)
- **권한:** `permissions: contents: write` (Release 생성·업로드)
- **단계:** checkout → JDK 25(temurin) → Gradle → `.\gradlew.bat jpackageImage` → **실제 생성된 app-image 폴더를 직접 탐지해 `tar`로 `EntranceHelper.zip` 압축**(크기 가드: 1MB 미만이면 실패) → `softprops/action-gh-release@v2`로 Release 생성 + zip 첨부 (릴리스 노트 자동 생성)
  - ※ zip 방식의 함정과 교정 내역은 아래 [§7 트러블슈팅](#7-트러블슈팅) 참고
- **버전:** 태그(`v1.1.0`)와 `build.gradle`의 `version`(`1.1.0`)을 일치시킨다.
- **릴리스 내는 법:**
  ```powershell
  git tag v1.1.0
  git push origin v1.1.0   # → release.yml 실행 → Releases에 EntranceHelper.zip 업로드
  ```

## 5. 메모

- zip 파일명은 **버전 없이** `EntranceHelper.zip` → `releases/latest/download/EntranceHelper.zip` 고정 링크가 버전이 바뀌어도 그대로 유효(5단계 다운로드 버튼용). 버전 표시는 Release 제목/태그(`v1.1.0`)가 담당.
- 최신 Release는 `releases/latest/download/...` 고정 URL로 받을 수 있음 → **5단계(GitHub Pages 다운로드 버튼)의 기반**.
- exe 빌드는 CI(ubuntu)와 분리해 CD에서 windows 러너로 처리.
- 첫 릴리스 검증: `feature/cd` 머지 후 `v2`에 `v1.1.0` 태그를 push하면 Actions가 돌며 Releases에 zip이 올라온다.

## 6. 릴리스 내는 법 (수동, 상세)

### "태그를 push한다"가 무슨 뜻?
- **커밋** = 코드의 특정 시점 스냅샷. **브랜치** = 그 줄기의 최신을 가리키는 (움직이는) 포인터.
- **태그(tag)** = 특정 커밋에 붙이는 **고정 이름표.** 움직이지 않음. "이 커밋 = `v1.1.0` 릴리스"를 표시.
- `git tag`로 만들면 태그는 **내 컴퓨터에만** 존재한다. `git push`로 **GitHub에 올려야(=push)** 원격에도 생긴다.
- `release.yml`은 `on: push: tags: ['v*']` → **태그가 GitHub에 push되는 순간** 발동한다. (로컬 태그만으론 아무 일도 안 일어남)

### 방법 A — 터미널 (권장, 가장 확실)
1. 새 PowerShell 창(또는 Antigravity 하단 터미널)에서 프로젝트로 이동:
   ```powershell
   cd C:\study\Seongbuk-Senior-Club-Entrance-Helper-2
   ```
2. v2 최신 상태로 (태그는 "지금 위치한 커밋"에 붙으므로 v2 최신이어야 함):
   ```powershell
   git checkout v2
   git pull
   ```
3. 태그 생성 (annotated = 설명 포함):
   ```powershell
   git tag -a v1.1.0 -m "EntranceHelper v1.1.0 첫 릴리스"
   ```
   → 아직 내 컴퓨터에만 존재
4. 태그를 GitHub로 push:
   ```powershell
   git push origin v1.1.0
   ```
   → 이 순간 Release 워크플로 발동
5. 확인: GitHub → **Actions 탭**(Release 실행, 몇 분) → 끝나면 **Releases 탭**에 `v1.1.0` + `EntranceHelper.zip`

### 방법 B — Antigravity(VS Code 계열) GUI
- `Ctrl+Shift+P` → **`Git: Create Tag`** → 이름 `v1.1.0`, 메시지 입력
- `Ctrl+Shift+P` → **`Git: Push (Follow Tags)`** (또는 `Git: Push Tags`)
- (태그 조작은 GUI가 다소 숨겨져 있어 — 확실한 건 방법 A)

### 잘못했을 때 되돌리기
```powershell
git tag -d v1.1.0                  # 로컬 태그 삭제
git push origin --delete v1.1.0    # 원격(GitHub) 태그 삭제
```
- 이미 Release가 만들어졌으면 GitHub Releases 화면에서 그 릴리스도 삭제.

### 다음 버전 올릴 때
- `build.gradle`의 `version`을 새 값(예: `1.2.0`)으로 올리고 → 그에 맞는 태그(`v1.2.0`)를 위 절차로 push.

## 7. 트러블슈팅

### [2026-05-25] 첫 릴리스 zip이 460 byte(빈 파일)로 올라간 문제

**증상:** `v1.1.0` 태그 push → Release 워크플로는 **초록(성공)** → 그런데 Releases에 올라온 `출입도우미.zip`이 **460 byte**(정상 ~25MB). 워크플로가 1분도 안 걸려 끝난 것도 의심 신호였음.

**조사 과정:**
- 빌드는 정상 — 로그에 `BUILD SUCCESSFUL`, `exe: ...\build\jpackage\출입도우미\출입도우미.exe` 생성 확인. 로컬 재현도 76.5MB app-image 정상 생성.
- 한글 폴더명·BOM은 **원인 아님** — `tar`로 한글 폴더를 압축하니 내용이 정상 포함됨(검증). `appname.txt`도 BOM 없는 순수 UTF-8.
- **진짜 원인:** zip 단계가 `appname.txt`를 **다시 읽어 폴더 경로를 재조립**(`Compress-Archive -Path "build/jpackage/$name"`)하는 방식이 **인코딩에 취약**했음. BOM 없는 UTF-8 파일을 셸이 잘못 읽으면 이름이 깨지고(로컬 PowerShell 5.1에서 `異쒖엯?꾩슦誘?`로 깨지는 것 재현) → 엉뚱하거나 빈 경로가 압축됨. 이때 `Compress-Archive`는 **에러도 없이 빈 zip**을 만들고, 그게 그대로 Release에 업로드됨.

**조치:**
1. zip 단계에서 **이름 재조립 제거** → 실제 생성된 폴더를 `Get-ChildItem build/jpackage -Directory`로 직접 탐지.
2. `Compress-Archive` → **`tar`(bsdtar)** 로 교체 (더 안정적).
3. **크기 가드** 추가 — zip이 1MB 미만이면 빌드를 실패시켜 빈 zip 재발 차단.
4. 패키지 이름을 **ASCII(`EntranceHelper`)** 로 변경 → 인코딩 변수 완전 제거 + 다운로드 URL 단순화. (앱 내부 한글 UI는 그대로)
5. 잘못된 `v1.1.0` 릴리스·태그 삭제 후 재릴리스.

**교훈:**
- 파일명을 다른 곳에서 다시 읽어 경로를 재조립하지 말고, **실제 산출물을 직접 참조**하라.
- 배포 산출물엔 **"비정상 크기면 실패"** 가드를 둬라 (조용한 실패 방지).
- CI/CD는 **셸·인코딩 차이**(Windows PowerShell 5.1 vs pwsh 7, BOM 유무)에 민감하다 — ASCII 이름이 가장 안전.

**결과 (2026-05-25):** 위 조치 후 `v1.1.0` 태그를 고친 커밋으로 force 이동·재발행 → **`EntranceHelper.zip` 25.9MB 정상 업로드 확인**. CD 파이프라인 완료. (태그 재발행 시 원격에 이미 태그가 있으면 `git push origin v1.1.0 --force` 필요 — 일반 push는 거부됨.)

## 8. GitHub 웹에서 릴리스 하기 (터미널 없이)

터미널/git 명령 없이 **웹 화면만으로** 릴리스를 낼 수 있다. 우리 워크플로는 "버전 태그가 생기는 것"에 반응하므로, 웹에서 새 태그로 릴리스를 발행하면 **자동으로 exe를 빌드해 zip을 첨부**해 준다.

### 8.1 (사전) 버전 올리기 — *새 버전*일 때만
- 새 버전을 낼 거면 먼저 `build.gradle`의 `version`을 올린다 (예: `1.1.0` → `1.2.0`). 이건 코드 변경이라 평소대로 PR로 머지.
- 똑같은 버전을 다시 내는 거면 이 단계 생략.
- 원칙: 태그(`v1.2.0`)와 `build.gradle` 버전(`1.2.0`)을 일치시킨다 — exe 내부 버전이 거기서 나옴.

### 8.2 릴리스 만들기 + 발행 (= 진행)
1. 저장소 메인 화면 오른쪽 **"Releases"** → **"Draft a new release"** 버튼
   - (또는 주소창에 `.../releases/new`)
2. **"Choose a tag"** 클릭 → 새 태그 이름 입력 (예: `v1.2.0`) → 드롭다운에 뜨는 **"➕ Create new tag: v1.2.0 on publish"** 클릭
3. **"Target"** 은 `v2` (기본 브랜치) 그대로 둔다 — 태그가 v2 최신 커밋에 붙음
4. **Release title** 입력 (예: `v1.2.0`). 설명은 비워도 되고, **"Generate release notes"** 누르면 자동 작성
5. 맨 아래 **"Publish release"** 클릭
   - → GitHub이 태그를 만들고, 그 순간 **Release 워크플로가 발동**한다
6. ⚠️ 방금 만든 릴리스는 **처음엔 zip이 없다.** 워크플로가 끝나면(~1-2분) `EntranceHelper.zip`이 **자동으로 첨부**된다 — 바로 안 보여도 정상.

### 8.3 확인
1. 상단 **"Actions"** 탭 → **"Release"** 실행이 🟡(진행) → 🟢(성공). (~1-2분)
   - 핵심 한 줄: `Zip app-image` 단계의 **`Created EntranceHelper.zip (NN MB)`** — MB로 찍히면 정상.
2. **"Releases"** 탭 → 방금 버전 → **`▸ Assets`** 펼치기 → **`EntranceHelper.zip` 크기가 ~25MB** 인지 확인.
   - byte 단위로 작으면 실패 — Actions가 크기 가드로 빨간 X가 됐을 것(조용한 빈 릴리스는 안 나옴).

### 8.4 잘못했을 때 되돌리기 (웹)
- **릴리스 삭제:** Releases → 해당 버전 클릭 → 우측 **🗑(Delete)**
- **태그 삭제:** 저장소 메인 → 파일 목록 위 **"Tags"**(커밋 수 옆) → 해당 태그 → **Delete**
- 같은 버전을 다시 내려면: 릴리스 + 태그를 둘 다 삭제한 뒤 **8.2부터** 다시.

> 참고: 웹에서 publish 했는데 Actions에 "Release" 실행이 안 뜨면 알려줘 — 드물게 웹 태그가 push 이벤트를 안 쏘는 경우가 있는데, 그땐 워크플로 트리거에 `release: [published]`를 보강하면 된다.
