# Safety Engine

Status: Foundation / In Progress — nothing here is fully tested yet.

## What exists
Five new files were added: SafetyEngine, DeviceIdentity, BootInfo, SafetyResult, and WindowsBootChecker. These are the beginning of the safety architecture, not a finished system.

System-disk check: PARTIAL — it can already reject a device if StorageDevice reports it as the current system disk, but this hasn't been verified end-to-end.

Physical-device validation: IMPLEMENTED — checks that required device identity fields are present before any destructive step is allowed.

Target-identity concept: FOUNDATION ONLY — the idea is to store the expected target device and recheck it against a freshly discovered device right before sanitization, so the wrong device can't get wiped after selection. Not built yet, just planned.

Boot detection: NOT WORKING YET — the BootInfo data structure exists, but WindowsBootChecker doesn't actually detect anything real yet.

Mounted-volume checks and OS-dependency checks (pagefile, hibernation, crash-dump): NOT IMPLEMENTED AT ALL.

Important: a safety file existing in the codebase is not the same as a passing safety test. Don't let anyone read this as "safety is done."

## Evidence
Screenshot:
Commit/PR: