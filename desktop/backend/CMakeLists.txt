add_library(SecureWipeStorage
  storage/src/StorageDevice.cpp
  storage/src/StorageManager.cpp
  discovery/src/WindowsStorageDiscovery.cpp
)

target_include_directories(
    SecureWipeStorage
    PUBLIC
    storage/include
    discovery/include
)

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

set(STORAGE_TESTS
    StorageDeviceTest
    StorageManagerTest
    WindowsStorageDiscoveryTest
)

foreach(TEST_TARGET IN LISTS STORAGE_TESTS)

target_include_directories(
    ${TEST_TARGET}
    PRIVATE
        storage/include
        discovery/include
)

target_link_libraries(
    ${TEST_TARGET}
    PRIVATE
        SecureWipeStorage
)

endforeach()

