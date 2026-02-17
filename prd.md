# PRD — Simple, Interactive CRUD App

## Summary
Build a **simple yet interactive CRUD web app** that lets users manage a list of items (create, view, update, delete) with modern UX (search, sort, validation, toasts, fast interactions).

## Assumptions (explicit)
- **Platform**: Web app (desktop + mobile responsive).
- **Data**: One primary entity (e.g., “Tasks”, “Contacts”, “Products”) with common fields.
- **Auth**: Not required for v1 (single-user / open app). Add later if needed.
- **Deployment**: Local dev first; optional deploy to a free host later.
- **Default reference stack (optional)**: React (or similar) + Node/Express (or similar) + SQLite (or similar). This PRD is stack-agnostic.

## Goals
- **Core CRUD** works reliably end-to-end (UI ↔ API ↔ persistence).
- **Interactive UX**: fast feedback, inline actions, modals/drawers, loading states, empty states.
- **Data quality**: validation, error handling, and consistent formatting.
- **Maintainable**: clear layering (UI, API, data), predictable state management, documented endpoints.

## Non-Goals (v1)
- Multi-tenant accounts, advanced permissions, payments.
- Complex workflows (approvals, audit trails) beyond basic timestamps.
- Real-time multi-user collaboration (WebSockets) in v1.

## Users & Use Cases
- **Primary user**: Someone who wants to track/manage a list quickly.
- **Top tasks**:
  - Add a new item in seconds.
  - Find items quickly using search and filters.
  - Edit item details without losing context.
  - Delete items with confirmation and undo (optional).

## Success Metrics
- **Functional**: 100% of CRUD flows pass acceptance criteria.
- **UX**: Create/edit/delete completes in < 3 seconds typical, with clear feedback.
- **Quality**: No uncaught runtime errors in normal usage; graceful error states.

## Scope: Core Features (v1)

### 1) List & Read
- View a list/table of items.
- Item row shows key fields (e.g., name, status, updatedAt).
- Click row (or “View”) to open a **detail view** (modal/page).
- **Empty state** when no items exist, with CTA to create one.

### 2) Create
- “Add item” button opens a **modal/drawer** form.
- Client-side validation + server-side validation.
- On success: close form, show toast, new item appears in list.

### 3) Update
- Edit from detail view or inline edit for 1–2 fields (interactive).
- Save shows loading indicator; success toast.
- Form preserves user input on error (do not wipe fields).

### 4) Delete
- Delete available from row actions and/or detail view.
- Confirmation dialog (“Delete item?”).
- On success: item removed from list; toast.
- Optional: “Undo” within 5 seconds (nice-to-have).

### 5) Search, Sort, Pagination (simple but useful)
- **Search**: text search by key fields (e.g., name).
- **Sort**: by name, createdAt, updatedAt (toggle asc/desc).
- **Pagination**: server-side or client-side; default page size 10–20.

### 6) Feedback & States
- Loading: skeletons/spinners for list and detail.
- Error: inline error banners with retry.
- Optimistic UI (optional): immediate row updates with rollback on failure.

## Entity Definition (v1)
Pick one entity name for implementation (examples below use `Item`).

### Item fields
- **id**: string/uuid (primary key)
- **title**: string (required, 2–80 chars)
- **description**: string (optional, 0–500 chars)
- **status**: enum (`active` | `inactive`) or (`todo` | `doing` | `done`)
- **createdAt**: datetime (server-generated)
- **updatedAt**: datetime (server-generated)

### Validation rules
- `title` required, trimmed, length limits.
- `description` optional with max length.
- `status` must be one of allowed values.

## API Requirements (v1)
Base URL example: `/api`

### Endpoints
- **GET** `/items`
  - Query params: `q` (search), `sortBy`, `sortDir`, `page`, `pageSize`
  - Response: `{ data: Item[], meta: { page, pageSize, total } }`
- **GET** `/items/:id`
  - Response: `{ data: Item }`
- **POST** `/items`
  - Body: `{ title, description?, status? }`
  - Response: `{ data: Item }` (201)
- **PUT** `/items/:id` (or PATCH)
  - Body: `{ title?, description?, status? }`
  - Response: `{ data: Item }`
- **DELETE** `/items/:id`
  - Response: 204 or `{ ok: true }`

### Error handling (contract)
- Validation errors: 400 with `{ error: { code: "VALIDATION_ERROR", message, fields? } }`
- Not found: 404 with `{ error: { code: "NOT_FOUND", message } }`
- Server error: 500 with `{ error: { code: "INTERNAL", message } }`

## UI/UX Requirements (v1)

### Screens
- **Items List**
  - Header + “Add item” button
  - Search input (debounced)
  - Sort controls (table headers or dropdown)
  - List/table with row actions (View/Edit/Delete)
  - Pagination controls
- **Item Detail**
  - Read-only fields + “Edit” button (or editable form)
  - Delete action with confirmation

### Interaction details (what makes it “interactive”)
- Create/edit in **modal/drawer** (stay on list page).
- Row actions appear on hover or via “⋯” menu.
- Toast notifications for success/failure.
- Keyboard: `Enter` submits form, `Esc` closes modal.
- Focus management: focus first input on open; return focus to trigger on close.

### Accessibility
- Proper labels for inputs, buttons, dialogs.
- Dialogs are accessible (role, aria attributes, focus trap).
- Color contrast meets WCAG AA where feasible.
- All actions are keyboard usable.

### Responsive behavior
- Mobile: switch table to card list; actions in a menu.
- Modals become full-screen on small screens if needed.

## Data Storage (v1)
- Persistent storage required (SQLite/Postgres/Mongo/etc.).
- Migrations/schema tracked in repo.
- Seed data optional for demo.

## Security & Privacy (v1)
- Input validation on server.
- Protect against common issues (SQL injection via parameterized queries, XSS via escaping).
- Rate limiting optional; basic request size limits recommended.
- If no auth in v1: clearly label as local/demo app.

## Observability
- Client: log unexpected errors; show friendly error UI.
- Server: request logging; structured errors with correlation id (optional).

## Acceptance Criteria (v1)
- **Create**: User can add an item; it persists after refresh.
- **Read**: List loads from persistence; detail view shows correct item.
- **Update**: User can edit title/status; list and detail reflect changes.
- **Delete**: User can delete an item after confirming; it disappears and stays gone after refresh.
- **Search/Sort/Pagination**: Work as specified; no broken states when combining them.
- **Validation**: Invalid inputs show clear messages and are blocked.
- **Error states**: API failure shows a non-crashing error UI and allows retry.
- **Responsive**: Usable on narrow screens; no critical UI overflow.
- **Accessibility basics**: Forms and dialogs usable by keyboard and screen readers at a basic level.

## Out of Scope (explicit)
- User login, roles, sharing.
- File uploads.
- Complex filtering (multi-field advanced queries) beyond basic `q`.

## Milestones (suggested)
- **M1: Skeleton**: project setup, basic layout, routing, mock data.
- **M2: CRUD API**: persistence + endpoints + validation.
- **M3: CRUD UI**: list + create/edit/delete flows + loading/error states.
- **M4: Polish**: search/sort/pagination, accessibility, responsiveness, toasts.
- **M5: Hardening**: tests, edge cases, deploy docs.

## Testing Plan (v1)
- **Unit**: validation helpers, API handlers/services.
- **Integration**: API endpoints against test DB.
- **E2E (happy paths)**: create → edit → search → delete.
- **Manual checklist**: keyboard navigation, mobile layout, error simulation.

## Open Questions (optional for later)
- Exact entity name and fields (Tasks vs Contacts vs Products).
- Should v1 support “undo delete”?
- Should pagination be server-side (for scalability) or client-side (simpler)?

