# Shiori Development Log --- October 9, 2026

## Checklist / List Format

### Goals

-   Gradually migrate article CRUD from direct React/Supabase calls to
    Fastify APIs.
-   Preserve existing authentication, data, and UI while testing real
    workflows.
-   Clarify responsibilities for trash operations and attachment
    deletion.

### Work completed and verified

1.  **List (Read):** `GET /api/logs`, including pagination and sorting.
2.  **Detail (Read):** `GET /api/logs/:id`, with 404 handling for
    missing entries.
3.  **Create:** `POST /api/logs`, with a real successful creation and
    HTTP 201. Reviewed validation, duplicates, and view-filtered
    entries.
4.  **Update:** `PATCH /api/logs/:id`, with HTTP 200. Investigated the
    `unknown[]` versus `ReferenceItem[]` TypeScript mismatch.
5.  **Move to trash:** `DELETE /api/logs/:id`, with HTTP 204. Local
    attachments remain in place at this stage.
6.  **Trash listing:** `GET /api/logs/trash`, with HTTP 200.
7.  **Permanent deletion:** `DELETE /api/logs/:id/permanent`, with HTTP
    204 verified for an entry without attachments.
8.  **Entries with attachments:** Kept the existing React/Supabase
    deletion path. Confirmed that a Windows local attachment disappears
    after permanent deletion from trash.
9.  **Local file architecture:** Inspected the File System Access API
    implementation, which uses relative paths such as
    `attachments/YYYY/MM/DD/UUID.ext`.
10. **External deletion risk:** Identified that the current
    browser-based approach cannot fully prevent users from deleting
    files in Windows Explorer.

### Observed HTTP responses

  ----------------------------------------------------------------------------------
  Operation               Endpoint                           Observed
  ----------------------- ---------------------------------- -----------------------
  List                    `GET /api/logs`                    200

  Create                  `POST /api/logs`                   201

  Update                  `PATCH /api/logs/:id`              200

  Move to trash           `DELETE /api/logs/:id`             204

  Trash list              `GET /api/logs/trash`              200

  Permanent deletion      `DELETE /api/logs/:id/permanent`   204
  without attachments                                        
  ----------------------------------------------------------------------------------

### Remaining work

-   Remove remaining direct database access from the frontend.
-   Deploy/configure Fastify for production.
-   Restore the non-local `dbCreate()` persistence branch or migrate
    production to the API.
-   Safely coordinate local and Supabase Storage attachment deletion.
-   Add shared-file reference checks, retryable cleanup, missing-file
    detection, and versioned backups.
-   Migrate the primary PostgreSQL datastore to Windows, with integrity
    and permission checks.

### Next steps

1.  Preserve the working state in Git.
2.  Standardize API contracts and error handling.
3.  Replace direct frontend database access feature by feature.
4.  Harden attachment management and permanent deletion.
5.  Prepare Windows-hosted Fastify/PostgreSQL and validate data
    migration.
6.  Make the client depend on API contracts while the server owns
    persistence details.

**Tip:** Distinguish observed success from planned or unverified
functionality to avoid false confidence during the next migration stage.
