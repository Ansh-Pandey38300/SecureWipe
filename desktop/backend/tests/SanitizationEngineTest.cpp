#include <iostream>
#include <vector>

#include "StorageDevice.h"
#include "WindowsStorageDiscovery.h"
#include "SafetyEngine.h"
#include "SafetyResult.h"
#include "SanitizationEngine.h"

int main()
{
    std::cout
        << "========================================\n"
        << " SecureWipe Sanitization Engine Test\n"
        << "========================================\n";

    WindowsStorageDiscovery discovery;

    std::vector<StorageDevice> devices =
        discovery.discover();

    if (devices.empty())
    {
        std::cout
            << "\nNo storage devices detected.\n";

        return 1;
    }

    std::cout
        << "\nDetected Devices: "
        << devices.size()
        << '\n';

    SafetyEngine safetyEngine;

    SanitizationEngine sanitizationEngine;

    for (std::size_t i = 0; i < devices.size(); ++i)
    {
        const StorageDevice& device = devices[i];

        std::cout
            << "\n----------------------------------------\n"
            << "Device "
            << i + 1
            << '\n'
            << "----------------------------------------\n";

        std::cout
            << "Device ID : "
            << device.getDeviceId()
            << '\n';

        std::cout
            << "Model     : "
            << device.getModel()
            << '\n';

        std::cout
            << "Serial    : "
            << device.getSerialNumber()
            << '\n';

        std::cout
            << "Interface : "
            << device.getInterfaceType()
            << '\n';

        if (device.getInterfaceType() != "NVMe")
        {
            std::cout
                << "\nSkipping non-NVMe device.\n";

            continue;
        }

        // ====================================================
        // STEP 1: Set the device selected by the user
        // ====================================================

        std::cout
            << "\n[1] Setting expected target...\n";

        safetyEngine.setExpectedTarget(device);

        std::cout
            << "Expected target set successfully.\n";

        // ====================================================
        // STEP 2: Run Safety Engine
        // ====================================================

        std::cout
            << "\n[2] Running Safety Engine...\n";

        SafetyResult safetyResult =
            safetyEngine.evaluateWithResult(device);

        std::cout
            << "\nSafety Decision: "
            << safetyResult.decision
            << '\n';

        std::cout
            << "Safety Summary: "
            << safetyResult.summary
            << '\n';

        // ====================================================
        // Display individual safety checks
        // ====================================================

        std::cout
            << "\nSafety Checks\n"
            << "-------------\n";

        for (const auto& check : safetyResult.checks)
        {
            std::cout
                << check.checkName
                << " : "
                << (check.passed ? "PASS" : "FAIL")
                << '\n';

            std::cout
                << "  "
                << check.message
                << '\n';
        }

        // ====================================================
        // STEP 3: Stop if safety checks fail
        // ====================================================

        if (!safetyResult.isOverallSafe)
        {
            std::cout
                << "\nSanitization BLOCKED by Safety Engine.\n";

            continue;
        }

        std::cout
            << "\nSafety validation PASSED.\n";

        // ====================================================
        // STEP 4: Start Sanitization Engine
        // ====================================================

        std::cout
            << "\n[3] Starting Sanitization Engine...\n";

        bool result =
            sanitizationEngine.sanitize(
                device,
                safetyResult);

        // ====================================================
        // STEP 5: Final result
        // ====================================================

        std::cout
            << "\n========================================\n"
            << " Sanitization Test Result: "
            << (result ? "PASS" : "FAIL")
            << "\n========================================\n";
    }

    return 0;
}