#include <iostream>

#include "SanitizationEngine.h"
#include "SafetyResult.h"
#include "StorageDevice.h"

int main()
{
    std::cout
        << "========================================\n"
        << "   SecureWipe SanitizationEngine Test\n"
        << "========================================\n\n";

    StorageDevice testDevice(
        "\\\\.\\PhysicalDrive1",
        "Test USB Drive",
        "TEST-SERIAL-001",
        64000000000ULL,
        "USB",
        false,
        true,
        false
    );

    SanitizationEngine sanitizationEngine;

    // Test 1: SAFE SafetyResult
    SafetyResult safeResult;

    safeResult.isOverallSafe = true;
    safeResult.decision = "SAFE";
    safeResult.summary =
        "All safety checks passed.";

    bool safeGate =
        sanitizationEngine.canSanitize(
            testDevice,
            safeResult);

    std::cout
        << "[TEST 1] SAFE Safety Result\n"
        << "Expected : ALLOWED\n"
        << "Actual   : "
        << (safeGate ? "ALLOWED" : "BLOCKED")
        << "\n"
        << "Status   : "
        << (safeGate ? "PASS" : "FAIL")
        << "\n\n";


    // Test 2: BLOCKED SafetyResult
    SafetyResult blockedResult;

    blockedResult.isOverallSafe = false;
    blockedResult.decision = "BLOCKED";
    blockedResult.summary =
        "One or more safety checks failed.";

    bool blockedGate =
        sanitizationEngine.canSanitize(
            testDevice,
            blockedResult);

    std::cout
        << "[TEST 2] BLOCKED Safety Result\n"
        << "Expected : BLOCKED\n"
        << "Actual   : "
        << (blockedGate ? "ALLOWED" : "BLOCKED")
        << "\n"
        << "Status   : "
        << (!blockedGate ? "PASS" : "FAIL")
        << "\n\n";


    // Test 3: SAFE result must reach sanitization stage,
    // but actual sanitization is not implemented yet.
    bool executionResult =
        sanitizationEngine.sanitize(
            testDevice,
            safeResult);

    std::cout
        << "[TEST 3] Sanitization Execution\n"
        << "Expected : NOT EXECUTED YET\n"
        << "Actual   : "
        << (executionResult ? "EXECUTED" : "NOT EXECUTED")
        << "\n"
        << "Status   : "
        << (!executionResult ? "PASS" : "FAIL")
        << "\n\n";


    // Test 4: BLOCKED result must never reach execution.
    bool blockedExecution =
        sanitizationEngine.sanitize(
            testDevice,
            blockedResult);

    std::cout
        << "[TEST 4] Blocked Target Execution\n"
        << "Expected : NOT EXECUTED\n"
        << "Actual   : "
        << (blockedExecution ? "EXECUTED" : "NOT EXECUTED")
        << "\n"
        << "Status   : "
        << (!blockedExecution ? "PASS" : "FAIL")
        << "\n\n";


    std::cout
        << "========================================\n"
        << "       SANITIZATION ENGINE TEST\n"
        << "========================================\n";

    return 0;
}