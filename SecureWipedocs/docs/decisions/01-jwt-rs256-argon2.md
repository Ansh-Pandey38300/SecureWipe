# Decision Record — Auth token signing (RS256) & password hashing (Argon2)

Date: 2026-08-20
Decided by: Subhranil (Backend)
Status: Accepted

## Context
The backend needed a way to authenticate users and issue tokens that prove
identity on later requests, plus a safe way to store passwords.

## Options Considered
1. JWT signed with HS256 (single shared secret)
2. JWT signed with RS256 (RSA public/private key pair) — chosen
3. Password hashing: bcrypt vs Argon2 — Argon2 chosen

## Decision
Use JWT with RS256 (asymmetric signing) and Argon2 for password hashing.

## Reasoning
RS256 lets the public key be shared for verification without exposing the signing key;
Argon2 is a modern, memory-hard hashing algorithm.

## Consequences
- Verification of tokens can be done anywhere with just the public key
- Private key must be kept secure on the signing server
- Argon2 is more resource-intensive than older hashing methods (by design)

## Related Module Doc
[[docs/03-authentication.md]]
