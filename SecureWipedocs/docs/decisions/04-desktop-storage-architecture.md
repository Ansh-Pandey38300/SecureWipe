# Decision Record — Desktop storage layer architecture

Date: 2026-08-24 / 2026-08-25
Decided by: Subhranil

The desktop sanitization backend is being kept separate from the Qt frontend, and internally split into clearly separated stages rather than one large component:

WindowsStorageDiscovery → StorageDevice → DeviceClassifier → CapabilityDetector → SafetyEngine → PolicyEngine → Decision Engine → Sanitization → Verification → Evidence/Certificate

The reasoning: WindowsStorageDiscovery is the only piece that touches OS-specific APIs, so keeping it isolated means the rest of the pipeline doesn't care whether the underlying platform is Windows, and a Linux equivalent could be added later without touching StorageDevice, StorageManager, or anything downstream.

Two rules apply across the whole pipeline going forward:

**Fail closed** — if the system can't confidently determine something it needs to know before a destructive operation, it blocks rather than guesses.

**Explainable decisions** — the eventual decision engine won't just say ALLOW/WARN/BLOCK, it will say why (e.g. "target is the active system disk," "boot partition detected").

Also decided early on: destructive sanitization logic will not be built first. Device detection and identification come first, specifically so the system can safely understand what it's looking at before anything destructive is even possible.
