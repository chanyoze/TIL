---
created: 2026-06-17
category: note
tags: [문서관리, 배포, DCMT, 위험성평가]
readable: ../../vault/회사/진행중/2026-06-18 문서관리 개편/배포-내역.md
---

# 문서관리/위험성평가 모듈 배포 내역 (개발→운영 차집합)

환경 식별정보(서버 호스트/IP, DB 계정/비번)·동료 실명은 제외. 제품 내부 식별자만 기록.

## 비교 기준
- 테이블 = table_name
- 시퀀스 = sequence_name
- 프로그램/메뉴 = SST_UNQ_CD (프로그램 UP…, 메뉴 UM…) — 숫자 PK/ID는 환경 간 상이하므로 비교 금지

## 1. 테이블 생성
DCMT 포함 테이블 중 개발에만 있는 것에서 DTDB_*, _TEMP/_TEMP2, _OPTION 제외한 4개:
- TCCMS_DCMT_CTGRP_CYCLE
- TDCMT_CTGRP_CYCLE
- TDCMT_DCMT_SHAREPROJ
- TSST_DCMT_CTGRP_CYCLE

## 2. 시퀀스 생성 (해야 할 것만)
- SSST_CTGR_CYC (신규 TSST_DCMT_CTGRP_CYCLE용)
- DCMT 본 시퀀스 SDCMT_CTGR/SDCMT_DCMT/SDCMT_DCMT_VS/SDCMT_RFRC 는 양쪽 동일 → 생성분 없음
- 개발 전용 시퀀스 다수 존재했으나 타 모듈 레거시라 전부 제외

## 3~7
- 3. 공통팝업 배포 (직접)
- 4. 프로그램 배포 (직접) — 위험성평가 프로그램은 SST_UNQ_CD 기준 운영에 이미 전부 존재(신규 0)
- 5. 시스템메뉴 배포 (직접) — TCC_SYSTEM_MENU, SST_UNQ_CD 기준
- 6. 리포트(데이터, 파일) 배포 (직접)
- 7. 백업테이블 생성 (배포 전 운영 백업)
