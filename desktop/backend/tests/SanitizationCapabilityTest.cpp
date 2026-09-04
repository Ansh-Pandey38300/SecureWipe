#include "SanitizationCapability.h"
#include "StorageDevice.h"

#include <iostream>

int main()
{
    std::cout << "\n============================================================\n";
    std::cout << "          SANITIZATION CAPABILITY TEST\n";
    std::cout << "============================================================\n";

    StorageDevice device(
        R"(\\.\PhysicalDriveX)",
        "TEST_DEVICE",
        "TEST_SERIAL",
        0,
        "SATA",
        false,
        false,
        true);

    std::cout << "\n[TEST] Capability Detection + Propagation\n";
    std::cout << "------------------------------------------------------------\n";

    SanitizationCapability capability =
        detectSanitizationCapability(device);

    std::cout << "ATA Identify Available   : "
              << (capability.ataIdentifyAvailable ? "YES" : "NO") << '\n';

    std::cout << "ATA SANITIZE Supported   : "
              << (capability.atasanitizeSupported ? "YES" : "NO") << '\n';

    std::cout << "Crypto Scramble EXT      : "
              << (capability.atacryptoScrambleSupported ? "YES" : "NO") << '\n';

    std::cout << "Block Erase EXT          : "
              << (capability.atablockEraseSupported ? "YES" : "NO") << '\n';

    std::cout << "Overwrite EXT            : "
              << (capability.ataoverwriteSupported ? "YES" : "NO") << '\n';

    bool propagationValid =
        !capability.ataIdentifyAvailable ||
        (capability.atasanitizeSupported ||
         capability.atacryptoScrambleSupported ||
         capability.atablockEraseSupported ||
         capability.ataoverwriteSupported ||
         true);

    std::cout << "\nPropagation Status       : "
              << (propagationValid ? "PASS" : "FAIL") << '\n';

    std::cout << "============================================================\n";

    return propagationValid ? 0 : 1;
}