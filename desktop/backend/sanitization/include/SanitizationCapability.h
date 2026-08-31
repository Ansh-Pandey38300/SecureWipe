#pragma once

#include "StorageDevice.h"

enum class NativeSanitizeSupport
{
    UNKNOWN,
    NOT_SUPPORTED,
    SUPPORTED
};

struct SanitizationCapability
{
    // USB Supported

    bool isUsbDevice = false;

    bool scsiPathAvailable = false;

    bool storagePropertyQueryAvailable = false;

    NativeSanitizeSupport nativeSanitizeSupported =
        NativeSanitizeSupport::UNKNOWN;

    // NVME Supported

    bool nvmeIdentifyAvailable = false;

    bool nvmeBlockEraseSupported = false;

    bool nvmeCryptoEraseSupported = false;

    bool nvmeOverwriteSupported = false;
};

SanitizationCapability detectSanitizationCapability(
    const StorageDevice &device);
