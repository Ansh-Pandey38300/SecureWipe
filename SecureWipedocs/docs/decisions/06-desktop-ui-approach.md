# Decision Record — Desktop UI layout approach

Date: 2026-08-23
Decided by: Ansh Pandey

Dropped the stacked-widget approach to the Login/Dashboard layout in Qt after it caused persistent sizing and alignment issues, and rebuilt the UI structure from scratch with something simpler. No specific alternative pattern documented yet beyond "not stacked widgets" — worth asking Ansh to note what he switched to, for future reference.

Device Details was built as its own separate Qt page rather than extending an existing dialog. Safety status is deliberately shown as "Assessment Pending" instead of defaulting to looking safe — future sanitization actions should depend on real SafetyEngine results, not a frontend assumption. Backend/device-discovery code was intentionally left untouched during this UI work.

The assigned backend request is the single source of truth for what gets sanitized and how — the desktop UI does not independently choose or override a sanitization method. IN_PROGRESS status is only sent right before actual sanitization starts, never just from selecting a request. Full intended flow: Assigned Request → Select Request → Select Physical Device → Validate Match → Safety Check → IN_PROGRESS → Sanitization → VERIFYING → Verification → COMPLETED/FAILED.
