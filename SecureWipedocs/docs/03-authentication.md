# Authentication & Authorization Module

## 1. Purpose
Handles user registration, login, identity verification, and role-based access
control (RBAC) for the SecureWipe backend.

## 2. Current Status
- Implemented: [x]
- Tested: [x]
- In Progress: [ ]
- Planned: [ ]

## 3. What the Module Does
Provides user registration and login, issues signed JWTs for authenticated
sessions, verifies those tokens on protected routes, retrieves the current
user from the database using the token's `sub` claim, and enforces
role-based permissions (ADMIN, WORKSTATION_HEAD, WORKSTATION_EMPLOYEE,
CUSTOMER) on protected endpoints.

## 4. Inputs
- Registration: user credentials (submitted via request body, validated with Joi)
- Login: user credentials
- Protected requests: JWT sent as a Bearer token in the Authorization header

## 5. Processing / Workflow
1. User registers → password hashed with Argon2 → user stored in MongoDB
2. User logs in → credentials verified → JWT issued, signed with RS256 using
   an RSA private key
3. Client sends JWT as Bearer token on subsequent requests
4. Authentication middleware verifies the JWT signature (RSA public key),
   checks expiry, issuer, and audience
5. Current user is fetched from MongoDB using the JWT's `sub` claim
6. RBAC middleware checks the user's role against the route's required role(s)
7. Request is allowed or rejected (403) based on role

## 6. Outputs
- Signed JWT (RS256) on successful login
- 200 + user data on authorized requests
- 403 on role-unauthorized requests

## 7. Architecture / Components
| Piece | Choice |
|---|---|
| Password hashing | Argon2 |
| Token type | JWT, RS256 (asymmetric — RSA private/public key pair) |
| Token validation | expiry, issuer, audience checked |
| Request validation | Joi |
| Persistence | MongoDB / Mongoose |
| Roles | ADMIN, WORKSTATION_HEAD, WORKSTATION_EMPLOYEE, CUSTOMER |
| Protected routes | `/me` (returns current user), plus a role-based test route |

## 8. Error and Failure Handling
- Unauthorized role access correctly rejected with HTTP 403 (confirmed by test)

## 9. Integration With Other Modules
- Any future protected route (Job Management, Workstation Management, Certificate
  Management, etc.) will sit behind this same authentication + RBAC middleware.

## 10. Testing
All manually tested by developer (Subhranil) on Aug 20, 2026 — all passed:
- [x] Registration
- [x] Login + JWT generation
- [x] JWT verification
- [x] Protected route access using Bearer token
- [x] Current user retrieval via `/me`
- [x] RBAC behavior tested with CUSTOMER role
- [x] Unauthorized role access correctly rejected (403)

## 11. Evidence
- `SS-AUTH-01-registration-login-success.png` — successful registration/login
- `SS-AUTH-02-jwt-token.png` — JWT token shown after login
- `SS-AUTH-03-rbac-403-blocked.png` — unauthorized role correctly blocked (403)
- Commit/PR: https://github.com/Subhranil123-ops/SecureWipe/pull/2

## 12. Limitations
- RBAC rules are not yet applied across all SecureWipe features — only a
  demo/test route and `/me` are protected so far
- No rate limiting or additional security hardening yet
- No refresh-token/session strategy yet

## 13. Known Issues
None reported.

## 14. Remaining Work
- Apply RBAC rules across all remaining features/routes
- Add rate limiting and further security hardening
- Design and implement refresh-token/session strategy
- Additional validation/security optimizations

## 15. Future Work
Same as remaining work above — no separate future scope stated yet.

## 16. Related Files / Modules
- Will connect to: Job Management, Workstation Management, Certificate Management
  (once those modules are built)

## 17. Last Verified
- Date: 2026-08-20
- Commit/PR: https://github.com/Subhranil123-ops/SecureWipe/pull/2
- Reviewer: Parth goel
