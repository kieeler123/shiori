# 📚 Shiori

Shioriは、テキスト記録とタグ整理を中心とした個人ログアプリです。  
記録(content)とタグ(index)を分離して管理し、将来的な検索・フィルタリングの拡張を前提とした設計になっています。

---

## ✨ 主な機能 (v0)

- ログの作成 / 編集 / 削除 (CRUD)
- タグシステム
  - 本文中の `#tag` 自動抽出
  - タグ入力欄（空白 / カンマ / Enter 区切り）
  - 重複除去 + 個数制限
  - タグプレビュー表示
- タグフィルタリング
- Undo（取り消し）機能
  - 5秒カウントダウン
  - ホバー時タイマー停止
- localStorage保存

---

## 🧠 設計思想

| 領域 | 役割 |
|------|------|
| content | 人が読む原本記録 |
| tags | 検索・分類用インデックス |
| UI表示 | 常に `#tag` 形式 |
| 構造 | 将来Supabase(DB)に拡張可能 |

---

## 🛠 技術スタック

- React + TypeScript
- TailwindCSS
- localStorage (v0)
- 今後: Supabase

---

## 🚀 今後の計画

- Supabase連携
- ユーザー認証
- タグ統計・推薦
- 多言語タグ構造

---

# 🌍 English Summary

**Shiori** is a personal logging app focused on text records and tag-based organization.  
It separates human-readable content from index-based tags to enable future search and filtering features.

### Features (v0)
- Create / Edit / Delete logs
- Tag system with parsing and deduplication
- Tag filtering
- Undo system with countdown
- localStorage persistence

Future: Supabase integration, authentication, multilingual tags.
