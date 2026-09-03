# Decision Record — Employee workflow & Web/Desktop separation

Date: 2026-08-30
Decided by: Vishal

A separate employee-only status endpoint was built instead of extending the existing Workstation Head status endpoint, to avoid breaking the already-working Head workflow and to keep the two roles' permissions and allowed transitions cleanly separate.

There's no direct Web-to-Desktop communication. The Desktop app is treated as just another authenticated client of the same backend APIs — it fetches assigned work and reports status changes the same way the web app does, nothing browser-specific.
