#pragma once

#include <Windows.h>
#include <cstdint>
#include "../../storage/include/StorageDevice.h"
#include "../../safety/include/SafetyEngine.h"
#include "../../safety/include/SafetyResult.h"
#include "SanitizationMethod.h"
#include "SanitizationCapability.h"

class SanitizationEngine
{
private:
    bool performOverwrite(HANDLE deviceHandle, std::uint64_t totalBytes);

public:
    SanitizationMethod selectMethod(
        const StorageDevice &device,
        const SanitizationCapability &capability) const;
        
    bool canSanitize(const StorageDevice &device, const SafetyResult &safetyResult);

    bool sanitize(const StorageDevice &device, const SafetyResult &safetyResult);
};