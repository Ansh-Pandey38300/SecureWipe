# Decision Record — Role management rules

Date: 2026-08-21
Decided by: Subhranil

New users always default to CUSTOMER on registration. Changing a user's role is an Admin-only action, and even Admins can't assign the ADMIN role through the normal update API — that has to go through a separate admin-creation script. This keeps the "who can become an Admin" question out of the general-purpose API surface entirely, rather than relying on a permission check that could be misconfigured later.

Workstation Heads are pulled only from users who already hold the WORKSTATION_HEAD role and are active. The backend validates the selected head server-side rather than trusting whatever the frontend sends.
