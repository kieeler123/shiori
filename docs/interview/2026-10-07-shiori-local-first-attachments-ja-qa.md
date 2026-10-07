# Shiori Local-first Attachment Storage

## 質問・回答形式

### Q1. なぜLocal-firstへ変更したのか？

**A.** 添付ファイル増加によるSupabase
Storage使用量を抑えながら、Supabaseの認証・DB機能は継続利用するためである。

### Q2. ブラウザから任意のローカルパスへ直接保存できるのか？

**A.** できない。File System Access
APIを利用し、ユーザーが明示的に選択して権限を与えたフォルダだけを操作する。

### Q3. なぜDirectory HandleをIndexedDBへ保存するのか？

**A.**
再読み込み後も選択したフォルダを復元するため。ただしHandleの保存とアクセス権限の維持は別問題である。

### Q4. 古いSupabase添付ファイルはどう扱うのか？

**A.**
そのまま互換性を維持する。`storageType`がない旧データは`attachment.storageType ?? "supabase"`として扱う。

### Q5. Localファイルはどう表示するのか？

**A.** File System Access
APIで`File`を読み、`URL.createObjectURL()`でBlob
URLを作る。不要になったら`URL.revokeObjectURL()`で解放する。

### Q6. ログを削除すると添付ファイルも削除されるのか？

**A.**
通常削除では削除しない。ゴミ箱から復元できるよう保持し、完全削除時のみ実ファイルを削除する。

### Q7. 編集をキャンセルした場合は？

**A.**
その編集セッションで新しく作成したファイルだけを削除し、既存添付ファイルは保持する。

### Q8. なぜPending Journalが必要なのか？

**A.**
Reactのstateや`useRef`はF5やブラウザ終了で消えるため、IndexedDBにPersistent
Journalを残して未処理ファイルを追跡する必要がある。

### Q9. Pendingなら必ず孤立ファイルなのか？

**A.**
いいえ。DB保存成功直後、Pending解除前にブラウザが終了する可能性がある。Pendingは削除対象ではなく「状態確認対象」である。

### Q10. Recoveryはどう判定するのか？

**A.**
`shiori_items.attachments`を確認し、DB参照があればファイルを保持し、参照がない場合のみ削除する。

### Q11. DB確認に失敗した場合は？

**A.**
ファイルを削除しない。「確認できない」と「参照がない」を同じ意味として扱わない。

### Q12. なぜゴミ箱のログも参照確認に含めるのか？

**A.**
ゴミ箱のログは復元可能であり、添付ファイルをまだ正常に所有しているため。

### Q13. なぜ`NotFoundError`を成功扱いにするのか？

**A.**
ファイルがすでに存在しないなら削除という最終状態は達成済みであり、処理をidempotentにできるため。

### Q14. Grace Periodはなぜ必要なのか？

**A.**
作成直後で編集中のPendingファイルをRecoveryが誤って削除することを防ぐため。

### Q15. 自動Recoveryを`App.tsx`で直接実行しない理由は？

**A.**
認証復元前にDB参照確認が走ることを避けるため。認証完了後の`RequireAuthOutlet`内でBackground処理として実行する。

### 結論

**Recoveryの最重要原則は、判断できない場合は削除せず、後で再試行することである。**
