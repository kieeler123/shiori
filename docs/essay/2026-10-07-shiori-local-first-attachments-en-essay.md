# Building a Local-first Attachment Architecture for Shiori

Today I redesigned Shiori's attachment storage architecture around a
Local-first model. The goal was to reduce long-term dependence on
Supabase Storage while continuing to use Supabase for authentication,
database operations, metadata, and compatibility with existing cloud
attachments.

Because browsers cannot freely write to arbitrary filesystem paths, I
used the File System Access API and required the user to explicitly
select a storage directory. The resulting `FileSystemDirectoryHandle` is
persisted in IndexedDB, while attachment metadata stores only relative
paths such as `attachments/YYYY/MM/DD/...`.

Backward compatibility was essential. Instead of migrating every
existing Supabase attachment, I introduced a storage abstraction that
supports both Local and Supabase attachments. New Local attachments use
`storageType: "local"`, while legacy records without `storageType` are
interpreted as Supabase attachments. A common resolver provides Signed
URLs for Supabase files and Blob URLs for Local files, allowing the UI
to remain independent of the physical storage location.

The next challenge was the attachment lifecycle. Moving a log to Trash
must not physically delete its attachments because the log may later be
restored. Physical deletion therefore happens only during permanent
deletion. During editing, newly created files are tracked so that Save,
Cancel, and attachment removal leave the correct files on disk.

Refreshes and browser crashes introduced another reliability problem.
React state and refs exist only in memory, so a Local file could remain
on disk after the editor state disappears. To solve this, I upgraded the
IndexedDB schema to version 2 and added a `pending-attachments` object
store. Newly created Local attachments are recorded in a persistent
Pending Journal and removed from that journal after a successful commit
or rollback.

Recovery is intentionally conservative. A Pending Record does not
automatically mean that a file is orphaned because the database commit
may have succeeded immediately before the browser terminated. Recovery
first checks `shiori_items.attachments`. Referenced files are preserved,
while only confirmed unreferenced Local files are deleted. If database
verification fails or local filesystem permission is unavailable, the
file and Pending Record remain untouched for a later retry.

Logs in Trash are also treated as valid references because they can be
restored. In addition, `NotFoundError` is treated as a successful
deletion state when a file has already disappeared, making cleanup
idempotent and safe to retry. A grace period protects recently created
Pending files from premature cleanup.

Finally, automatic Recovery is designed to run only after
authentication, inside `RequireAuthOutlet`, and as a non-blocking
background maintenance task. Recovery failures therefore do not prevent
the application from rendering.

The most important result of today's work is not simply that Shiori can
save files locally. The system now manages the complete attachment
lifecycle---from creation and commit to rollback, Trash, permanent
deletion, refresh, crash, and recovery. Local-first is therefore not
just a storage location choice; it is an architecture for safely owning
a file throughout its entire lifetime.
