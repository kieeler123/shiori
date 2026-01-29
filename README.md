📚 Shiori

Shiori is a structured personal knowledge logging platform designed for scalable search, filtering, and future global expansion.
It is not just a diary or blog — it transforms personal thoughts into searchable, indexable assets.

🌍 Concept & Vision

Most blogging platforms simply accumulate posts.

Shiori is different.

It is designed as a knowledge structure system where:

Human-readable content = original record

Tags = searchable index layer

UI = readability

Structure = future database scalability

This separation allows Shiori to grow from a local personal log tool into a global, searchable knowledge platform.

✨ Core Features (v0)

Create / Edit / Delete logs (CRUD)

Advanced Tag System

Auto-extract #tags from content

Manual tag input (space / comma / Enter)

Deduplication + tag count limit

Tag preview UI

Tag-based filtering

Undo system

5-second countdown

Timer pauses on hover

localStorage persistence

🧠 Architecture Philosophy
Layer	Role
content	Human-readable original record
tags	Index layer for search & filtering
UI display	Always formatted as #tag
Structure	Designed for Supabase(DB) expansion

Shiori separates data meaning from display, enabling long-term scalability.

🛠 Tech Stack

React + TypeScript

TailwindCSS

localStorage (v0)

Planned: Supabase (Database + Auth)

🚀 Roadmap

Supabase integration

User authentication

Tag analytics & ranking

Tag recommendation system

Multilingual-ready tag structure

🇯🇵 日本語説明
🌍 コンセプト

Shioriは単なる日記アプリではありません。
「思考を資産化する構造」 を持つ個人知識ログシステムです。

記録(content)と検索用インデックス(tags)を分離し、
将来的な検索・フィルタリング・DB拡張を前提に設計されています。

✨ 主な機能 (v0)

ログの作成 / 編集 / 削除 (CRUD)

タグシステム

本文中の #tag 自動抽出

手動タグ入力（空白 / カンマ / Enter 区切り）

重複除去 + 個数制限

タグプレビュー表示

タグフィルタリング

Undo機能

5秒カウントダウン

ホバー時タイマー停止

localStorage保存

🧠 設計思想
領域	役割
content	人が読む原本記録
tags	検索・分類用インデックス
UI表示	常に #tag 形式
構造	Supabase(DB)拡張可能
🇰🇷 한국어 설명
🌍 프로젝트 개념

Shiori는 단순 블로그나 메모 앱이 아닙니다.
개인의 생각을 검색 가능한 자산으로 구조화하는 시스템입니다.

기록(content)과 태그(tags)를 분리하여
미래의 검색 기능, 필터링, DB 확장을 고려한 구조로 설계되었습니다.

✨ 주요 기능 (v0)

로그 작성 / 수정 / 삭제 (CRUD)

태그 시스템

본문 내 #태그 자동 추출

수동 태그 입력 (공백 / 콤마 / Enter 구분)

중복 제거 및 개수 제한

태그 미리보기 UI

태그 필터링

Undo 기능

5초 카운트다운

Hover 시 타이머 정지

localStorage 저장

🧠 설계 철학
영역	역할
content	사람이 읽는 원본 기록
tags	검색/분류용 인덱스
UI	항상 #tag 형태 표시
구조	Supabase(DB) 확장 가능 설계
🎯 Summary

Shiori is built not as a simple CRUD app, but as a scalable knowledge structure system.
Its architecture prioritizes future expansion, search efficiency, and data structure clarity.