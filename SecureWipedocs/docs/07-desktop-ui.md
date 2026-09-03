# Desktop App UI (Qt)

Built by Ansh Pandey, starting Aug 23. This is UI only — no backend connection yet.

## What happened
The first attempt at the Login/Dashboard layout used a stacked-widget approach in Qt Creator, which caused enough alignment and sizing headaches that it made more sense to restart than keep patching it. The UI was rebuilt with a simpler structure.

Once the layout was working, the app was built in Release mode and packaged into a portable Windows build using windeployqt, so it can run on another machine without needing Qt installed separately.

## Tested
The Release build compiles and the generated executable runs. The portable package was verified to include the required Qt runtime dependencies.

Added a Device Details page that reads real backend device data — model, serial number, capacity, interface, device path, media type, bus type, device type, system-disk status, and removable status — when a device is selected from the Devices table. Also added a "Back to Devices" nav, a refresh flow, and a basic Safety Status UI that currently just shows "Assessment Pending" rather than pretending a device is safe before it's actually checked.

Known issue (backend, not fixed today): device capacity currently displays as 0 B, and classification values shown may not be final. Worth flagging to Subhranil since this touches the storage/classification layer he's building.

## Employee Dashboard integration (added 31 Aug)
The Qt desktop app now authenticates as an employee and pulls that employee's assigned requests from the backend (GET /api/sanitization-requests/employee) using a Bearer token, and shows them in the existing "My Assigned Jobs" table. Dashboard counters (Total, Completed, Failed, In Progress) are now calculated from real backend data instead of being hardcoded — confirmed a FAILED request correctly bumps the Failed counter.

Backend code was not touched at all for this — purely a frontend integration. Network/API logic was kept in a separate SanitizationRequestService class rather than mixed into the main window code.

A role-mismatch bug came up: the API correctly returned 403 when logged in as a WORKSTATION_HEAD account (that endpoint is employee-only) — that's expected behavior, not a bug, just confirms the permission check works. Retesting with an actual employee account worked correctly.

## Request selection → Wipe workflow (added 2 Sep)
An employee can now select an assigned request directly from the Dashboard table, and that selection (request ID, device type, assigned sanitization method) carries over to the Wipe page. The "Start Sanitization" button only becomes enabled once both a request AND a physical device are selected — it can't be clicked prematurely.

A deliberate decision here: the sanitization method is whatever the backend assigned to the request — the desktop UI does not let the employee override it with a different method from a dropdown. The backend request is treated as the source of truth, not local UI choices.

This is UI wiring only — no actual sanitization runs yet. The next real step is confirming the selected request actually matches the selected physical device before anything destructive can happen.

## Not done yet
No backend integration at all — the UI exists but isn't wired up to the auth/backend APIs yet. That's the next big step once both sides are ready to connect.

## Evidence
Commit/PR:https://github.com/Subhranil123-ops/SecureWipe/pull/18
Screenshots: in screenshots section