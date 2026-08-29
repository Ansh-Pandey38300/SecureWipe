#include <Windows.h>
#include <iostream>
#include "SafetyEngine.h"
#include "WindowsStorageUtils.h"

// Save the copy of the device selected by the user from the frontend

void SafetyEngine::setExpectedTarget(const StorageDevice &device)
{

    expectedTarget_.deviceId = device.getDeviceId();

    expectedTarget_.model = device.getModel();

    expectedTarget_.serialNumber = device.getSerialNumber();

    expectedTarget_.capacityBytes = device.getCapacityBytes();

    hasExpectedTarget_ = true;
}

// Check 1: Current System Disk
bool SafetyEngine::checkSystemDisk(const StorageDevice &device)
{
    if (device.isSystemDisk())
        return false;
    return true;
}

// // Check 2: Current Boot Dependency
// bool SafetyEngine::checkBootDependency(const StorageDevice &device)
// {
//     return true;
// }

// Check 3: Mounted / In-use Volumes
// target device ke volumes currently use/mounted toh nahi hain?
bool SafetyEngine::checkMountedVolume(
    const StorageDevice &device)
{
    DWORD targetDiskNumber = 0;

    if (!WindowsStorageUtils::getDiskNumberFromDeviceId(
            device.getDeviceId(),
            targetDiskNumber))
    {
        return false;
    }

    WCHAR volumeName[MAX_PATH]{};

    HANDLE findHandle =
        FindFirstVolumeW(
            volumeName,
            ARRAYSIZE(volumeName));

    if (findHandle == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    while (true)
    {
        DWORD pathBufferSize = MAX_PATH;

        std::vector<WCHAR> pathBuffer(
            pathBufferSize);

        DWORD returnedLength = 0;

        BOOL pathsSuccess =
            GetVolumePathNamesForVolumeNameW(
                volumeName,
                pathBuffer.data(),
                pathBufferSize,
                &returnedLength);

        if (pathsSuccess)
        {
            WCHAR *currentPath =
                pathBuffer.data();

            while (*currentPath != L'\0')
            {
                std::wstring mountedPath =
                    currentPath;

                if (mountedPath.size() >= 3 &&
                    mountedPath[1] == L':' &&
                    mountedPath[2] == L'\\')
                {
                    // Example:
                    // mountedPath = E:\
                    // drive       = E:

                    std::wstring drive =
                        mountedPath.substr(0, 2);

                    DWORD volumeDiskNumber = 0;
                    DWORD partitionNumber = 0;

                    if (WindowsStorageUtils::getPhysicalDisk(
                            drive,
                            volumeDiskNumber,
                            partitionNumber))
                    {
                        if (volumeDiskNumber ==
                            targetDiskNumber)
                        {
                            FindVolumeClose(
                                findHandle);

                            std::cout
                                << "Mounted volume found on target disk\n";

                            return false;
                        }
                    }
                }

                currentPath +=
                    wcslen(currentPath) + 1;
            }
        }

        if (!FindNextVolumeW(
                findHandle,
                volumeName,
                ARRAYSIZE(volumeName)))
        {
            break;
        }
    }

    FindVolumeClose(findHandle);

    return true;
}

// Check 5: Physical Device Validation
bool SafetyEngine::checkPhysicalDevice(const StorageDevice &device)
{

    /*
        Check whether the discovered storage device has the
        minimum physical-device information required before
        a destructive operation.

        This check validates the device description itself.
        It does NOT verify the user's selected target identity.
    */

    if (device.getDeviceId().empty())
    {
        return false;
    }

    if (device.getModel().empty())
    {
        return false;
    }

    if (device.getSerialNumber().empty())
    {
        return false;
    }

    if (device.getCapacityBytes() == 0)
    {
        return false;
    }

    if (device.getInterfaceType().empty())
    {
        return false;
    }

    return true;
}

// Check 6: Target Identity
bool SafetyEngine::checkTargetIdentity(const StorageDevice &device)
{
    if (!hasExpectedTarget_)
        return false;

    /*
    Check that the selected target has enough information
    to identify it correctly before sanitization.

    This prevents SecureWipe from wiping the wrong device
    when the target cannot be clearly identified.
    */

    if (device.getDeviceId() != expectedTarget_.deviceId)
        return false;

    if (device.getModel() != expectedTarget_.model)
        return false;

    if (device.getSerialNumber() != expectedTarget_.serialNumber)
        return false;

    if (device.getCapacityBytes() != expectedTarget_.capacityBytes)
        return false;

    return true;
}

SafetyResult SafetyEngine::evaluateWithResult(const StorageDevice &device)
{
    SafetyResult result;
    // Check 1:
    if (checkSystemDisk(device))
    {
        result.checks.push_back({"System Disk Check",
                                 true,
                                 "Target is not the current Windows system disk."});
    }
    else
    {
        result.checks.push_back({"System Disk Check",
                                 false,
                                 "Target is the current Windows system disk."});
        result.isOverallSafe = false;
    }

    // // Check 2:
    if (checkBootDependency(device))
    {
        result.checks.push_back({"Boot Dependency Check",
                                 true,
                                 "Target is not currently required for the boot process."});
    }
    else
    {
        result.checks.push_back({"Boot Dependency Check",
                                 false,
                                 "The current Windows boot process depends on this device."});
        result.isOverallSafe = false;
    }

    // Check 3:
    if (checkMountedVolume(device))
    {
        result.checks.push_back({"Mounted Volume Check",
                                 true,
                                 "No mounted or actively used volume was detected on the target."});
    }
    else
    {
        result.checks.push_back({"Mounted Volume Check",
                                 false,
                                 "A volume on the target disk is currently mounted or in use."});

        result.isOverallSafe = false;
    }

    // Check 5:
    if (checkPhysicalDevice(device))
    {
        result.checks.push_back({"Physical Device Check",
                                 true,
                                 "Required physical device information is available."});
    }
    else
    {
        result.checks.push_back({"Physical Device Check",
                                 false,
                                 "Required physical device information is missing."});

        result.isOverallSafe = false;
    }

    // Check 6:
    if (checkTargetIdentity(device))
    {
        result.checks.push_back({"Target Identity Check",
                                 true,
                                 "Target matches the device originally selected by the user."});
    }
    else
    {
        result.checks.push_back({"Target Identity Check",
                                 false,
                                 "Target does not match the device originally selected by the user."});

        result.isOverallSafe = false;
    }

    if (result.isOverallSafe)
    {
        result.decision = "SAFE";

        result.summary =
            "All safety checks passed. "
            "Sanitization may proceed.";
    }
    else
    {
        result.decision = "BLOCKED";

        result.summary =
            "One or more safety checks failed. "
            "Sanitization must not proceed.";
    }

    return result;
};

bool SafetyEngine::validateTarget(const std::vector<StorageDevice> &devices, StorageDevice &target)
{
    if (!hasExpectedTarget_)
        return false;

    for (std::size_t i = 0; i < devices.size(); ++i)
    {
        if (checkTargetIdentity(devices[i]))
        {
            return true;
        }
    }

    return false;
}

bool SafetyEngine::evaluate(const StorageDevice &device)
{
    SafetyResult result = evaluateWithResult(device);
    return result.isOverallSafe;
}