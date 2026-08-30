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
    bool isUsbDevice = false;

    bool scsiPathAvailable = false;

    bool storagePropertyQueryAvailable = false;

    NativeSanitizeSupport nativeSanitizeSupported =
        NativeSanitizeSupport::UNKNOWN;
};


SanitizationCapability detectSanitizationCapability(
    const StorageDevice& device);