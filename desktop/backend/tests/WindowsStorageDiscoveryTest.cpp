#include "WindowsStorageDiscovery.h"

#include <iostream>

int main()
{
    // Create discovery object
    WindowsStorageDiscovery discovery;

    // Ask Windows to discover storage devices
    auto devices = discovery.discover();

    // Show how many devices were found
    std::cout << "\nDetected storage devices: "
              << devices.size()
              << "\n";


    // Print every detected device
    for (const auto& device : devices)
    {
        std::cout << "\n========================================\n";

        std::cout << "Device ID: "
                  << device.getDeviceId()
                  << "\n";

        std::cout << "Model: "
                  << device.getModel()
                  << "\n";

        std::cout << "Serial Number: "
                  << device.getSerialNumber()
                  << "\n";

        std::cout << "Capacity: "
                  << device.getCapacityBytes()
                  << " bytes\n";

        std::cout << "Interface Type: "
                  << device.getInterfaceType()
                  << "\n";

        std::cout << "System Disk: "
                  << (device.isSystemDisk() ? "YES" : "NO")
                  << "\n";
    }


    std::cout << "\n========================================\n";

    return 0;
}