#include <iostream>
#include <vector>

#include "SafetyEngine.h"
#include "StorageDevice.h"
#include "WindowsStorageDiscovery.h"


void printDevice(
    const StorageDevice& device,
    std::size_t index)
{
    std::cout << "\n[" << index << "]\n";

    std::cout
        << "Device ID : "
        << device.getDeviceId()
        << "\n";

    std::cout
        << "Model     : "
        << device.getModel()
        << "\n";

    std::cout
        << "Serial    : "
        << device.getSerialNumber()
        << "\n";

    std::cout
        << "Capacity  : "
        << device.getCapacityBytes()
        << " bytes\n";

    std::cout
        << "Interface : "
        << device.getInterfaceType()
        << "\n";
}


void printSafetyResult(
    const SafetyResult& result)
{
    std::cout << "\n";
    std::cout
        << "========================================\n";

    std::cout
        << "        SAFETY ENGINE TEST REPORT\n";

    std::cout
        << "========================================\n";

    std::cout
        << "\nSafety Checks:\n";

    std::cout
        << "----------------------------------------\n";

    for (const auto& check : result.checks)
    {
        std::cout
            << check.checkName
            << " : "
            << (check.passed ? "PASS" : "FAIL")
            << "\n";

        std::cout
            << "  "
            << check.message
            << "\n\n";
    }

    std::cout
        << "----------------------------------------\n";

    std::cout
        << "Overall Safety : "
        << (result.isOverallSafe ? "PASS" : "FAIL")
        << "\n";

    std::cout
        << "Decision       : "
        << result.decision
        << "\n";

    std::cout
        << "Summary        : "
        << result.summary
        << "\n";

    std::cout
        << "========================================\n";
}


int main()
{
    std::cout
        << "========================================\n";

    std::cout
        << "     SecureWipe SafetyEngine Test\n";

    std::cout
        << "========================================\n";


    WindowsStorageDiscovery discovery;


    std::cout
        << "\n[STEP 1] Initial Device Discovery\n";

    std::cout
        << "----------------------------------------\n";


    std::vector<StorageDevice> devices =
        discovery.discover();


    if (devices.empty())
    {
        std::cout
            << "No storage devices detected.\n";

        return 1;
    }


    std::cout
        << "Detected Devices: "
        << devices.size()
        << "\n";


    for (std::size_t i = 0;
         i < devices.size();
         ++i)
    {
        printDevice(
            devices[i],
            i);
    }


    std::cout
        << "\nEnter device number to test: ";


    std::size_t selectedIndex;

    std::cin
        >> selectedIndex;


    if (selectedIndex >= devices.size())
    {
        std::cout
            << "Invalid device selection.\n";

        return 1;
    }


    StorageDevice selectedDevice =
        devices[selectedIndex];


    std::cout
        << "\n[STEP 2] Selected Target\n";

    std::cout
        << "----------------------------------------\n";


    printDevice(
        selectedDevice,
        selectedIndex);


    SafetyEngine safetyEngine;


    safetyEngine.setExpectedTarget(
        selectedDevice);


    std::cout
        << "\nTarget identity saved.\n";


    std::cout
        << "\n[STEP 3] Fresh Device Discovery\n";

    std::cout
        << "----------------------------------------\n";


    std::vector<StorageDevice> freshDevices =
        discovery.discover();


    std::cout
        << "Freshly detected devices: "
        << freshDevices.size()
        << "\n";


    for (std::size_t i = 0;
         i < freshDevices.size();
         ++i)
    {
        printDevice(
            freshDevices[i],
            i);
    }


    std::cout
        << "\n[STEP 4] Target Validation\n";

    std::cout
        << "----------------------------------------\n";


    StorageDevice validatedTarget =
        selectedDevice;


    bool validationResult =
        safetyEngine.validateTarget(
            freshDevices,
            validatedTarget);


    std::cout
        << "Target Validation: "
        << (validationResult ? "PASSED" : "FAILED")
        << "\n";


    if (!validationResult)
    {
        std::cout
            << "\nTarget validation failed.\n";

        std::cout
            << "The selected device is no longer present "
               "or its identity has changed.\n";

        std::cout
            << "\nFINAL DECISION: BLOCKED\n";

        return 0;
    }


    std::cout
        << "\nValidated Target:\n";


    printDevice(
        validatedTarget,
        selectedIndex);


    std::cout
        << "\n[STEP 5] Safety Evaluation\n";

    std::cout
        << "----------------------------------------\n";


    SafetyResult safetyResult =
        safetyEngine.evaluateWithResult(
            validatedTarget);


    printSafetyResult(
        safetyResult);


    std::cout
        << "\n[STEP 6] Sanitization Gate\n";

    std::cout
        << "----------------------------------------\n";


    if (safetyResult.isOverallSafe)
    {
        std::cout
            << "Sanitization Gate: OPEN\n";

        std::cout
            << "All required safety checks passed.\n";

        std::cout
            << "Sanitization may proceed.\n";
    }
    else
    {
        std::cout
            << "Sanitization Gate: BLOCKED\n";

        std::cout
            << "One or more safety checks failed.\n";

        std::cout
            << "Sanitization must not proceed.\n";
    }


    std::cout
        << "\n========================================\n";

    std::cout
        << "             TEST COMPLETED\n";

    std::cout
        << "========================================\n";


    return 0;
}