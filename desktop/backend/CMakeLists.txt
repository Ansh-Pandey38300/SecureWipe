add_library(
    SecureWipeStorage

    storage/src/StorageDevice.cpp
    storage/src/StorageManager.cpp

    discovery/src/WindowsStorageDiscovery.cpp

    classification/src/DeviceClassifier.cpp

    safety/src/BootInfo.cpp
    safety/src/WindowsBootChecker.cpp

    safety/src/WindowsStorageUtils.cpp
    safety/src/SafetyEngine.cpp

    sanitization/src/SanitizationEngine.cpp
    sanitization/src/SanitizationCapability.cpp
    sanitization/src/ScsiCapability.cpp
    sanitization/src/StoragePropertyCapability.cpp
)

target_include_directories(
    SecureWipeStorage
    PUBLIC
    storage/include
    discovery/include
    classification/include
    safety/include
    sanitization/include
)

if(WIN32)
    target_link_libraries(
        SecureWipeStorage
        PUBLIC
            wbemuuid
            setupapi
    )
endif()

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

add_executable(
    SanitizationEngineTest
    tests/SanitizationEngineTest.cpp
)

add_executable(
   SanitizationCapabilityTest
    tests/SanitizationCapabilityTest.cpp
)

set(STORAGE_TESTS
    StorageDeviceTest
    StorageManagerTest
    WindowsStorageDiscoveryTest
    DeviceClassifierTest
    WindowsBootCheckerTest
    SafetyEngineTest
    SanitizationEngineTest
    SanitizationCapabilityTest
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
)

target_link_libraries(
    ${TEST_TARGET}
    PRIVATE
        SecureWipeStorage
)

endforeach()

