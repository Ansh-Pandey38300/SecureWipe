#include "DeviceClassifier.h"

ClassificationResult DeviceClassifier::classify(const StorageDevice &device)
{
    ClassificationResult result{};

    result.mediaType = MediaType::Unknown;
    result.busType = BusType::Unknown;
    result.deviceType = DeviceType::Unknown;
    result.isSystemDisk = device.isSystemDisk();

    const std::string &interfaceType = device.getInterfaceType();

    if (interfaceType == "NVMe")
    {
        result.busType = BusType::NVMe;
    }
    else if (interfaceType == "SATA")
    {
        result.busType = BusType::SATA;
    }
    else if (interfaceType == "USB")
    {
        result.busType = BusType::USB;
    }
    else if (interfaceType == "SAS")
    {
        result.busType = BusType::SAS;
    }

    return result;
}