# Decision Record — Request lifecycle & authorization rules

Date: 2026-08-28
Decided by: Vishal

Request status can only move through controlled transitions (PENDING → APPROVED/REJECTED → ASSIGNED) rather than being changeable to anything at any time. Every review/assignment action is recorded with who did it and when, so the history is auditable rather than just showing the current state.

All the actual permission checks (who can approve, who can be assigned, which workstation is valid) are enforced on the backend, not just hidden in the frontend UI.

The web request lifecycle is being kept deliberately separate from the desktop sanitization engine — this app manages the request/approval/assignment process, but does not touch the actual disk. Desktop execution, verification, evidence, and certificates are a future integration point, not part of this module.
