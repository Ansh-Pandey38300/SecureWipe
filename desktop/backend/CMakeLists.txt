add_library(SecureWipeStorage
  storage/src/StorageDevice.cpp
  storage/src/StorageManager.cpp
)

target_include_directories(
    SecureWipeStorage
    PUBLIC
    storage/include
)

add_executable(
    StorageDeviceTest
    tests/StorageDeviceTest.cpp
)

add_executable(
    StorageManagerTest
    tests/StorageManagerTest.cpp
)


target_include_directories(StorageDeviceTest
    PRIVATE
        storage/include
)

target_link_directories(
    StorageManagerTest
    PRIVATE
    storage/include)

target_link_libraries(StorageDeviceTest
    PRIVATE
        SecureWipeStorage
)

target_link_libraries(StorageManagerTest
    PRIVATE
        SecureWipeStorage
)