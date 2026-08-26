# Desktop App UI (Qt)

Built by Ansh Pandey, starting Aug 23. This is UI only — no backend connection yet.

## What happened
The first attempt at the Login/Dashboard layout used a stacked-widget approach in Qt Creator, which caused enough alignment and sizing headaches that it made more sense to restart than keep patching it. The UI was rebuilt with a simpler structure.

Once the layout was working, the app was built in Release mode and packaged into a portable Windows build using windeployqt, so it can run on another machine without needing Qt installed separately.

## Tested
The Release build compiles and the generated executable runs. The portable package was verified to include the required Qt runtime dependencies.

## Not done yet
No backend integration at all — the UI exists but isn't wired up to the auth/backend APIs yet. That's the next big step once both sides are ready to connect.

## Evidence
Commit/PR:https://github.com/Subhranil123-ops/SecureWipe/pull/18
Screenshots: in screenshots section