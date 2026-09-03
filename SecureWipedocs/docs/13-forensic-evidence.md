# Forensic Evidence Collection

Status: Early but real progress — actual JPEG files have been recovered from a real USB drive. Validation/hashing/scoring not built yet.

## What it does
Scans a physical storage device in 4MB chunks (rather than loading the whole device into memory) looking for JPEG file signatures and end-markers, tracking a global byte offset across the whole scan so it can recover files that span across chunk boundaries.

## Tested and working
Ran against a real ~62GB USB drive — multiple JPEG files were found and successfully recovered, including one that spanned across a chunk boundary, which was the actual point of building it this way instead of a naive single-chunk scan.

Two bugs fixed along the way: the first version only ever read the first 4MB (not the whole device), and a missing Windows.h include broke the build (HANDLE type wasn't defined).

## Data model
Recovered files will be represented by an EvidenceItem (started 31 Aug) — fields for things like artifact ID, source offset, recovered size, file type, a confidence score with stated reasons, SHA-256 hash, and validation state. EvidenceItem is meant to be a data holder only — it won't do the actual carving, validation, or scoring itself.

## Planned pipeline
Forensic Image/Device → Carving → Recovered File → Validation → Confidence Scoring → Evidence → Forensic Report

Confidence scoring is intentionally being designed as deterministic/rule-based (checking header, footer, structure, size, decodability) rather than ML-based, so every score comes with an explainable reason.

## Not built yet
Validating whether a recovered file is actually decodable, SHA-256 hashing, confidence scoring itself, unique naming for recovered artifacts, and the final forensic report.

## Evidence
Screenshot: SS-FORENSIC-01-device-open-chunks-1-9.png (device open + chunk scan start)
Screenshot: SS-FORENSIC-02-jpeg-recovery-chunks-10-17.png (3 real JPEGs recovered, one spanning a chunk boundary)
Commit/PR: