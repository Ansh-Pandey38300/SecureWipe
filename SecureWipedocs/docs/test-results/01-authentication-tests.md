# Test Log — Authentication Module

| Test ID | What was tested | Steps | Expected result | Actual result | Pass/Fail | Evidence file | Date | Tester |
|---|---|---|---|---|---|---|---|---|
| T-01 | User registration | Submit new user credentials | User created, password hashed | User created successfully | Pass | SS-AUTH-01-registration-login-success.png | 2026-08-20 | Subhranil |
| T-02 | Login + JWT generation | Submit valid credentials | JWT returned, signed RS256 | JWT returned correctly | Pass | SS-AUTH-02-jwt-token.png | 2026-08-20 | Subhranil |
| T-03 | JWT verification | Send request with valid JWT | Token verified, request allowed | Verified correctly | Pass | SS-AUTH-01-registration-login-success.png | 2026-08-20 | Subhranil |
| T-04 | Protected route access | Call `/me` with Bearer token | Current user returned | Correct user returned | Pass | SS-AUTH-01-registration-login-success.png | 2026-08-20 | Subhranil |
| T-05 | RBAC — CUSTOMER role | Access role-based test route as CUSTOMER | Access follows role rule | Behaved as expected | Pass | SS-AUTH-03-rbac-403-blocked.png | 2026-08-20 | Subhranil |
| T-06 | RBAC — unauthorized role | Access a route without permission | 403 returned | 403 returned correctly | Pass | SS-AUTH-03-rbac-403-blocked.png | 2026-08-20 | Subhranil |

PR- https://github.com/Subhranil123-ops/SecureWipe/pull/2
Notes:
- All 6 tests passed with evidence provided by developer.
- No failures or bugs reported for this module yet.
