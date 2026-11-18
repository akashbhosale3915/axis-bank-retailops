# Axis Bank RetailOps – GRAP: SOP Management (POC)

Interactive frontend proof of concept for **Axis Bank RetailOps – GRAP SOP Management**, built with React, TypeScript, and Tailwind CSS using Axis Bank's corporate design language (`#97144D` Burgundy, `#ED1164` Accent, `#F9EFF3` Rose Tint, and `Lato` + tabular typography).

## Quick Start

```bash
npm install
npm run dev
```

Run automated workflow unit tests:

```bash
npx tsx --test src/utils/sopRules.test.ts
```

Build for production:

```bash
npm run build
```

## Implemented Functional Areas

1. **Corporate SSO Sign-In & Role-Based Access (`SsoLoginScreen`, `AccessDeniedScreen`)**
   - Simulates Axis Bank Corporate SSO with three personas:
     - **Ananya Sharma (`Maker`)** — Creates, edits, and submits SOPs.
     - **Rajeshwari Iyer (`Reviewer`)** — Creates own SOPs and reviews peer submissions in `For My Review` (strictly excludes self-authored SOPs).
     - **Vikram Deshmukh (`Unassigned User`)** — Displays the `"Access not assigned"` entitlement screen with Axis ServiceDesk (ITSM) provisioning instructions.
   - Use **Sign Out** in the top header to switch between SSO personas.

2. **SOP Dashboard (`SopListingScreen`)**
   - Role-based tabs: `My SOPs` (Maker & Reviewer) and `For My Review` (Reviewer only).
   - Real-time search by SOP ID or Name, paired with Category, Sub-category, Status, and Date Range (`From` – `To`) filters + `Clear Filters`.
   - Desktop 10-column governance table and responsive mobile cards with status badges (`Draft`, `Submitted`, `Requested Modification`, `Modification In Progress`, `Resubmitted`, `Approved`, `Rejected`) and strict role/status row actions (`View`, `Activity`, `Edit`, `Make changes`, `Review`).

3. **Add / Edit SOP (`SopFormScreen`)**
   - Drag-and-drop / file picker restricted to `.doc`, `.docx`, `.pdf` with immediate inline validation.
   - Live embedded document preview (`<iframe>` PDF Blob preview and structured Axis SOP Word document viewer).
   - Mandatory metadata fields, read-only system version indicator (`v1 → v2` on resubmission), `Save Draft` / `Save Progress`, `Save & Submit`, and `Cancel`.
   - Displays Reviewer Modification Remarks banner when editing an SOP in `Modification In Progress`.

4. **Review SOP (`SopReviewScreen`)**
   - 60/40 split-pane layout with full-height embedded document preview alongside submission metadata and decision controls.
   - `Approve`, `Request Modification`, and `Reject` actions with mandatory remarks enforcement on Request Modification & Reject and confirmation dialogs for Approve & Reject.
   - Direct `View Activity` button to inspect prior audit history while reviewing.

5. **SOP Activity Sidebar Drawer (`SopActivityDrawer`)**
   - Opens as a contextual right-side slide-over drawer from any table row, Read-Only View modal, or Review screen—preserving current dashboard filters and scroll position.
   - Displays newest-first audit timeline with action badges, file version badges (`v1`, `v1 → v2`), timestamps, actor identity, `Before → After` status transitions, and remarks.

## Key Improvements & Simulated Interactions

- **UX Improvements**: Replaced full-page activity navigation with a contextual slide-over **SOP Activity Sidebar Drawer**; added mobile-responsive card layouts and slide-down header menu; added client-side pagination (5/10/25/50 rows per page); added a `Reset Demo Data` button to restore all 18 seeded Axis Bank RetailOps SOPs anytime; added inline live PDF Blob previewing and structured Word previewing.
- **Simulated vs. Persisted Client State**:
  - **Bank SSO & RBAC**: Simulated via persona selection on the SSO Login screen; active user persists in `localStorage`.
  - **Database / Storage**: All SOP records, uploaded attachments (Data URLs), and activity logs persist locally in browser `localStorage`.
  - **Word Document Rendering & Knowledge Base Publish**: `.pdf` uploads render natively in an `<iframe>`, while `.doc`/`.docx` files render a structured Axis Bank SOP preview card with download support; publishing to the live GRAP Knowledge Base on approval is simulated via status transition and toast confirmation.
