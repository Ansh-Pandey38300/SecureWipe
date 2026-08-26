add_library(SecureWipeStorage
  storage/src/StorageDevice.cpp
  storage/src/StorageManager.cpp
  discovery/src/WindowsStorageDiscovery.cpp
  classification/src/DeviceClassifier.cpp
)

target_include_directories(
    SecureWipeStorage
    PUBLIC
    storage/include
    discovery/include
    classification/include
)

if(WIN32)
    target_link_libraries(
        SecureWipeStorage
        PUBLIC
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

set(STORAGE_TESTS
    StorageDeviceTest
    StorageManagerTest
    WindowsStorageDiscoveryTest
    DeviceClassifierTest
)

foreach(TEST_TARGET IN LISTS STORAGE_TESTS)

target_include_directories(
    ${TEST_TARGET}
    PRIVATE
        storage/include
        discovery/include
        classification/include
)

target_link_libraries(
    ${TEST_TARGET}
    PRIVATE
        SecureWipeStorage
)

endforeach()

