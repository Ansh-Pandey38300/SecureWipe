#include "StorageDevice.h"
#include <iostream>
#include <string>

int main()
{
    StorageDevice device(
        "TEST-001",
        "Test SSD",
        "TEST-SERIAL",
        512ULL * 1024 * 1024 * 1024,
        "NVMe",
        false);

    std::cout << device.getDeviceId() << '\n';
    std::cout << device.getModel() << '\n';
    std::cout << device.getSerialNumber() << '\n';
    std::cout << device.getCapacityBytes() << '\n';
    std::cout << device.getInterfaceType() << '\n';
    std::cout << device.isSystemDisk() << '\n';

    return 0;
}