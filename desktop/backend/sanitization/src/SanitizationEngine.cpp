#include "SanitizationEngine.h"
#include "NvmeSanitizer.h"

#include <iostream>

bool SanitizationEngine::performOverwrite(
    HANDLE deviceHandle,
    std::uint64_t totalBytes)
{
    if (deviceHandle == INVALID_HANDLE_VALUE)
        return false;

    if (totalBytes == 0)
        return false;

    std::cout
        << "Sanitization target opened successfully.\n";

    std::cout
        << "Target size: "
        << totalBytes
        << " bytes\n";

    std::cout
        << "Host overwrite is not implemented yet.\n";

    return false;
}

SanitizationMethod SanitizationEngine::selectMethod(
    const SanitizationCapability& capability) const
{
    if (capability.nativeSanitizeSupported ==
        NativeSanitizeSupport::SUPPORTED)
    {
        return SanitizationMethod::
            NativeDeviceSanitize;
    }

    if (capability.isUsbDevice &&
        capability.scsiPathAvailable)
    {
        return SanitizationMethod::HostOverwrite;
    }

    return SanitizationMethod::Unsupported;
}

bool SanitizationEngine::canSanitize(
    const StorageDevice& device,
    const SafetyResult& safetyResult)
{
    if (!safetyResult.isOverallSafe)
    {
        std::cout
            << "Safety Engine rejected "
               "the device.\n";

        return false;
    }

    if (device.getDeviceId().empty())
    {
        std::cout
            << "Device ID is missing.\n";

        return false;
    }

    if (device.getCapacityBytes() == 0)
    {
        std::cout
            << "Device capacity is unknown.\n";

        return false;
    }

    return true;
}

bool SanitizationEngine::sanitize(
    const StorageDevice& device,
    const SafetyResult& safetyResult)
{
    std::cout
        << "\n========================================\n"
        << " Sanitization Engine\n"
        << "========================================\n";

    std::cout
        << "\n[1] Safety validation\n";

    if (!canSanitize(
            device,
            safetyResult))
    {
        std::cout
            << "Device failed sanitization "
               "safety checks.\n";

        return false;
    }

    std::cout
        << "Safety validation PASSED.\n";

    std::cout
        << "\n[2] Detecting sanitization "
           "capability\n";

    SanitizationCapability capability =
        detectSanitizationCapability(
            device);

    std::cout
        << "\n[3] Selecting sanitization method\n";

    SanitizationMethod method =
        selectMethod(capability);

    switch (method)
    {
    case SanitizationMethod::
        NativeDeviceSanitize:

        std::cout
            << "Selected method: "
               "Native Device Sanitize\n";

        break;

    case SanitizationMethod::
        HostOverwrite:

        std::cout
            << "Selected method: "
               "Host Overwrite\n";

        break;

    case SanitizationMethod::
        Unsupported:

        std::cout
            << "No supported sanitization "
               "method found.\n";

        return false;
    }

    std::cout
        << "\n[4] Opening sanitization target\n";

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

    if (deviceHandle ==
        INVALID_HANDLE_VALUE)
    {
        std::cout
            << "Failed to open "
               "sanitization target.\n";

        std::cout
            << "Windows error: "
            << GetLastError()
            << '\n';

        return false;
    }

    std::cout
        << "Device opened successfully.\n";

    bool result = false;

    if (method ==
        SanitizationMethod::
            NativeDeviceSanitize)
    {
        std::cout
            << "\n[5] Starting native "
               "NVMe sanitization\n";

        NvmeSanitizeMethod nvmeMethod;

        if (capability.nvmeCryptoEraseSupported)
        {
            nvmeMethod =
                NvmeSanitizeMethod::
                    CryptoErase;

            std::cout
                << "NVMe method selected: "
                   "Crypto Erase\n";
        }
        else if (capability.nvmeBlockEraseSupported)
        {
            nvmeMethod =
                NvmeSanitizeMethod::
                    BlockErase;

            std::cout
                << "NVMe method selected: "
                   "Block Erase\n";
        }
        else if (capability.nvmeOverwriteSupported)
        {
            nvmeMethod =
                NvmeSanitizeMethod::
                    Overwrite;

            std::cout
                << "NVMe method selected: "
                   "Overwrite\n";
        }
        else
        {
            std::cout
                << "No supported NVMe "
                   "sanitize action found.\n";

            CloseHandle(deviceHandle);

            return false;
        }

        result =
            executeNvmeSanitize(
                deviceHandle,
                nvmeMethod);
    }
    else if (method ==
             SanitizationMethod::
                 HostOverwrite)
    {
        std::cout
            << "\n[5] Starting host overwrite\n";

        result =
            performOverwrite(
                deviceHandle,
                device.getCapacityBytes());
    }

    CloseHandle(
        deviceHandle);

    std::cout
        << "\nSanitization Engine Result: "
        << (result
                ? "SUCCESS"
                : "FAILED")
        << '\n';

    return result;
}