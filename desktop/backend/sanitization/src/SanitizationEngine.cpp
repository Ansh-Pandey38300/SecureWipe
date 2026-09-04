#include "SanitizationEngine.h"
#include "NvmeSanitizer.h"
#include "HostOverwriteSanitizer.h"
#include "AtaSanitizer.h"

#include <iostream>

bool SanitizationEngine::performOverwrite(
    HANDLE deviceHandle,
    std::uint64_t totalBytes)
{
    if (deviceHandle == INVALID_HANDLE_VALUE || totalBytes == 0)
        return false;

    HostOverwriteSanitizer sanitizer;
    return sanitizer.sanitize(deviceHandle, totalBytes);
}

SanitizationMethod SanitizationEngine::selectMethod(const StorageDevice &device, const SanitizationCapability &capability) const
{
    if (device.getInterfaceType() == "NVMe")
    {
        if (capability.nvmeIdentifyAvailable &&
            capability.nativeSanitizeSupported == NativeSanitizeSupport::SUPPORTED)
        {
            return SanitizationMethod::NvmeSanitize;
        }

        return SanitizationMethod::Unsupported;
    }

    else if (device.getInterfaceType() == "SATA")
    {
        if (capability.ataIdentifyAvailable)
        {
            std::cout << "ATA capability detected.\n";

            if (capability.atasanitizeSupported)
            {
                std::cout << "ATA SANITIZE supported.\n";
                return SanitizationMethod::AtaSanitize;
            }

            std::cout << "ATA SANITIZE not supported.\n";
        }

        return SanitizationMethod::HostOverwrite;
    }

    else if (capability.isUsbDevice && capability.scsiPathAvailable)
    {
        return SanitizationMethod::HostOverwrite;
    }

    return SanitizationMethod::Unsupported;
}

bool SanitizationEngine::canSanitize(
    const StorageDevice &device,
    const SafetyResult &safetyResult)
{
    if (!safetyResult.isOverallSafe)
    {
        std::cout << "Safety Engine rejected the device.\n";
        return false;
    }

    if (device.getDeviceId().empty())
    {
        std::cout << "Device ID is missing.\n";
        return false;
    }

    if (device.getCapacityBytes() == 0)
    {
        std::cout << "Device capacity is unknown.\n";
        return false;
    }

    return true;
}

bool SanitizationEngine::sanitize(
    const StorageDevice &device,
    const SafetyResult &safetyResult)
{
    std::cout
        << "\n========================================\n"
        << " Sanitization Engine\n"
        << "========================================\n";

    // --------------------------------------------------
    // STEP 1: SAFETY
    // --------------------------------------------------

    std::cout << "\n[1] Safety validation\n";

    if (!canSanitize(device, safetyResult))
    {
        std::cout
            << "Device failed sanitization safety checks.\n";

        return false;
    }

    std::cout << "Safety validation PASSED.\n";

    // --------------------------------------------------
    // STEP 2: CAPABILITY DETECTION
    // --------------------------------------------------

    std::cout << "\n[2] Detecting sanitization capability\n";

    SanitizationCapability capability = detectSanitizationCapability(device);

    // --------------------------------------------------
    // STEP 3: METHOD SELECTION
    // --------------------------------------------------

    std::cout << "\n[3] Selecting sanitization method\n";

    SanitizationMethod method = selectMethod(device, capability);

    switch (method)
    {
    case SanitizationMethod::NvmeSanitize:
        std::cout << "Selected method: NVMe Sanitize\n";
        break;

    case SanitizationMethod::AtaSanitize:
    {
        std::cout << "Selected method: ATA Sanitize\n";
        break;
    }

    case SanitizationMethod::HostOverwrite:
        std::cout << "Selected method: Host Overwrite\n";
        break;

    case SanitizationMethod::Unsupported:
        std::cout << "No supported sanitization method found.\n";
        return false;
    }

    // --------------------------------------------------
    // STEP 4: OPEN PHYSICAL DEVICE
    // --------------------------------------------------

    std::cout << "\n[4] Opening sanitization target\n";

    HANDLE deviceHandle =
        CreateFileA(
            device.getDeviceId().c_str(),
            GENERIC_READ | GENERIC_WRITE,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            nullptr,
            OPEN_EXISTING,
            0,
            nullptr);

    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        std::cout << "Failed to open sanitization target.\n";

        std::cout
            << "Windows error: "
            << GetLastError()
            << '\n';

        return false;
    }

    std::cout << "Device opened successfully.\n";

    // --------------------------------------------------
    // STEP 5: ACTUAL SANITIZATION
    // --------------------------------------------------

    std::cout << "\n[5] Executing sanitization\n";

    bool result = false;

    switch (method)
    {
    case SanitizationMethod::NvmeSanitize:
    {
        std::cout << "Starting native NVMe sanitization.\n";

        NvmeSanitizeMethod nvmeMethod;

        // Select the strongest supported NVMe method.
        if (capability.nvmeCryptoEraseSupported)
        {
            nvmeMethod =
                NvmeSanitizeMethod::CryptoErase;

            std::cout
                << "NVMe algorithm: Crypto Erase\n";
        }
        else if (capability.nvmeBlockEraseSupported)
        {
            nvmeMethod =
                NvmeSanitizeMethod::BlockErase;

            std::cout
                << "NVMe algorithm: Block Erase\n";
        }
        else if (capability.nvmeOverwriteSupported)
        {
            nvmeMethod =
                NvmeSanitizeMethod::Overwrite;

            std::cout
                << "NVMe algorithm: Overwrite\n";
        }
        else
        {
            std::cout
                << "No supported NVMe sanitize algorithm found.\n";

            CloseHandle(deviceHandle);
            return false;
        }

        result = executeNvmeSanitize(deviceHandle, nvmeMethod);

        break;
    }

    case SanitizationMethod::AtaSanitize:
    {
        std::cout << "ATA sanitization Detected";

        AtaSanitizeMethod ataMethod;

        if (capability.atacryptoScrambleSupported)
        {
            ataMethod = AtaSanitizeMethod::CryptoScramble;
            std::cout << "ATA algorithm: Crypto Scramble EXT\n";
        }
        else if (capability.atablockEraseSupported)
        {
            ataMethod = AtaSanitizeMethod::BlockErase;
            std::cout << "ATA algorithm: Block Erase EXT\n";
        }
        else if (capability.ataoverwriteSupported)
        {
            ataMethod = AtaSanitizeMethod::Overwrite;
            std::cout << "ATA algorithm: Overwrite EXT\n";
        }
        else
        {
            std::cout << "No supported ATA sanitize algorithm found.\n";
            result = false;
            break;
        }

        result = executeAtaSanitize(deviceHandle, ataMethod);
        break;
    }

    case SanitizationMethod::HostOverwrite:
    {
        std::cout << "Starting host overwrite.\n";
        result = performOverwrite(deviceHandle, device.getCapacityBytes());
        break;
    }

    case SanitizationMethod::Unsupported:
    {
        result = false;
        break;
    }
    }

    // --------------------------------------------------
    // STEP 6: CLOSE DEVICE
    // --------------------------------------------------

    CloseHandle(deviceHandle);

    // --------------------------------------------------
    // STEP 7: FINAL RESULT
    // --------------------------------------------------

    std::cout
        << "\nSanitization Engine Result: "
        << (result ? "SUCCESS" : "FAILED")
        << '\n';

    return result;
}