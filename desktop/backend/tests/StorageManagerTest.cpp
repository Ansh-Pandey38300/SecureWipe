#include <iostream>
#include "StorageManager.h"

int main()
{
    StorageManager manager;

    StorageDevice ssd("TEST-001",
                      "Test SSD",
                      "SSD-SERIAL",
                      512ULL * 1024 * 1024 * 1024,
                      "NVMe",
                      true);

    StorageDevice pendrive("TEST-002",
                           "Test Pendrive",
                           "USB-SERIAL",
                           64ULL * 1024 * 1024 * 1024,
                           "USB",
                           false);
    manager.addDevice(ssd);
    manager.addDevice(pendrive);

    std::cout << manager.getDevices().size() << "\n";

    const auto &devices = manager.getDevices();
    for (auto &device : devices)
    {
        std::cout << device.getDeviceId() << '\n';
        std::cout << device.getModel() << '\n';
        std::cout << device.getSerialNumber() << '\n';
        std::cout << device.getCapacityBytes() << '\n';
        std::cout << device.getInterfaceType() << '\n';
        std::cout << device.isSystemDisk() << '\n';
        std::cout << "--------------------" << '\n';
    }

    manager.clearDevices();
    return 0;
}