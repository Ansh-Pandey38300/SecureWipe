# Decision Record — SafetyResult structure

Date: 2026-08-28
Decided by: Subhranil

Individual safety checks keep doing the actual validation and return true/false, same as before. SafetyEngine now sits on top of that and converts each boolean result into a SafetyCheckResult (name + pass/fail + reason). All of those get bundled into a SafetyResult, which is the complete report SafetyEngine returns, ending in one overall SAFE or BLOCKED decision.

SafetyEngine still doesn't perform sanitization itself — it only decides whether it's safe to proceed. Sanitization will only be allowed to start once SafetyResult reports SAFE.
