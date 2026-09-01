#include "EvidenceCollector.h"
#include "WindowsStorageDiscovery.h"

#include <iostream>
#include <vector>

int main()
{
    WindowsStorageDiscovery discovery;

    std::vector<StorageDevice> devices = discovery.discover();

    if (devices.empty())
    {
        std::cerr << "No storage devices found.\n";
        return 1;
    }

    std::cout << "Available Storage Devices:\n\n";

    for (std::size_t i = 0; i < devices.size(); ++i)
    {
        const auto &device = devices[i];

        std::cout << "[" << i << "]\n";
        std::cout << "Model     : " << device.getModel() << '\n';
        std::cout << "Serial    : " << device.getSerialNumber() << '\n';
        std::cout << "Interface : " << device.getInterfaceType() << '\n';
        std::cout << "Capacity  : " << device.getCapacityBytes() << " bytes\n";
        std::cout << "System Disk: "
                  << (device.isSystemDisk() ? "YES" : "NO")
                  << '\n';
        std::cout << "Removable : "
                  << (device.isRemovable() ? "YES" : "NO")
                  << '\n';
        std::cout << "Device ID : " << device.getDeviceId() << '\n';
        std::cout << "-----------------------------\n";
    }

    std::size_t selection;

    std::cout << "\nSelect device index: ";
    std::cin >> selection;

    if (selection >= devices.size())
    {
        std::cerr << "Invalid device selection.\n";
        return 1;
    }

    const StorageDevice &selectedDevice = devices[selection];

    std::cout << "\nSelected Device\n";
    std::cout << "Model     : "
              << selectedDevice.getModel()
              << '\n';

    std::cout << "Serial    : "
              << selectedDevice.getSerialNumber()
              << '\n';

    std::cout << "Interface : "
              << selectedDevice.getInterfaceType()
              << '\n';

    std::cout << "Device ID : "
              << selectedDevice.getDeviceId()
              << '\n';

    if (selectedDevice.isSystemDisk())
    {
        std::cout << "\nWARNING: Selected device is the system disk.\n";
        std::cout << "Forensic testing should preferably use a removable test device.\n";
    }

    EvidenceCollector collector;

    std::vector<EvidenceItem> evidence =
        collector.collect(selectedDevice.getDeviceId());

    std::cout << "\nCollected evidence items: "
              << evidence.size()
              << '\n';

    return 0;
}