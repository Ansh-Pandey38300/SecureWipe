#include <iostream>
#include <vector>

#include "SanitizationCapability.h"
#include "StorageDevice.h"
#include "WindowsStorageDiscovery.h"


int main()
{
    std::cout
        << "========================================\n"
        << " SecureWipe Sanitization Capability Test\n"
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
        << "\n";


    for (std::size_t i = 0;
         i < devices.size();
         ++i)
    {
        const StorageDevice& device =
            devices[i];


        std::cout
            << "\n----------------------------------------\n";


        std::cout
            << "Device "
            << i + 1
            << "\n";


        std::cout
            << "Device ID : "
            << device.getDeviceId()
            << "\n";


        std::cout
            << "Model     : "
            << device.getModel()
            << "\n";


        std::cout
            << "Serial    : "
            << device.getSerialNumber()
            << "\n";


        std::cout
            << "Interface : "
            << device.getInterfaceType()
            << "\n";


        // ----------------------------------------------------
        // Run Capability Engine
        // ----------------------------------------------------

        SanitizationCapability capability =
            detectSanitizationCapability(
                device);


        // ----------------------------------------------------
        // Capability result
        // ----------------------------------------------------

        std::cout
            << "\nSanitization Capability\n";


        std::cout
            << "USB Device                    : "
            << (capability.isUsbDevice
                    ? "YES"
                    : "NO")
            << "\n";


        std::cout
            << "Storage Property Query        : "
            << (capability.storagePropertyQueryAvailable
                    ? "SUCCESS"
                    : "FAILED")
            << "\n";


        std::cout
            << "SCSI Path Available           : "
            << (capability.scsiPathAvailable
                    ? "YES"
                    : "NO")
            << "\n";


        std::cout
            << "Native Sanitize Support       : ";


        switch (
            capability.nativeSanitizeSupported)
        {
        case NativeSanitizeSupport::SUPPORTED:

            std::cout
                << "SUPPORTED\n";

            break;


        case NativeSanitizeSupport::NOT_SUPPORTED:

            std::cout
                << "NOT SUPPORTED\n";

            break;


        case NativeSanitizeSupport::UNKNOWN:

        default:

            std::cout
                << "UNKNOWN\n";

            break;
        }


        // ----------------------------------------------------
        // Current communication result
        // ----------------------------------------------------

        std::cout
            << "\nCurrent Capability Result     : ";


        if (capability.scsiPathAvailable)
        {
            std::cout
                << "SCSI communication test PASSED\n";
        }
        else
        {
            std::cout
                << "SCSI communication test FAILED\n";
        }


        std::cout
            << "\nMethod Selection              : "
            << "NOT IMPLEMENTED YET\n";
    }


    std::cout
        << "\n========================================\n"
        << "       CAPABILITY TEST COMPLETE\n"
        << "========================================\n";


    return 0;
}