#include "SanitizationCapability.h"
#include "StorageDevice.h"
#include "WindowsStorageDiscovery.h"

#include <iostream>
#include <vector>

int main()
{
    std::cout
        << "========================================\n"
        << " Sanitization Capability Test\n"
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
        << "\nDetected devices: "
        << devices.size()
        << '\n';

    bool testPassed = true;

    for (std::size_t i = 0;
         i < devices.size();
         ++i)
    {
        const StorageDevice &device =
            devices[i];

        std::cout
            << "\n----------------------------------------\n";

        std::cout
            << "Device "
            << i + 1
            << '\n';

        std::cout
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

        std::cout
            << "\nRunning sanitization capability "
               "detection...\n";

        SanitizationCapability capability =
            detectSanitizationCapability(
                device);

        std::cout
            << "\n========== Capability Result ==========\n";

        std::cout
            << "USB Device                  : "
            << (capability.isUsbDevice
                    ? "YES"
                    : "NO")
            << '\n';

        std::cout
            << "Storage Property Query      : "
            << (capability.storagePropertyQueryAvailable
                    ? "AVAILABLE"
                    : "NOT AVAILABLE")
            << '\n';

        std::cout
            << "SCSI Path                   : "
            << (capability.scsiPathAvailable
                    ? "AVAILABLE"
                    : "NOT AVAILABLE")
            << '\n';

        std::cout
            << "NVMe Identify               : "
            << (capability.nvmeIdentifyAvailable
                    ? "AVAILABLE"
                    : "NOT AVAILABLE")
            << '\n';

        std::cout
            << "NVMe Crypto Erase           : "
            << (capability.nvmeCryptoEraseSupported
                    ? "SUPPORTED"
                    : "NOT SUPPORTED")
            << '\n';

        std::cout
            << "NVMe Block Erase            : "
            << (capability.nvmeBlockEraseSupported
                    ? "SUPPORTED"
                    : "NOT SUPPORTED")
            << '\n';

        std::cout
            << "NVMe Overwrite              : "
            << (capability.nvmeOverwriteSupported
                    ? "SUPPORTED"
                    : "NOT SUPPORTED")
            << '\n';

        std::cout
            << "Native Sanitize             : "
            << (capability.nativeSanitizeSupported ==
                        NativeSanitizeSupport::SUPPORTED
                    ? "SUPPORTED"
                    : "NOT SUPPORTED")
            << '\n';

        // ----------------------------------------------------
        // Basic consistency checks
        // ----------------------------------------------------

        bool deviceTestPassed = true;

        if (device.getDeviceId().empty())
        {
            std::cout
                << "\nFAIL: Device ID is empty.\n";

            deviceTestPassed = false;
        }

        if (device.getInterfaceType().empty())
        {
            std::cout
                << "\nFAIL: Interface type is empty.\n";

            deviceTestPassed = false;
        }

        // ----------------------------------------------------
        // NVMe consistency checks
        // ----------------------------------------------------

        if (device.getInterfaceType() == "NVMe")
        {
            if (!capability.nvmeIdentifyAvailable)
            {
                std::cout
                    << "\nWARNING: NVMe Identify "
                       "information unavailable.\n";
            }

            bool anyNvmeMethod =
                capability.nvmeCryptoEraseSupported ||
                capability.nvmeBlockEraseSupported ||
                capability.nvmeOverwriteSupported;

            if (anyNvmeMethod &&
                capability.nativeSanitizeSupported !=
                    NativeSanitizeSupport::SUPPORTED)
            {
                std::cout
                    << "\nFAIL: NVMe sanitize method "
                       "reported but native sanitize "
                       "capability is NOT SUPPORTED.\n";

                deviceTestPassed = false;
            }

            if (!anyNvmeMethod &&
                capability.nativeSanitizeSupported ==
                    NativeSanitizeSupport::SUPPORTED)
            {
                std::cout
                    << "\nFAIL: Native sanitize reported "
                       "SUPPORTED but no NVMe sanitize "
                       "method is available.\n";

                deviceTestPassed = false;
            }
        }

        // ----------------------------------------------------
        // USB consistency checks
        // ----------------------------------------------------

        if (device.getInterfaceType() == "USB")
        {
            if (!capability.isUsbDevice)
            {
                std::cout
                    << "\nFAIL: Device is USB but "
                       "isUsbDevice is false.\n";

                deviceTestPassed = false;
            }
        }

        // ----------------------------------------------------
        // Final device result
        // ----------------------------------------------------

        std::cout
            << "\nCapability Test Result: "
            << (deviceTestPassed
                    ? "PASS"
                    : "FAIL")
            << '\n';

        if (!deviceTestPassed)
        {
            testPassed = false;
        }
    }

    std::cout
        << "\n========================================\n"
        << " Overall Test Result: "
        << (testPassed
                ? "PASS"
                : "FAIL")
        << "\n========================================\n";

    return testPassed
               ? 0
               : 1;
}