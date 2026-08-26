# Decision Record — Frontend architecture

Date: 2026-08-23
Decided by: Vishal

The frontend follows a fairly standard layered structure: Pages → Reusable Components → Services/API → AuthContext, rather than putting logic directly inside page components. Role-based routing means each user type only has access to its own section of the app. A shared Dashboard Layout, Sidebar, and UI kit are reused across all the different role-specific dashboards instead of each one building its own.

Authentication state is centralized in AuthContext, with the JWT stored in localStorage and automatically restored when the app reloads.
