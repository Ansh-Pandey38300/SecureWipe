#include "WindowsStorageDiscovery.h"

#include <windows.h>
#include <setupapi.h>

std::vector<StorageDevice> WindowsStorageDiscovery::discover()
{

    std::vector<StorageDevice> devices;

    HDEVINFO deviceInfoSet = SetupDiGetClassDevs(
        nullptr,
        nullptr,
        nullptr,
        DIGCF_ALLCLASSES | DIGCF_PRESENT);

    if (deviceInfoSet == INVALID_HANDLE_VALUE)
    {
        return devices;
    }

    SP_DEVINFO_DATA deviceInfoData{};
    deviceInfoData.cbSize = sizeof(SP_DEVINFO_DATA);

    for (DWORD index = 0; SetupDiEnumDeviceInfo(deviceInfoSet, index, &deviceInfoData); ++index)
    {
        SP_DEVICE_INTERFACE_DATA interfaceData{};
        interfaceData.cbSize = sizeof(SP_DEVICE_INTERFACE_DATA);
    };
}