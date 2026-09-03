# Workstation Center & Admin User Management

This module covers everything to do with managing users, roles, and workstation centers from the backend — mostly built by Subhranil between Aug 20–23.

## Status
Implemented and tested. A couple of access-control checks (role-based center access, duplicate employee assignment, head-only-own-center) were run by the developer but results weren't explicitly confirmed — see "Still needs confirming" below.

## What it does

An Admin account is created separately through an admin-creation script — not through the normal signup flow. Once logged in, an Admin can list all users and update their roles. Normal registration always defaults a new user to `CUSTOMER`. Role updates through the API can only assign `CUSTOMER`, `WORKSTATION_HEAD`, or `WORKSTATION_EMPLOYEE` — the `ADMIN` role itself can't be handed out this way, on purpose.

On top of that, Admins can create Workstation Centers, and assign one or more employees to a center in a single request using a list of employee IDs. Workstation Heads are restricted to managing only their own center; Admins can manage any.

APIs involved:
- `GET /api/users`
- `PATCH /api/users/:id/role`
- `GET /api/users/eligible-workstation-heads`
- Workstation Center creation, lookup, and employee-assignment endpoints

## A bug worth noting

Workstation Center creation was initially broken by a leftover MongoDB index (`centerCode_1`) from a field that had already been removed from the schema — so it kept throwing a duplicate key error even though nothing was actually duplicated. Traced it back to the stale index and removed it; creation works correctly now.

There was also a smaller mix-up early on between the custom `centerId` (UUID, used publicly in API URLs) and MongoDB's internal `_id` (used only for database relationships) — that's now settled as the standard.

## Still needs confirming
Subhranil ran tests for role-based Workstation Center access, duplicate-employee-assignment rejection, and the "head can only manage their own center" restriction, but the report never states pass/fail for these explicitly. Worth a quick follow-up before marking them tested.

Workstations are now linked to a specific Workstation Center rather than existing as standalone entities. When a Workstation is created, the selected Center is resolved on the backend and its MongoDB _id is stored on the Workstation. Workstations can be created directly from the Center workflow, and are retrievable and displayed inside Center Details.

Hierarchy: Workstation Center → Head → Employees → Workstations.

Workstation Centre and Workstation IDs were switched from UUIDs to clean sequential formats — CTR-0001, CTR-0002... for Centres, and WS-0001, WS-0002... for Workstations — generated through a reusable Counter model using MongoDB's atomic increment. Sanitization Request IDs (REQ-0001...) are planned to follow the same pattern. MongoDB _id is still used internally; these sequential IDs are for anything human-facing.

A Mongoose model-reference bug (mismatch between "WorkStation" and "Workstation") was also found and fixed — it was causing workstation info to display incorrectly. The Workstation Head Dashboard now shows the Centre ID and has its own dedicated Sanitization Requests section for tracking requests after assignment.

## Evidence
Screenshot:
Screenshot:
Commit/PR:
