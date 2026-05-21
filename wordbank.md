# 단어장 (wordbank)

## CI/CD
- **CI**: Continuous Integration(지속적 통합). 코드 변경을 자주 통합하고 자동으로 빌드·테스트해 통합 오류를 일찍 잡는 개발 방식.
- **CD**: Continuous Delivery/Deployment(지속적 전달/배포). CI를 통과한 코드를 자동으로 릴리스 가능한 상태로 만들거나(Delivery), 운영 환경에 자동 배포(Deployment)하는 방식.
- **Pipeline**: 빌드→테스트→배포 등 일련의 단계를 정해진 순서대로 자동 실행하는 자동화 흐름.
- **VCS**: Version Control System(버전 관리 시스템). 소스 코드의 변경 이력을 기록·관리하는 시스템. 대표적으로 Git.
- **GitHub Actions**: GitHub에 내장된 CI/CD 플랫폼. 워크플로(YAML)를 작성해 빌드·테스트·배포를 자동화한다.
- **Runner**: GitHub Actions 워크플로의 작업(Job)을 실제로 실행하는 머신. GitHub 호스팅형과 self-hosted형이 있다.
- **YAML**: 들여쓰기로 구조를 표현하는, 사람이 읽기 쉬운 데이터 직렬화 포맷. 워크플로·설정 파일에 많이 쓰인다.

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

## 네트워크
- **SSH**: Secure Shell. 네트워크 너머의 컴퓨터에 안전하게 접속·명령하기 위한 암호화 프로토콜. 공개키/개인키 쌍으로 비밀번호 없이 인증할 수 있다(GitHub 연결에 사용).
