
#include "SanitizationEngine.h"

#include "NvmeSanitizer.h"
#include "HostOverwriteSanitizer.h"
#include "AtaSanitizer.h"

#include <iostream>
#include <chrono>

using SecureWipe::SanitizationErrorCode;
using SecureWipe::SanitizationResult;
using SecureWipe::SanitizationStatus;
using SecureWipe::VerificationStatus;

VerificationResult SanitizationEngine::performOverwrite(
    HANDLE deviceHandle,
    std::uint64_t totalBytes)
{
    VerificationResult result;

    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        result.message = "Invalid device handle.";
        return result;
    }

    if (totalBytes == 0)
    {
        result.message = "Device capacity is zero.";
        return result;
    }

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

bool SanitizationEngine::canSanitize(const StorageDevice &device, const SafetyResult &safetyResult)
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

SanitizationResult SanitizationEngine::sanitize(const StorageDevice &device, const SafetyResult &safetyResult)
{
    SanitizationResult result;

    result.deviceId = device.getDeviceId();
    result.model = device.getModel();
    result.serialNumber = device.getSerialNumber();
    result.interfaceType = device.getInterfaceType();
    result.capacityBytes = device.getCapacityBytes();

    result.status = SanitizationStatus::IN_PROGRESS;
    result.verificationStatus = VerificationStatus::NOT_PERFORMED;

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
        result.status = SanitizationStatus::FAILED;
        result.error = SanitizationErrorCode::SAFETY_VALIDATION_FAILED;
        result.message = "Device failed sanitization safety checks.";
        result.errorMessage = result.message;

        std::cout << result.message << '\n';

        return result;
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
        std::cout << "Selected method: ATA Sanitize\n";
        break;

    case SanitizationMethod::HostOverwrite:
        std::cout << "Selected method: Host Overwrite\n";
        break;

    case SanitizationMethod::Unsupported:
        std::cout << "No supported sanitization method found.\n";
        break;
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
        result.status = SanitizationStatus::FAILED;
        result.error = SanitizationErrorCode::DEVICE_OPEN_FAILED;
        result.nativeErrorCode =
            static_cast<std::uint32_t>(GetLastError());

        result.errorMessage = "Failed to open sanitization target.";
        result.message = result.errorMessage;

        return result;
    }

    std::cout << "Device opened successfully.\n";

    const auto startTime = std::chrono::steady_clock::now();
    // --------------------------------------------------
    // STEP 5: ACTUAL SANITIZATION
    // --------------------------------------------------

    std::cout << "\n[5] Executing sanitization\n";

    bool executionResult = false;

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
            std::cout << "No supported NVMe sanitize algorithm found.\n";
            result.status = SanitizationStatus::FAILED;
            result.error = SanitizationErrorCode::NVME_ALGORITHM_UNAVAILABLE;
            result.message = "No supported NVMe sanitize algorithm found.";
            result.errorMessage = result.message;

            CloseHandle(deviceHandle);
            return result;
        }

        executionResult = executeNvmeSanitize(deviceHandle, nvmeMethod);

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
            result.status = SanitizationStatus::FAILED;
            result.error = SanitizationErrorCode::ATA_ALGORITHM_UNAVAILABLE;
            result.message = "No supported ATA sanitize algorithm found.";
            result.errorMessage = result.message;

            return result;
        }

        executionResult = executeAtaSanitize(deviceHandle, ataMethod);
        break;
    }

case SanitizationMethod::HostOverwrite:
{
    std::cout << "Starting host overwrite.\n";

    verificationResult =
        performOverwrite(
            deviceHandle,
            device.getCapacityBytes());

    executionResult = verificationResult.passed;

    break;
}

    case SanitizationMethod::Unsupported:
        result.status = SanitizationStatus::FAILED;
        result.error = SanitizationErrorCode::UNSUPPORTED_SANITIZATION_METHOD;
        result.message = "No supported sanitization method found.";
        result.errorMessage = result.message;

        std::cout << result.message << '\n';

        return result;
    }

    const auto endTime = std::chrono::steady_clock::now();

    result.operationDurationMs = static_cast<std::uint64_t>(std::chrono::duration_cast<std::chrono::milliseconds>(endTime - startTime).count());

    // --------------------------------------------------
    // STEP 6: CLOSE DEVICE
    // --------------------------------------------------

    CloseHandle(deviceHandle);

    // --------------------------------------------------
    // STEP 7: FINAL RESULT
    // --------------------------------------------------

    if (method == SanitizationMethod::HostOverwrite)
{
    result.verificationPerformed =
        verificationResult.performed;

    result.verificationStatus =
        verificationResult.performed
            ? (verificationResult.passed
                   ? VerificationStatus::PASSED
                   : VerificationStatus::FAILED)
            : VerificationStatus::NOT_PERFORMED;

    result.bytesVerified =
        verificationResult.bytesVerified;

    result.verificationSamples =
        verificationResult.samples;

    result.verificationMessage =
        verificationResult.message;
}

    if (executionResult)
    {
        result.status = SanitizationStatus::COMPLETED;
        result.bytesProcessed = device.getCapacityBytes();
        result.message = "Sanitization completed successfully.";
    }
    else
    {
        result.status = SanitizationStatus::FAILED;

        if (result.error == SanitizationErrorCode::NONE)
        {
            result.error =
                SanitizationErrorCode::SANITIZATION_EXECUTION_FAILED;
        }

        if (result.message.empty())
        {
            result.message = "Sanitization execution failed.";
        }

        result.errorMessage = result.message;
    }

    std::cout
        << "\nSanitization Engine Result: "
        << (executionResult ? "SUCCESS" : "FAILED")
        << '\n';

    return result;
}