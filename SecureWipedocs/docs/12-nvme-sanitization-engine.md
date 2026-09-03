# NVMe Sanitization Engine

Status: Command implementation done and compiles; NOT yet run as a real destructive operation on physical hardware. Don't let this get described as "sanitization works."

## What exists
The actual NVMe Sanitize command (opcode 0x84) is implemented, supporting three actions: Block Erase, Overwrite, and Crypto Erase. Before attempting any of these, the code checks what the specific NVMe controller actually claims to support (via NVMe Identify Controller / SANICAP) — it does not assume every NVMe SSD supports every method.

This is now wired into the Safety Engine — a sanitize attempt requires safety checks (system-disk check, boot-dependency check, mounted-volume check, physical-device check, target-identity validation) to pass first.

## Where it actually stands
The sanitization-related code compiled and most test targets built (one linker error was hit and fixed along the way). But the NVMe sanitize path has NOT been run as a real destructive operation on a dedicated test SSD yet — this is command implementation + capability wiring only, not a verified working wipe.

## An important distinction going forward
A successful command call is not the same as proof that sanitization actually completed. The intended flow is: Command Submitted → Sanitize In Progress → Controller Status → Completed/Failed → Verification → Certificate. Execution and verification will stay separate steps.

## Evidence
Screenshot:
Commit/PR: