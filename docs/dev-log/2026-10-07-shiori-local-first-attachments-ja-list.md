# Shiori Local-first Attachment Storage

## 今日行った作業 --- リスト形式

1.  **添付ファイル保存をLocal-firstへ変更**
    -   新規添付ファイルはSupabase
        Storageではなくローカルディスクへ保存。
    -   Supabaseは認証・DB・メタデータ管理に継続利用。
    -   既存のSupabase添付ファイルとの互換性を維持。
2.  **File System Access APIを導入**
    -   ユーザーがローカル保存フォルダを選択できるようにした。
    -   `FileSystemDirectoryHandle`をIndexedDBへ保存。
3.  **相対パス方式へ統一**
    -   DBには絶対パスを保存せず、`attachments/YYYY/MM/DD/<UUID>.<extension>`形式の相対パスを保存。
4.  **Local / Supabase互換レイヤーを構築**
    -   `storageType: "local" | "supabase"`を導入。
    -   旧データは`storageType ?? "supabase"`で互換性を維持。
5.  **共通Attachment Resolverを構築**
    -   SupabaseファイルはSigned URL。
    -   LocalファイルはBlob URL。
    -   UIが保存先を直接判定しない構造に変更。
6.  **Blob URLのライフサイクルを管理**
    -   `URL.createObjectURL()`でLocalファイルを表示。
    -   不要になったURLは`URL.revokeObjectURL()`で解放。
7.  **ゴミ箱と物理削除を分離**
    -   通常削除では添付ファイルを保持。
    -   ゴミ箱から完全削除した場合のみ実ファイルを削除。
8.  **削除処理をidempotent化**
    -   `NotFoundError`は「すでに削除済み」として成功扱いにした。
9.  **編集Transactionを実装**
    -   編集中に新規作成した添付ファイルを追跡。
    -   保存成功時は使用中のファイルを保持。
    -   保存前に外した新規ファイルは削除。
    -   キャンセル時はその編集で作成したファイルだけをrollback。
10. **IndexedDBをVersion 2へ更新**
    -   `handles` storeを維持。
    -   `pending-attachments` storeを追加。
11. **Persistent Pending Journalを構築**
    -   Localファイル作成直後にPending Recordを保存。
    -   正常保存・キャンセル・削除成功後にPendingを解除。
12. **F5・強制終了対策**
    -   Reactのメモリ状態だけに依存せず、IndexedDBで未確定ファイルを追跡。
13. **Crash Recoveryを実装**
    -   Pending attachmentを`shiori_items.attachments`と照合。
    -   DB参照あり → ファイル保持、Pending解除。
    -   DB参照なし → Localファイル削除、Pending解除。
    -   DB確認失敗 → 削除せずPending維持。
14. **ゴミ箱データもRecovery対象の参照として扱う**
    -   `is_deleted = true`でも復元可能なため、正常なattachment参照として扱う。
15. **Grace Periodを追加**
    -   作成直後のPendingファイルを誤削除しないよう、最近のRecordは一時的にRecovery対象外とした。
16. **Localフォルダ権限を検証**
    -   Directory Handleが残っていても権限が`prompt`になる場合を確認。
    -   `queryPermission()`と`requestPermission()`の役割を分離。
17. **RecoveryをFail-safe化**
    -   DBエラー・権限不足・削除失敗時はファイルとPendingを安全側に残す。
18. **自動Recoveryの実行位置を設計**
    -   `App.tsx`で無条件実行せず、認証完了後の`RequireAuthOutlet`内でBackground
        Recoveryを実行。

### ポイント

**Local-firstの本質は保存場所の変更ではなく、作成・保存・キャンセル・ゴミ箱・完全削除・F5・強制終了・復旧まで含めた添付ファイルのライフサイクルを安全に管理することである。**
