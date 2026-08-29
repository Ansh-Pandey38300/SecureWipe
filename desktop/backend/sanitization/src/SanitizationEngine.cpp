#include "SanitizationEngine.h"

bool SanitizationEngine::performOverwrite(HANDLE deviceHandle, std::uint64_t totalBytes) {
   
};

bool SanitizationEngine::canSanitize(const StorageDevice &device, const SafetyResult &safetyResult)
{
   if (!safetyResult.isOverallSafe)
      return false;

   if (device.getDeviceId().empty())
      return false;

   if (device.getCapacityBytes() == 0)
      return false;

   return true;
}

bool SanitizationEngine::sanitize(const StorageDevice &device, const SafetyResult &safetyResult)
{
   if (!canSanitize(device, safetyResult))
      return false;

   return false;
}