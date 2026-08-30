# Desktop Sanitization Engine (C++)

This is the core of the desktop app — the part that actually finds and eventually sanitizes physical storage devices. Built by Subhranil starting Aug 24, still early.

## Where things stand
Physical device discovery on Windows now works end to end. Classification (figuring out whether a detected device is an HDD or SSD, internal or removable, etc.) is in progress. Nothing beyond that — capability detection, sanitization, verification, or certificates — has been started.

## The pipeline
The intended flow, from raw OS access down to a certificate, looks like this:

Windows Device APIs → WindowsStorageDiscovery → StorageDevice → StorageManager → DeviceClassifier → CapabilityDetector → SafetyEngine → PolicyEngine → Decision Engine → Sanitization → Verification → Evidence/Certificate

Only the first four steps exist right now.

## What's actually built

**StorageDevice** — a plain data class holding device ID, model, serial number, capacity, interface type, and whether it's the system disk. Has a constructor and getters, nothing fancier yet.

**StorageManager** — keeps a collection of StorageDevice objects (`std::vector` under the hood), can add devices and report how many are stored.

**WindowsStorageDiscovery** — this is where it gets more interesting. Early attempts only enumerated device info using SetupAPI (`SetupDiGetClassDevs`, `SetupDiEnumDeviceInfo`) without pulling real properties. As of Aug 25 this was pushed further: SecureWipe can now discover actual physical storage devices connected to a Windows machine and build real `StorageDevice` objects from them — not just test/sample data anymore. That's a meaningful milestone.

**DeviceClassifier** — the classifier now has working logic for bus type, device type, and media type, built using the properties StorageDevice already collects. It's not proven reliable across many device types yet.

Note: media type (HDD vs SSD) is currently detected using "seek penalty" as the signal. This is a working heuristic for now, not a guaranteed-correct method — worth remembering if anyone asks how HDD/SSD detection actually works.

## Build setup
CMake project with a `SecureWipeStorage` library target, public include directories configured, and separate test executables for StorageDevice and StorageManager. Got this working after sorting out a handful of the usual CMake headaches — include paths not found, wrong executable path, a stream-operator typo in the manager test, a `cbSize()` vs `cbSize` mistake in the discovery code.

## Windows storage utility layer
A dedicated WindowsStorageUtils namespace was added to hold Windows-specific storage helper functions, instead of scattering Windows API calls across multiple modules. Device classification and physical device detection were retested using this layer and passed on real hardware.

## Two decisions worth remembering

**Fail closed.** If SecureWipe can't confidently determine what it's looking at, it should not guess — it blocks the operation instead of proceeding.

**Explainable decisions.** Whatever engine eventually decides ALLOW / WARN / BLOCK on a device should also state *why* — e.g. "target is the active system disk," "boot partition detected." This isn't built yet, but it's the intended shape.

## What's tested so far
- StorageDevice construction/getters — verified against sample SSD and USB data
- StorageManager add/count behavior
- CMake build config and generation
- Physical device discovery on a real Windows workstation — devices were actually detected and turned into StorageDevice objects successfully

## Not started at all
Capability detection (including NVMe/ZNS-specific), the Safety Engine, Policy/Decision Engine, sanitization itself, verification, and certificate generation. None of this exists yet — don't let anyone assume otherwise from how far along the discovery layer sounds.

## Evidence
Screenshot (StorageDevice/StorageManager console output):NA
Screenshot (device discovery output):NA
Screenshot (commit message):NA
PR: https://github.com/Subhranil123-ops/SecureWipe/pull/25
