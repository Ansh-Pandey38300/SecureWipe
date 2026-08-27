#include <iostream>
#include <vector>

#include "SafetyEngine.h"
#include "StorageDevice.h"


int main()
{
    std::cout
        << "========================================\n";

    std::cout
        << "      SafetyEngine Target Test\n";

    std::cout
        << "========================================\n\n";


    /*
     * Device originally selected by the user.
     */
    StorageDevice selectedDevice(
        "\\\\.\\PhysicalDrive1",
        "Test USB Drive",
        "TEST-SERIAL-001",
        64000000000ULL,
        "USB",
        false,
        true,
        false
    );


    SafetyEngine safetyEngine;

    safetyEngine.setExpectedTarget(
        selectedDevice
    );


    /*
     * Simulate a fresh discovery.
     *
     * The selected target is still present
     * with the same identity.
     */
    std::vector<StorageDevice> freshDevices;

    freshDevices.emplace_back(
        "\\\\.\\PhysicalDrive0",
        "System Drive",
        "SYSTEM-SERIAL",
        512000000000ULL,
        "NVMe",
        true,
        false,
        false
    );

    freshDevices.emplace_back(
        "\\\\.\\PhysicalDrive1",
        "Test USB Drive",
        "TEST-SERIAL-001",
        64000000000ULL,
        "USB",
        false,
        true,
        false
    );


    /*
     * target represents the device that will be used
     * after successful validation.
     */
    StorageDevice target =
        selectedDevice;


    bool validationResult =
        safetyEngine.validateTarget(
            freshDevices,
            target
        );


    std::cout
        << "Target Validation: ";

    if (validationResult)
    {
        std::cout
            << "PASSED\n";
    }
    else
    {
        std::cout
            << "FAILED\n";
    }


    if (validationResult)
    {
        std::cout
            << "\nValidated Target:\n";

        std::cout
            << "Device ID : "
            << target.getDeviceId()
            << "\n";

        std::cout
            << "Model     : "
            << target.getModel()
            << "\n";

        std::cout
            << "Serial    : "
            << target.getSerialNumber()
            << "\n";

        std::cout
            << "Capacity  : "
            << target.getCapacityBytes()
            << "\n";
    }


    /*
     * Test the failure case.
     *
     * The fresh discovery contains a different device,
     * so validation must fail.
     */
    std::vector<StorageDevice> wrongDevices;

    wrongDevices.emplace_back(
        "\\\\.\\PhysicalDrive2",
        "Different USB Drive",
        "DIFFERENT-SERIAL",
        32000000000ULL,
        "USB",
        false,
        true,
        false
    );


    StorageDevice wrongTarget =
        selectedDevice;


    bool mismatchResult =
        safetyEngine.validateTarget(
            wrongDevices,
            wrongTarget
        );


    std::cout
        << "\nMismatch Test: ";

    if (!mismatchResult)
    {
        std::cout
            << "PASSED\n";
    }
    else
    {
        std::cout
            << "FAILED\n";
    }


    std::cout
        << "\n========================================\n";

    return 0;
}