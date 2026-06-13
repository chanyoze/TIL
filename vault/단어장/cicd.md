---
title: "🔁 CI/CD"
sidebar_label: "🔁 CI/CD"
sidebar_position: 1
---

# 🔁 CI/CD

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
