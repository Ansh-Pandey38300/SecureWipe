# Sanitization Capability Detection

Status: Implemented and tested on 2 real devices (Samsung NVMe SSD, HP USB flash drive). This is capability-checking only — no actual sanitization happens here.

## What it does
Before SecureWipe can pick a sanitization method, it needs to know what a device actually supports. This module queries that using Windows storage-property APIs and raw SCSI commands (SCSI INQUIRY, and REPORT SUPPORTED OPERATION CODES as the actual capability check).

Native sanitize capability is tracked as three states, not a simple yes/no: SUPPORTED, NOT_SUPPORTED, or UNKNOWN. UNKNOWN is used whenever the query can't reliably determine an answer — it is deliberately never treated the same as NOT_SUPPORTED.

## What was found testing real hardware
The NVMe SSD: storage-property query and SCSI INQUIRY both worked, but the actual capability check (REPORT SUPPORTED OPERATION CODES) came back as a non-success SCSI status — so its native sanitize support is UNKNOWN, not confirmed either way.

The USB flash drive: everything worked right up until the same capability check, which timed out (Windows error 121) instead of returning an answer. Also UNKNOWN. Importantly — this does NOT mean the USB drive can't be sanitized, it just means this particular query couldn't get a reliable answer. USB isn't being dropped from the project over this.

Worth remembering: a successful SCSI INQUIRY only proves the device is talking back correctly — it's not proof it supports native sanitization.

## Also worth knowing
USB flash drives have their own internal controller and flash management (wear leveling, spare blocks, etc.), so a simple logical overwrite from the host side shouldn't be presented as a guaranteed full physical wipe unless verified properly.

## Evidence
Screenshot:
Commit/PR: