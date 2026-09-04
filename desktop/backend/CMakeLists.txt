find_package(libjpeg-turbo CONFIG REQUIRED)

add_library(
    SecureWipeStorage

    # ------------------------------------------------------------
    # Storage
    # ------------------------------------------------------------

    storage/src/StorageDevice.cpp
    storage/src/StorageManager.cpp

    # ------------------------------------------------------------
    # Discovery
    # ------------------------------------------------------------

    discovery/src/WindowsStorageDiscovery.cpp

    # ------------------------------------------------------------
    # Classification
    # ------------------------------------------------------------

    classification/src/DeviceClassifier.cpp

    # ------------------------------------------------------------
    # Safety
    # ------------------------------------------------------------

    safety/src/BootInfo.cpp
    safety/src/WindowsBootChecker.cpp
    safety/src/WindowsStorageUtils.cpp
    safety/src/SafetyEngine.cpp

    # ------------------------------------------------------------
    # Sanitization
    # ------------------------------------------------------------

    sanitization/src/SanitizationEngine.cpp
    sanitization/src/SanitizationCapability.cpp
    sanitization/src/ScsiCapability.cpp
    sanitization/src/StoragePropertyCapability.cpp

    # NVMe
    sanitization/src/NvmeCapability.cpp
    sanitization/src/NvmeSanitizer.cpp

    # ATA
    sanitization/src/AtaCapability.cpp
    sanitization/src/AtaSanitizer.cpp

    # Generic host overwrite
    sanitization/src/HostOverwriteSanitizer.cpp

    # ------------------------------------------------------------
    # Forensics
    # ------------------------------------------------------------

    forensic/evidence/src/EvidenceCollector.cpp
    forensic/validation/src/EvidenceValidator.cpp
    forensic/hashing/src/HashCalculator.cpp
    forensic/scoring/src/ConfidenceScorer.cpp
)

target_include_directories(
    SecureWipeStorage
    PUBLIC
        storage/include
        discovery/include
        classification/include
        safety/include
        sanitization/include
        forensic/evidence/include
        forensic/validation/include
        forensic/hashing/include
        forensic/scoring/include
)

if(WIN32)
    target_link_libraries(
        SecureWipeStorage
        PUBLIC
            wbemuuid
            setupapi
            bcrypt
            libjpeg-turbo::jpeg
    )
endif()

# ============================================================
# Core Tests
# ============================================================

add_executable(
    StorageDeviceTest
    tests/StorageDeviceTest.cpp
)

add_executable(
    StorageManagerTest
    tests/StorageManagerTest.cpp
)

add_executable(
    WindowsStorageDiscoveryTest
    tests/WindowsStorageDiscoveryTest.cpp
)

add_executable(
    DeviceClassifierTest
    tests/DeviceClassifierTest.cpp
)

add_executable(
    WindowsBootCheckerTest
    tests/WindowsBootCheckerTest.cpp
)

add_executable(
    SafetyEngineTest
    tests/SafetyEngineTest.cpp
)

# ============================================================
# Sanitization Tests
# ============================================================

add_executable(
    SanitizationEngineTest
    tests/SanitizationEngineTest.cpp
)

add_executable(
    SanitizationCapabilityTest
    tests/SanitizationCapabilityTest.cpp
)

add_executable(
    NvmeCapabilityTest
    tests/NvmeCapabilityTest.cpp
)

add_executable(
    AtaCapabilityTest
    tests/AtaCapabilityTest.cpp
)

add_executable(
    SanitizationMethodSelectionTest
    tests/SanitizationMethodSelectionTest.cpp
)

add_executable(
    HostOverwriteSanitizerTest
    tests/HostOverwriteSanitizerTest.cpp
)

# ============================================================
# Forensic Tests
# ============================================================

add_executable(
    EvidenceCollectorTest
    tests/forensic/evidence/EvidenceCollectorTest.cpp
)

add_executable(
    HashCalculatorTest
    tests/forensic/hashing/HashCalculatorTest.cpp
)

add_executable(
    ConfidenceScorerTest
    tests/forensic/scoring/ConfidenceScorerTest.cpp
)

# ============================================================
# Test Targets
# ============================================================

set(STORAGE_TESTS
    # Core
    StorageDeviceTest
    StorageManagerTest
    WindowsStorageDiscoveryTest
    DeviceClassifierTest
    WindowsBootCheckerTest
    SafetyEngineTest

    # Sanitization
    SanitizationEngineTest
    SanitizationCapabilityTest
    NvmeCapabilityTest
    AtaCapabilityTest
    SanitizationMethodSelectionTest
    HostOverwriteSanitizerTest

    # Forensics
    EvidenceCollectorTest
    HashCalculatorTest
    ConfidenceScorerTest
)

foreach(TEST_TARGET IN LISTS STORAGE_TESTS)

    target_include_directories(
        ${TEST_TARGET}
        PRIVATE
            storage/include
            discovery/include
            classification/include
            safety/include
            sanitization/include
            forensic/evidence/include
            forensic/validation/include
            forensic/hashing/include
            forensic/scoring/include
    )

    target_link_libraries(
        ${TEST_TARGET}
        PRIVATE
            SecureWipeStorage
    )

endforeach()