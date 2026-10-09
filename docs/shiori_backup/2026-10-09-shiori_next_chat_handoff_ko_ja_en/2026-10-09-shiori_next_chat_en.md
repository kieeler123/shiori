# Shiori Development Handoff --- Prompt for a New Chat

> Copy the entire "Message to paste into a new chat" section into the
> first message of a new ChatGPT conversation. Share relevant source
> files only when needed.

------------------------------------------------------------------------

## Message to paste into a new chat

I am developing a personal web application called **Shiori** on Windows.
In my previous conversation, I incrementally migrated core article CRUD
and trash operations to Fastify APIs. I now want to continue **fully
separating the client and server, and eventually making Windows-hosted
local storage the primary datastore**, without breaking existing
features.

### 1. Project environment

-   Project directory: `H:\shiori`
-   Frontend: React 19, Vite 7, TypeScript
-   Backend: Fastify, TypeScript --- `H:\shiori\apps\api`
-   Current authentication: Supabase Auth with JWT Bearer tokens
-   Current primary database: Supabase PostgreSQL
-   Frontend hosting: Vercel
-   Local development: Vite `http://localhost:5173`; Fastify
    `http://127.0.0.1:3001`
-   Long-term architecture: React calls APIs only; Fastify owns database
    and file-storage operations; Windows-hosted PostgreSQL and local
    files become the primary storage.
-   Preserve the existing UI, authentication, data, and functionality as
    much as possible.

### 2. Important source files

-   `src/lib/supabaseClient.ts`: existing Supabase client
-   `src/lib/apiClient.ts`: `apiGet`, `apiPost`, `apiPatch`, etc.,
    attaching auth tokens
-   `src/features/shiori/repo/shioriRepo.ts`: article list, detail,
    create, update
-   Trash-related repository: soft delete, listing, restore, permanent
    deletion
-   `src/features/attachments/lib/deleteAttachment.ts`: deletion by
    storage type
-   `src/features/attachments/local/localAttachmentStore.ts`: browser
    File System Access API storage
-   `apps/api/src/modules/shiori/{routes,controller,service,repository,createSchema}.ts`:
    Fastify API
-   `apps/api/src/middleware/requireAuth.ts`: Supabase JWT verification

### 3. Implemented and observed in the previous conversation

-   `GET /api/logs`: list, sorting, pagination --- HTTP 200 observed
-   `GET /api/logs/:id`: detail endpoint and 404 handling implemented
-   `POST /api/logs`: real article creation --- HTTP 201 observed
-   `PATCH /api/logs/:id`: real article update --- HTTP 200 observed
-   `DELETE /api/logs/:id`: move to trash (soft delete) --- HTTP 204
    observed
-   `GET /api/logs/trash`: trash listing --- HTTP 200 observed
-   `DELETE /api/logs/:id/permanent`: permanent deletion of an entry
    without attachments --- HTTP 204 observed
-   For an entry with a local attachment, I confirmed that the file
    **remained on disk when moved to trash** and **disappeared from the
    Windows folder after permanent deletion from trash**.
-   Important qualification: Permanent deletion of entries with
    attachments still relies on the existing React/Supabase/browser
    filesystem path. Attachment cleanup is not yet fully owned by
    Fastify.

### 4. Technical details and cautions

-   Fastify repositories forward the authenticated user's JWT to
    Supabase, preserving RLS.
-   Reads use the `shiori_items_v` view; writes and updates use the
    `shiori_items` base table.
-   The view filters hidden/deleted entries and some short or invalid
    content, so a successful insert may not appear in the view.
-   `validateContentBlocks()` expects `ReferenceItem[]`. An earlier
    `unknown[]` input caused a TypeScript error; use proper Zod boundary
    validation and consistent types.
-   Local attachments are stored under relative paths such as
    `attachments/YYYY/MM/DD/UUID.ext`.
-   A folder accessible through the browser File System Access API is
    not automatically accessible to the Fastify server.
-   The current architecture cannot fully prevent users from deleting
    files directly in Windows Explorer. Missing-file detection and
    backup/recovery are needed.
-   The frontend still contains direct Supabase database calls. Check
    filename lookups, attachment-reference checks, and remaining
    trash/attachment functions.
-   **Important unfinished issue:** In one shared version of
    `shioriRepo.ts`, the non-local branch of `dbCreate()` still contains
    `throw new Error("Supabase 직접 저장 로직이 아직 복원되지 않았습니다.")`
    instead of restored persistence logic. Inspect the actual current
    file and fix this before production deployment.
-   A version of `dbGet()` calls Fastify unconditionally; check API base
    URL configuration in development and production.
-   Windows-hosted PostgreSQL is **not yet the primary database**.

### 5. Suggested priorities

1.  Create a safe Git checkpoint and inventory remaining direct frontend
    Supabase calls.
2.  Fix the production/non-local `dbCreate()` branch and API URL
    handling without breaking local behavior.
3.  Migrate direct database calls from the frontend to Fastify one
    feature at a time.
4.  Harden trash restore, permanent deletion, shared-attachment checks,
    missing-file detection, and failure recovery.
5.  Plan the Windows PostgreSQL migration while preserving
    authentication and authorization.
6.  Design server-managed local file storage and reliable backups.
7.  Establish a production deployment architecture in which the client
    knows only the API contract.

### 6. How I want you to help

-   **Respond in English.**
-   Do not rebuild working functionality unnecessarily. Prioritize
    existing code and data safety.
-   Work incrementally: **implement one step → run it → verify it**.
-   Give exact file paths, copyable code changes, expected HTTP
    responses, verification steps, and rollback instructions.
-   Do not invent unseen code or overwrite entire files based on
    assumptions; request the relevant file first.
-   Clearly distinguish verified functionality from plans or unverified
    assumptions.
-   Protect existing Supabase Auth, user-specific access controls, data,
    and attachments.

**For the first task, help me inventory remaining direct Supabase
database calls in the frontend and prioritize a safe migration sequence.
Ask for only one relevant file at a time.**

------------------------------------------------------------------------

**Tip:** After pasting this prompt, share only the first file needed for
the next step, such as `shioriRepo.ts`, `apiClient.ts`, or the trash
repository. Never paste JWTs or secret environment variables.
