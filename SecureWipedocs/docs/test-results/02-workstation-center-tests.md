# Test Log — Workstation Center & Admin User Management

Admin creation, Admin login, and role update all passed cleanly. Workstation Center creation initially failed with a duplicate-key error from a stale MongoDB index — fixed on Aug 22, retested and passing since. Bulk employee assignment was implemented and later confirmed passing after endpoint testing.

Role-based Workstation Center access, duplicate-employee-assignment rejection, and Workstation Head's own-center restriction were all tested by the developer, but pass/fail wasn't explicitly stated in the report — worth confirming directly before treating these as verified.

Evidence(for admin):SS-AUTH-04-admin-login.png
Screenshot (role update):SS-AUTH-05-role-update.png
Screenshot (eligible heads lookup):SS-AUTH-06-eligible-heads.png
