---
title: "🤖 AI"
sidebar_label: "🤖 AI"
sidebar_position: 7
---

# 🤖 AI

- **MCP**: Model Context Protocol. AI 모델(예: Claude)이 외부 도구·데이터·서비스에 표준화된 방식으로 연결하도록 해주는 개방형 프로토콜. 호스트의 MCP 클라이언트와 MCP 서버가 통신하는 클라이언트-서버 구조로 동작한다. (USB-C처럼 AI와 외부 기능을 잇는 공통 규격에 비유됨)
- **RAG**: Retrieval-Augmented Generation. 문서를 벡터(임베딩)로 수치화해두고 질문과 의미가 비슷한 청크를 검색해 LLM에 함께 넣어 답을 생성하는 방식. 한계는 유사도 검색이라 다단계(multi-hop)·관계 추적·전역 요약형 질문에 약하다는 점.
- **GraphRAG (Graph RAG)**: 문서에서 엔티티(개념)와 관계를 뽑아 지식 그래프를 만들고 그 그래프(+커뮤니티 요약)를 근거로 답하는 RAG. multi-hop·전역 질문 정확도↑, 대신 그래프 구축 비용이 커서 무겁다. (대표: Microsoft GraphRAG. ⚠️ "Graphic RAG" 아님)
- **Vertical AI**: 특정 산업·도메인에 특화된 AI. 범용(horizontal) AI와 대비되는 개념(예: 건설·의료·법률 전용 AI).
- **AX (AI Transformation)**: DX(디지털 전환)의 다음 단계로, 조직·업무를 AI 중심으로 재편하는 전환.
- **하네스 (harness)**: AI가 도구를 호출하고 여러 단계를 스스로 진행하도록 감싸는 실행 프레임워크. 최근엔 자체 구현보다 Claude 기본 하네스가 더 나은 경우가 많음.
