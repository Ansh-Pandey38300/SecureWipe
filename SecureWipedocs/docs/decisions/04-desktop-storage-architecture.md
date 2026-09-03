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

DeviceClassifier only describes a device — it does not decide whether that device is safe to wipe. That decision belongs entirely to SafetyEngine. The system will store an expected target identity and re-check it against a freshly discovered device immediately before sanitization, to avoid wiping the wrong device after selection. Boot/EFI/system-disk relationships are treated as a safety concern, not just another classification property.

Windows-specific storage code is centralized in a WindowsStorageUtils namespace rather than scattered across modules, so it can be reused cleanly by higher-level components. Evidence will be represented as a structured EvidenceItem rather than unstructured logs, so results from detection, sanitization, verification, and certification stay traceable and consistent.

Sanitization and forensic evidence work are being developed on separate branches (feat/sanitize vs Init/forensics) since they're largely independent concerns. A successful sanitize command call is never treated as proof the operation actually completed — execution and verification are kept as distinct steps, ending in a real Completed/Failed status before anything moves to verification or certification.
