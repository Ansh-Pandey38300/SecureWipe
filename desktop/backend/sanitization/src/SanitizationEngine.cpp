#include "SanitizationEngine.h"

#include <iostream>


// ============================================================
// Perform Host Overwrite
// ============================================================

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


    /*
     * Actual physical-device overwrite is intentionally
     * not executed yet.
     *
     * Before adding destructive writes, this function
     * should verify:
     *
     * 1. Device geometry
     * 2. Sector size
     * 3. Address range
     * 4. Removable-device status
     * 5. Final target identity
     *
     * The actual sanitization method will be added
     * after these checks are implemented.
     */

    std::cout
        << "Sanitization execution not implemented yet.\n";


    return false;
}


// ============================================================
// Select Sanitization Method
// ============================================================

SanitizationMethod
SanitizationEngine::selectMethod(
    const SanitizationCapability& capability) const
{
    // --------------------------------------------------------
    // Native sanitize is selected only when capability
    // detection explicitly reports SUPPORTED.
    // --------------------------------------------------------

    if (capability.nativeSanitizeSupported ==
        NativeSanitizeSupport::SUPPORTED)
    {
        return SanitizationMethod::NativeDeviceSanitize;
    }


    // --------------------------------------------------------
    // If native sanitize is not confirmed and the device
    // is USB, the current architecture falls back to the
    // HostOverwrite method.
    //
    // IMPORTANT:
    // performOverwrite() is still not implemented.
    // Therefore no destructive operation is performed.
    // --------------------------------------------------------

    if (capability.isUsbDevice)
    {
        return SanitizationMethod::HostOverwrite;
    }


    // --------------------------------------------------------
    // No method currently available.
    // --------------------------------------------------------

    return SanitizationMethod::Unsupported;
}


// ============================================================
// Check Whether Device Can Enter Sanitization Flow
// ============================================================

bool SanitizationEngine::canSanitize(
    const StorageDevice& device,
    const SafetyResult& safetyResult)
{
    // --------------------------------------------------------
    // Safety Engine must approve the device first.
    // --------------------------------------------------------

    if (!safetyResult.isOverallSafe)
        return false;


    // --------------------------------------------------------
    // Device ID must exist.
    // --------------------------------------------------------

    if (device.getDeviceId().empty())
        return false;


    // --------------------------------------------------------
    // Device capacity must be known.
    // --------------------------------------------------------

    if (device.getCapacityBytes() == 0)
        return false;


    return true;
}


// ============================================================
// Sanitization Entry Point
// ============================================================

bool SanitizationEngine::sanitize(
    const StorageDevice& device,
    const SafetyResult& safetyResult)
{
    // --------------------------------------------------------
    // STEP 1
    // Safety validation
    // --------------------------------------------------------

    if (!canSanitize(
            device,
            safetyResult))
    {
        std::cout
            << "Device failed sanitization safety checks.\n";

        return false;
    }


    // --------------------------------------------------------
    // STEP 2
    // Detect sanitization capability
    // --------------------------------------------------------

    SanitizationCapability capability =
        detectSanitizationCapability(
            device);


    // --------------------------------------------------------
    // STEP 3
    // Select sanitization method
    // --------------------------------------------------------

    SanitizationMethod method =
        selectMethod(
            capability);


    // --------------------------------------------------------
    // STEP 4
    // Method selection
    // --------------------------------------------------------

    switch (method)
    {
    case SanitizationMethod::NativeDeviceSanitize:

        std::cout
            << "Native device sanitization selected.\n";


        /*
         * Native sanitization implementation
         * will be added after capability detection
         * is completely implemented.
         */

        return false;


    case SanitizationMethod::HostOverwrite:

        std::cout
            << "Host-level overwrite selected.\n";

        break;


    case SanitizationMethod::Unsupported:

        std::cout
            << "No supported sanitization method found.\n";

        return false;
    }


    // --------------------------------------------------------
    // STEP 5
    // Open sanitization target
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
            << "Failed to open sanitization target.\n";

        return false;
    }


    // --------------------------------------------------------
    // STEP 6
    // Get target size
    // --------------------------------------------------------

    const std::uint64_t totalBytes =
        device.getCapacityBytes();


    // --------------------------------------------------------
    // STEP 7
    // Perform selected operation
    //
    // NOTE:
    // performOverwrite() currently does NOT perform
    // destructive writes. It only validates the basic
    // target information and reports that execution is
    // not implemented.
    // --------------------------------------------------------

    bool result =
        performOverwrite(
            deviceHandle,
            totalBytes);


    // --------------------------------------------------------
    // STEP 8
    // Close device
    // --------------------------------------------------------

    CloseHandle(
        deviceHandle);


    return result;
}