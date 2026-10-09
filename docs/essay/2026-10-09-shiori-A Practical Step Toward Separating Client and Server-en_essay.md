# Shiori Development Journal --- October 9, 2026

## A Practical Step Toward Separating Client and Server

Today's Shiori work focused on gradually moving article-management
responsibilities from the React client to a Fastify backend. The goal
was not simply to add HTTP endpoints. It was to establish clearer
boundaries while preserving the existing interface, Supabase
authentication, and accumulated data.

The first steps involved routing list and detail reads through the API.
Pagination and sorting remained part of the list workflow. A real
article creation through `POST /api/logs` returned HTTP 201, while an
update through `PATCH /api/logs/:id` returned 200. We also examined
input validation, duplicate detection, and the possibility that a newly
saved entry might be excluded by the database view's visibility rules.
During the update work, a mismatch between `unknown[]` and
`ReferenceItem[]` highlighted the importance of validating input at API
boundaries.

Deletion required more care than a simple CRUD checklist suggests. In
Shiori, ordinary deletion means moving an entry to trash, not destroying
it immediately. The soft-delete endpoint `DELETE /api/logs/:id` returned
204, and `GET /api/logs/trash` returned 200. The permanent-delete
endpoint also returned 204 when tested with an entry that had no
attachments.

One of the most useful observations came from the Windows filesystem.
Shiori stores local attachments in a folder connected through the
browser's File System Access API. In the actual test, the file remained
in place after its entry moved to trash and disappeared only after
permanent deletion from trash. That matches the intended behavior:
preserve files while recovery is possible, then clean them up during
final deletion. However, entries with attachments still rely on the
existing React/Supabase deletion path, so this responsibility has not
yet moved entirely to Fastify.

The test also raised a broader reliability question. What happens if
someone deletes an attachment directly through Windows Explorer? The
current browser-based storage model cannot reliably prevent that action.
Missing-file detection, relinking, versioned backups, shared-reference
checks, and retryable cleanup are therefore important future safeguards.
Another concern is partial failure: a file may be removed successfully
while the database deletion fails.

The day's achievement was not complete separation. It was a set of
verified boundaries. Core CRUD and trash API calls were exercised, local
attachment deletion timing was observed, and the remaining architectural
gaps became more concrete. The frontend still contains direct Supabase
calls, Fastify still persists data in Supabase PostgreSQL, and
Windows-hosted PostgreSQL is not yet the primary datastore.

The next phase should begin with a safe Git checkpoint. From there,
direct database calls can be removed from the frontend one feature at a
time. Attachment lifecycle management and failure recovery should be
strengthened before migrating the primary database and server-managed
files to Windows. The long-term goal is a Shiori client that depends
only on API contracts, while the server takes responsibility for data
and storage details.

**Today's tip:** Large architectural changes are safer when each working
boundary is verified before the next one is moved.
