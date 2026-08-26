# SecureWipe
> Secure data sanitization platform — request, track, and verify secure wipes of physical storage devices, with a certificate anyone can check.

This README reflects what's actually built and tested as of 25 Aug 2026. Anything not listed here either doesn't exist yet or hasn't been verified — see the Roadmap section for what's coming.

## What it does
Customers submit a device for sanitization through the website. A sanitization center processes the request on a trusted workstation running the SecureWipe desktop app, which detects the physical device, wipes it using an appropriate method, verifies the result, and generates a certificate. Anyone — including a future buyer of the device — can independently verify that certificate.

## Who it's for
- Individuals selling or disposing of an old laptop/drive
- Companies decommissioning hardware at scale
- Sanitization centers operating the actual wipe process
- Buyers who want to verify a device was properly sanitized

## What's built and tested so far

**Backend**
- User registration/login, JWT authentication (RS256, RSA key pair), Argon2 password hashing
- Role-based access control (ADMIN, WORKSTATION_HEAD, WORKSTATION_EMPLOYEE, CUSTOMER)
- Admin user management — list users, update roles (Admin-only)
- Workstation Center creation and bulk employee assignment
- Automated auth test suite (Jest + Supertest)

See: [docs/03-authentication.md](docs/03-authentication.md), [docs/04-workstation-management.md](docs/04-workstation-management.md)

**Frontend (web)**
- Role-based dashboards for Admin, Workstation Head, and Customer
- Customer sanitization request form with full validation (currently using a mock backend response — real API integration is pending)

See: [docs/06-frontend.md](docs/06-frontend.md)

**Desktop app**
- Login/Dashboard UI (Qt) — built and packaged as a portable Windows build, not yet connected to the backend
- Storage layer that can now detect real physical storage devices on a Windows workstation and represent them internally
- Device classification (HDD/SSD, bus type, internal/removable) — in progress, not reliable yet

See: [docs/07-desktop-ui.md](docs/07-desktop-ui.md), [docs/05-desktop-sanitization-engine.md](docs/05-desktop-sanitization-engine.md)

## Architecture
[ADD DIAGRAM: SYSTEM-ARCHITECTURE]

Website → Backend → MySQL/MongoDB
Desktop App → Backend → Database
Desktop App → Storage Device (direct, physical — nothing else touches the disk)

## Not built yet
Actual sanitization execution, verification, certificate generation, and public certificate verification. Capability detection (including NVMe/ZNS awareness) and the safety/policy engine that will gate any destructive operation are also not started. See individual module docs for exact status.

## Security
- Passwords hashed with Argon2
- Sessions use JWT signed with RS256, with expiry/issuer/audience validation
- Role-based access enforced on the backend, not just hidden in the UI
- Desktop storage engine follows a "fail closed" principle — if it can't confidently identify something, it blocks rather than guesses (not yet enforced in code, this is the design intent going forward)

## Roadmap
- Backend API for the sanitization request flow (frontend currently mocked)
- Device classification completion, capability detection, Safety Engine, Policy/Decision Engine
- Sanitization execution, verification, evidence generation, certificates
- Public certificate verification page
- Backend integration for the desktop UI

## Team
Subhranil Mandal
Ansh Pandey
Vishal Prajapati
Parth Goel
Ayush Gupta
Tanuja Awasthi

## License
[NEEDS CONFIRMATION]
