#include "SafetyEngine.h"

//Save the copy of the device selected by the user from the frontend

void SafetyEngine::setExpectedTarget(const StorageDevice&device){

    expectedTarget_.deviceId=device.getDeviceId();

    expectedTarget_.model=device.getModel();

    expectedTarget_.serialNumber=device.getSerialNumber();

     expectedTarget_.capacityBytes =device.getCapacityBytes();

   hasExpectedTarget_=true;
}

//Find the selected device from freshly 
// //discovered devices
// bool SafetyEngine::findTarget(const std::vector<StorageDevice>& devices,StorageDevice& target){
//      if(!hasExpectedTarget_)return false;


//     }

// Check 1: Current System Disk
bool checkSystemDisk(const StorageDevice &device)
{
    if (device.isSystemDisk())
        return false;
    return true;
}

// Check 2: Current Boot Dependency
bool checkBootDependency(const StorageDevice &device)
{
    return true;
}

// Check 3: Mounted / In-use Volumes
bool checkMountedVolume(const StorageDevice &device)
{
    return true;
}

// Check 4: OS Dependencies
bool checkOSDependencies(const StorageDevice &device)
{
    return true;
}

// Check 5: Physical Device Validation
bool checkPhysicalDevice(const StorageDevice &device)
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
bool checkTargetIdentity(const StorageDevice &device)
{
    /*
    Check that the selected target has enough information
    to identify it correctly before sanitization.

    This prevents SecureWipe from wiping the wrong device
    when the target cannot be clearly identified.
    */

    if (device.getDeviceId() !=expectedTarget_.deviceId)
        return false;


    if (device.getModel() !=expectedTarget_.model)
        return false;

    if (device.getSerialNumber() !=expectedTarget_.serialNumber)
        return false;
    

    if (device.getCapacityBytes() !=expectedTarget_.capacityBytes)
        return false;

    return true;
}



bool SafetyEngine::evaluate(const StorageDevice &device)
{
    // Check 1:
    if (!checkSystemDisk(device))
        return false;

    // Check 2:
    if (!checkBootDependency(device))
        return false;

    // Check 3:
    if (!checkMountedVolume(device))
        return false;

    // Check 4:
    if (!checkOSDependencies(device))
        return false;

    // Check 5:
    if (!checkPhysicalDevice(device))
        return false;

    // Check 6:
    if (!checkTargetIdentity(device))
        return false;

    return true;
}