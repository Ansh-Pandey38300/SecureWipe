# Sanitization Request Workflow

Status: Request creation, review, assignment, AND the employee-side status workflow (up through the API layer) are all implemented and tested. Actual sanitization execution, verification, and certificates are still not built.

## What exists
A customer can submit a sanitization request through the website (device info, capacity, method, etc.), which is now saved to MongoDB with status PENDING. Customers can see their own requests; Admins can see all requests.

The customer ID on a request is taken from the authenticated session, not trusted from whatever the frontend sends — this was a deliberate choice to prevent someone submitting a request under another customer's identity.

## The intended full pipeline (only step 1 exists)
Sanitization Request → Admin Approval → Workstation Assignment → IN_PROGRESS → Sanitization → COMPLETED → Verification → Certificate

## Not built yet
Actual sanitization execution, verification, and certificate generation. Also the Workstation Employee dashboard and the "Start Sanitization" action don't exist yet — that's next.

## Full workflow now working (added 28 Aug)
Customer creates request (PENDING) → Workstation Head reviews and approves or rejects it (APPROVED/REJECTED, with a reason recorded if rejected) → an employee and workstation get assigned to approved requests (ASSIGNED). Every status change is recorded with who did it and when (reviewedBy, reviewedAt, history), so the process is auditable.

New APIs: GET /api/sanitization-requests/head (Head's queue), GET /api/sanitization-requests/head/approved (ready for assignment), PATCH .../status (approve/reject), PATCH .../assign (assign employee + workstation), GET /api/workstation-centers/my.

Before assignment is allowed, the backend checks: the employee actually has an employee role, is active, and belongs to the right workstation center; and the workstation belongs to the right center, is active, and is available. None of this is trusted from the frontend.

A few bugs were fixed getting here: a missing function export was causing approvals to fail with a server error; submitting a request with no preferred date was also causing a server error, fixed by allowing that field to be empty; and the Workstation Head dashboard wasn't loading due to a broken function chain between frontend and backend, now fixed.

## Employee-side workflow (added 30 Aug)
Three new endpoints: one to find employees eligible for assignment to a center (active WORKSTATION_EMPLOYEE users not already assigned elsewhere), one for an employee to fetch their own assigned requests (identity comes from the JWT, never supplied manually), and a separate employee-only status endpoint that only allows: ASSIGNED → IN_PROGRESS → VERIFYING → COMPLETED, or VERIFYING → FAILED. The backend checks the employee owns the request and that the transition is actually legal — an employee can't skip stages or touch someone else's request.

A bug was found where completed/failed requests disappeared from the employee's request list because the query only showed active-stage requests — fixed by removing that filter so history stays visible.

## How Web/Backend and Desktop talk to each other
There is deliberately no direct Web Browser → Desktop connection. Everything flows through the backend: Web → Backend/Database → Desktop. The Desktop app fetches its own assigned requests from the backend rather than receiving anything pushed from the browser.

## Evidence
Screenshot:
Commit/PR: