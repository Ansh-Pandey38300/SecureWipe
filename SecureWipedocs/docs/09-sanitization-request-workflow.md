# Sanitization Request Workflow

Status: Request creation, Workstation Head review (approve/reject), and employee+workstation assignment are all implemented and tested. Only actual sanitization execution onward remains.

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

## Evidence
Screenshot:
Commit/PR: