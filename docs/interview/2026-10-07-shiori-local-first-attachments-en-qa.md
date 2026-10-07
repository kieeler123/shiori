# Shiori Local-first Attachment Storage

## Q&A Format

### Q1. Why move to Local-first storage?

**A.** To reduce long-term Supabase Storage usage while continuing to
use Supabase for authentication, database operations, and metadata.

### Q2. Can the browser freely write to any local path?

**A.** No. The File System Access API requires the user to explicitly
select and authorize a directory.

### Q3. Why persist the directory handle in IndexedDB?

**A.** To remember the selected directory across reloads. The stored
handle and the current permission state must still be treated
separately.

### Q4. What happens to existing Supabase attachments?

**A.** They remain supported. Legacy attachments without `storageType`
are interpreted using `attachment.storageType ?? "supabase"`.

### Q5. How are Local files displayed?

**A.** The app reads a `File`, creates a Blob URL using
`URL.createObjectURL()`, and revokes it when no longer needed.

### Q6. Are files deleted when a log moves to Trash?

**A.** No. They are preserved for restoration. Physical deletion occurs
only during permanent deletion.

### Q7. What happens when editing is cancelled?

**A.** Only files newly created during that editing session are rolled
back. Existing attachments remain untouched.

### Q8. Why is a Pending Journal necessary?

**A.** React state and refs disappear after a refresh or browser crash.
IndexedDB provides persistent transaction metadata.

### Q9. Does a Pending Record always mean an orphan file?

**A.** No. The database commit may have succeeded just before the
browser terminated. Pending means "needs verification," not "delete this
file."

### Q10. How does Recovery decide what to delete?

**A.** It checks `shiori_items.attachments`. Referenced files are
preserved; only confirmed unreferenced files are deleted.

### Q11. What if the database check fails?

**A.** Nothing is deleted. "Unable to verify" must never be treated as
"not referenced."

### Q12. Why are logs in Trash included in reference checks?

**A.** Because they can be restored and therefore still legitimately own
their attachments.

### Q13. Why is `NotFoundError` treated as success?

**A.** If the file is already gone, the desired deletion state has
already been reached. This makes cleanup idempotent.

### Q14. Why add a grace period?

**A.** To prevent Recovery from deleting a newly created Pending file
that may still be actively edited in another tab or session.

### Q15. Why not run automatic Recovery directly from `App.tsx`?

**A.** Recovery depends on authenticated database access. Running it
after authentication inside `RequireAuthOutlet` is safer.

### Conclusion

**The primary Recovery rule is: when uncertain, preserve the file and
retry later.**
