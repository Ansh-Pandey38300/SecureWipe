#pragma once

#include <Windows.h>
#include <cstdint>
#include "../../storage/include/StorageDevice.h"
#include "../../safety/include/SafetyEngine.h"
#include "../../safety/include/SafetyResult.h"
#include "SanitizationMethod.h"
#include "SanitizationCapability.h"
#include "SanitizationResult.h"
#include "HostOverwriteSanitizer.h"

class SanitizationEngine
{
private:
    VerificationResult performOverwrite(HANDLE deviceHandle, std::uint64_t totalBytes);

public:
    SanitizationMethod selectMethod(
        const StorageDevice &device,
        const SanitizationCapability &capability) const;

    bool canSanitize(const StorageDevice &device, const SafetyResult &safetyResult);

    SanitizationResult sanitize(const StorageDevice &device, const SafetyResult &safetyResult);
};