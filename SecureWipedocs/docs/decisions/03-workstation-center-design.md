# Decision Record — Workstation Center identifiers & permissions

Date: 2026-08-22
Decided by: Subhranil

Workstation Centers are addressed publicly (in API URLs, etc.) using a `centerId` — a UUID string — rather than MongoDB's internal `_id`. The `_id` is still used for actual database relationships, but nothing outside the backend should need to know about it.

Employee assignment allows multiple employees to be added to a center in a single request (via a list of employee IDs) rather than one call per employee. Admins can assign employees to any center; Workstation Heads can only assign within their own.
