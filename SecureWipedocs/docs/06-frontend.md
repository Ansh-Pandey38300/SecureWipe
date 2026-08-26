# Web Frontend (React)

The customer/admin-facing website, built with React + Vite. Most of the foundation went in on Aug 23; the Sanitization Request flow was added Aug 25.

## What exists

The app is structured around pages, reusable components, service modules, and an AuthContext for authentication. Login and Register pages work, JWT is stored in localStorage and automatically restored on refresh, and routes are protected both by authentication and by role (Admin / Workstation Head / Workstation Employee / Customer each see different navigation and dashboards).

Admin can see and manage users (list, update roles), create and look up Workstation Centers, view center details, and assign employees to a center. Workstation Head and Customer both have their own dashboards, though Workstation Head and Employee functionality is still limited since the backend doesn't fully support it yet.

There's a shared UI kit behind all of this — buttons, cards, modals, tables, loading/error/empty states, toast notifications — so the different dashboards don't each reinvent their own components.

## Sanitization Request (added Aug 25)

Customers can now submit a sanitization request: device/customer info, capacity (starting from 2 GB), method, device count, an asset identifier, a preferred date, notes, a safety warning, and a required consent checkbox before submitting. It has real field-level validation (required fields, email/phone format, length limits, valid capacity/device-count/method/date) with validation-on-blur and error clearing.

Right now this submits to a mock endpoint, not a real backend — there's no sanitization-request API yet. The mock returns a fixed placeholder ID (`REQ-DEMO-001`). When the real backend exists, this needs to be swapped from mock submission to an actual API call, and a few things will need confirming with backend first: the real endpoint/method, auth requirements, exact field names expected, and what a real success response looks like.

While working on this, existing validation on Login, Register, Workstation Center creation, Center lookup (both customer and admin side), and Assign Employees was also reviewed and tightened up.

## A small note on localStorage
JWT is stored in localStorage rather than an httpOnly cookie. This is a common approach but carries some XSS exposure — not an active problem, just worth being aware of if the team revisits security hardening later.

## Tested
Login/Register flow, session persistence across refresh, protected + role-based routing, sidebar navigation per role, logout, user listing and role updates, Workstation Center create/lookup/details, employee-assignment UI, Customer center lookup, loading/error/empty states, toast notifications, and — for the Aug 25 update specifically — the full sanitization request form, its validation, and a production build (`vite build` completed successfully, 60 modules, ~910ms).

## Evidence
Commit/PR:https://github.com/Subhranil123-ops/SecureWipe/pull/9
Screenshots:In screenshots section
