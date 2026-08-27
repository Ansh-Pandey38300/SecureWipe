// #include <iostream>
// #include "WindowsStorageDiscovery.h"
// #include "SafetyEngine.h"

// int main()
// {

//     std::cout << "========================================\n";
//     std::cout << "   SafetyEngine - Check 3 Test\n";
//     std::cout << "========================================\n\n";

//     WindowsStorageDiscovery discovery;
//     auto &devices = discovery.discover();

//     std::cout << "Devices found: "
//               << devices.size()
//               << "\n\n";

//     if (devices.empty())
//     {
//         std::cout << "No storage devices found.\n";
//         return 1;
//     }

//     for (int i = 0; i < devices.size(); ++i)
//     {
//         std::cout << "Device #" << i + 1 << "\n";
//         std::cout << "Device ID : "
//                   << devices[i].getDeviceId()
//                   << "\n";
//         std::cout << "Model     : "
//                   << devices[i].getModel()
//                   << "\n";
//         std::cout << "Interface : "
//                   << devices[i].getInterfaceType()
//                   << "\n";
//         std::cout << "Removable : "
//                   << (devices[i].isRemovable() ? "YES" : "NO")
//                   << "\n\n";
//     }

//     StorageDevice *target = nullptr;

//     for (auto &device : devices)
//     {
//         if (device.getDeviceId() == "\\\\.\\PhysicalDrive1")
//         {
//             target = &device;
//             break;
//         }
//     }

//     if (target == nullptr)
//     {
//         std::cout << "Pendrive not found.\n";
//         return 1;
//     }

//     std::cout << "----------------------------------------\n";
//     std::cout << "Selected Test Target\n";
//     std::cout << "----------------------------------------\n";

//     std::cout << "Device ID : "
//               << target->getDeviceId()
//               << "\n";

//     std::cout << "Model     : "
//               << target->getModel()
//               << "\n\n";

//     SafetyEngine safety;
//     bool result = safety.evaluate(*target);

//     std::cout << "----------------------------------------\n";

//     if (result)
//     {
//         std::cout << "Check 3 Result: SAFE\n";
//     }
//     else
//     {
//         std::cout << "Check 3 Result: BLOCKED\n";
//     }

//     std::cout << "----------------------------------------\n";

//     return 0;
// }