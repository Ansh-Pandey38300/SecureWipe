#include "SanitizationCapability.h"
#include "StorageDevice.h"

#include "ScsiCapability.h"
#include "StoragePropertyCapability.h"

#include <Windows.h>

#include <iostream>


SanitizationCapability detectSanitizationCapability(
    const StorageDevice& device)
{
    SanitizationCapability capability;


    // --------------------------------------------------------
    // Device interface information
    // --------------------------------------------------------

    if (device.getInterfaceType() == "USB")
    {
        capability.isUsbDevice = true;
    }


    // --------------------------------------------------------
    // Open physical storage device
    // --------------------------------------------------------

    HANDLE deviceHandle =
        CreateFileA(
            device.getDeviceId().c_str(),

            GENERIC_READ |
            GENERIC_WRITE,

            FILE_SHARE_READ |
            FILE_SHARE_WRITE,

            nullptr,

            OPEN_EXISTING,

            0,

            nullptr);


    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        std::cout
            << "Unable to open storage device.\n";

        std::cout
            << "Windows error: "
            << GetLastError()
            << '\n';

        return capability;
    }


    // --------------------------------------------------------
    // Windows Storage Properties
    // --------------------------------------------------------

    capability.storagePropertyQueryAvailable =
        queryStorageProperties(
            deviceHandle);


    // --------------------------------------------------------
    // SCSI capability test
    // --------------------------------------------------------

    capability.scsiPathAvailable =
        testScsiPassThrough(
            deviceHandle);


    // --------------------------------------------------------
    // Native sanitization
    //
    // NVMe capability detection will update this later.
    // --------------------------------------------------------

    capability.nativeSanitizeSupported =
        NativeSanitizeSupport::UNKNOWN;


    // --------------------------------------------------------
    // Close device
    // --------------------------------------------------------

    CloseHandle(
        deviceHandle);


    return capability;
}