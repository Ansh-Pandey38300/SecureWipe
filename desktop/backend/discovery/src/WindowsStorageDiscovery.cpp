#include "WindowsStorageDiscovery.h"

#include <windows.h>
#include <setupapi.h>
#include <ntddstor.h>
#include <winioctl.h>

#include <cstdint>
#include <iostream>
#include <string>
#include <vector>
#include <utility>

#pragma comment(lib, "setupapi.lib")


// ============================================================
// Helper: Convert std::wstring -> std::string
// ============================================================

static std::string wideToString(const std::wstring& value)
{
    if (value.empty())
    {
        return {};
    }

    int size = WideCharToMultiByte(
        CP_UTF8,
        0,
        value.c_str(),
        -1,
        nullptr,
        0,
        nullptr,
        nullptr
    );

    if (size <= 0)
    {
        return {};
    }

    std::string result(size - 1, '\0');

    WideCharToMultiByte(
        CP_UTF8,
        0,
        value.c_str(),
        -1,
        result.data(),
        size,
        nullptr,
        nullptr
    );

    return result;
}


// ============================================================
// Helper: Convert bus type to readable text
// ============================================================

static std::string getBusTypeName(STORAGE_BUS_TYPE busType)
{
    switch (busType)
    {
        case BusTypeScsi:
            return "SCSI";

        case BusTypeAtapi:
            return "ATAPI";

        case BusTypeAta:
            return "ATA";

        case BusType1394:
            return "IEEE1394";

        case BusTypeSsa:
            return "SSA";

        case BusTypeFibre:
            return "Fibre Channel";

        case BusTypeUsb:
            return "USB";

        case BusTypeRAID:
            return "RAID";

        case BusTypeiScsi:
            return "iSCSI";

        case BusTypeSas:
            return "SAS";

        case BusTypeSata:
            return "SATA";

        case BusTypeSd:
            return "SD";

        case BusTypeMmc:
            return "MMC";

        case BusTypeVirtual:
            return "Virtual";

        case BusTypeFileBackedVirtual:
            return "File-backed Virtual";

        case BusTypeSpaces:
            return "Storage Spaces";

        case BusTypeNvme:
            return "NVMe";

        case BusTypeSCM:
            return "SCM";

        case BusTypeUfs:
            return "UFS";

        default:
            return "Unknown";
    }
}


// ============================================================
// Helper: Get PhysicalDrive number
// ============================================================

static bool getPhysicalDriveNumber(
    const std::wstring& deviceInterfacePath,
    DWORD& deviceNumber)
{
    HANDLE deviceHandle = CreateFileW(
        deviceInterfacePath.c_str(),
        0,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        nullptr,
        OPEN_EXISTING,
        0,
        nullptr
    );

    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    STORAGE_DEVICE_NUMBER storageDeviceNumber{};
    DWORD bytesReturned = 0;

    bool success = DeviceIoControl(
        deviceHandle,
        IOCTL_STORAGE_GET_DEVICE_NUMBER,
        nullptr,
        0,
        &storageDeviceNumber,
        sizeof(storageDeviceNumber),
        &bytesReturned,
        nullptr
    );

    CloseHandle(deviceHandle);

    if (!success)
    {
        return false;
    }

    deviceNumber = storageDeviceNumber.DeviceNumber;

    return true;
}


// ============================================================
// Helper: Get model, serial number, bus type and removable state
// ============================================================

static bool getStorageDescriptor(
    const std::wstring& physicalDrivePath,
    std::string& model,
    std::string& serialNumber,
    std::string& interfaceType,
    bool& isRemovable)
{
    HANDLE deviceHandle = CreateFileW(
        physicalDrivePath.c_str(),
        0,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        nullptr,
        OPEN_EXISTING,
        0,
        nullptr
    );

    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    STORAGE_PROPERTY_QUERY query{};

    query.PropertyId = StorageDeviceProperty;
    query.QueryType = PropertyStandardQuery;

    // --------------------------------------------------------
    // First call: find required buffer size
    // --------------------------------------------------------

    STORAGE_DESCRIPTOR_HEADER header{};
    DWORD bytesReturned = 0;

    bool success = DeviceIoControl(
        deviceHandle,
        IOCTL_STORAGE_QUERY_PROPERTY,
        &query,
        sizeof(query),
        &header,
        sizeof(header),
        &bytesReturned,
        nullptr
    );

    if (!success ||
        header.Size < sizeof(STORAGE_DEVICE_DESCRIPTOR))
    {
        CloseHandle(deviceHandle);
        return false;
    }

    // --------------------------------------------------------
    // Allocate buffer
    // --------------------------------------------------------

    std::vector<BYTE> buffer(header.Size);

    // --------------------------------------------------------
    // Second call: get actual descriptor
    // --------------------------------------------------------

    success = DeviceIoControl(
        deviceHandle,
        IOCTL_STORAGE_QUERY_PROPERTY,
        &query,
        sizeof(query),
        buffer.data(),
        static_cast<DWORD>(buffer.size()),
        &bytesReturned,
        nullptr
    );

    if (!success)
    {
        CloseHandle(deviceHandle);
        return false;
    }

    auto descriptor =
        reinterpret_cast<STORAGE_DEVICE_DESCRIPTOR*>(
            buffer.data()
        );

    // --------------------------------------------------------
    // Model / Product ID
    // --------------------------------------------------------

    if (descriptor->ProductIdOffset != 0 &&
        descriptor->ProductIdOffset < buffer.size())
    {
        const char* product =
            reinterpret_cast<const char*>(
                buffer.data() + descriptor->ProductIdOffset
            );

        model = product;
    }

    // --------------------------------------------------------
    // Serial Number
    // --------------------------------------------------------

    if (descriptor->SerialNumberOffset != 0 &&
        descriptor->SerialNumberOffset < buffer.size())
    {
        const char* serial =
            reinterpret_cast<const char*>(
                buffer.data() + descriptor->SerialNumberOffset
            );

        serialNumber = serial;
    }

    // --------------------------------------------------------
    // Bus Type
    // --------------------------------------------------------

    interfaceType =
        getBusTypeName(descriptor->BusType);

    // --------------------------------------------------------
    // Removable Media
    // --------------------------------------------------------

    isRemovable =
        descriptor->RemovableMedia != FALSE;

    CloseHandle(deviceHandle);

    return true;
}


// ============================================================
// Helper: Get seek penalty
// ============================================================

static bool getSeekPenalty(
    const std::wstring& physicalDrivePath,
    bool& hasSeekPenalty)
{
    HANDLE deviceHandle = CreateFileW(
        physicalDrivePath.c_str(),
        0,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        nullptr,
        OPEN_EXISTING,
        0,
        nullptr
    );

    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    STORAGE_PROPERTY_QUERY query{};

    query.PropertyId =
        StorageDeviceSeekPenaltyProperty;

    query.QueryType =
        PropertyStandardQuery;

    DEVICE_SEEK_PENALTY_DESCRIPTOR seekPenaltyDescriptor{};

    DWORD bytesReturned = 0;

    bool success = DeviceIoControl(
        deviceHandle,
        IOCTL_STORAGE_QUERY_PROPERTY,
        &query,
        sizeof(query),
        &seekPenaltyDescriptor,
        sizeof(seekPenaltyDescriptor),
        &bytesReturned,
        nullptr
    );

    CloseHandle(deviceHandle);

    if (!success)
    {
        return false;
    }

    hasSeekPenalty =
        seekPenaltyDescriptor.IncursSeekPenalty != FALSE;

    return true;
}


// ============================================================
// Helper: Get disk capacity
// ============================================================

static bool getDiskCapacity(
    const std::wstring& physicalDrivePath,
    std::uint64_t& capacityBytes)
{
    HANDLE deviceHandle = CreateFileW(
        physicalDrivePath.c_str(),
        0,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        nullptr,
        OPEN_EXISTING,
        0,
        nullptr
    );

    if (deviceHandle == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    GET_LENGTH_INFORMATION lengthInformation{};
    DWORD bytesReturned = 0;

    bool success = DeviceIoControl(
        deviceHandle,
        IOCTL_DISK_GET_LENGTH_INFO,
        nullptr,
        0,
        &lengthInformation,
        sizeof(lengthInformation),
        &bytesReturned,
        nullptr
    );

    CloseHandle(deviceHandle);

    if (!success)
    {
        return false;
    }

    capacityBytes =
        static_cast<std::uint64_t>(
            lengthInformation.Length.QuadPart
        );

    return true;
}


// ============================================================
// Helper: Find the PhysicalDrive containing Windows
// ============================================================

static bool getSystemDiskNumber(DWORD& systemDiskNumber)
{
    WCHAR windowsDirectory[MAX_PATH]{};

    DWORD length = GetWindowsDirectoryW(
        windowsDirectory,
        MAX_PATH
    );

    if (length == 0 || length >= MAX_PATH)
    {
        return false;
    }

    WCHAR volumePath[MAX_PATH]{};

    if (!GetVolumePathNameW(
            windowsDirectory,
            volumePath,
            MAX_PATH))
    {
        return false;
    }

    std::wstring volumeDevicePath = L"\\\\.\\";

    volumeDevicePath += volumePath;

    if (!volumeDevicePath.empty() &&
        volumeDevicePath.back() == L'\\')
    {
        volumeDevicePath.pop_back();
    }

    HANDLE volumeHandle = CreateFileW(
        volumeDevicePath.c_str(),
        0,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        nullptr,
        OPEN_EXISTING,
        0,
        nullptr
    );

    if (volumeHandle == INVALID_HANDLE_VALUE)
    {
        return false;
    }

    STORAGE_DEVICE_NUMBER storageDeviceNumber{};
    DWORD bytesReturned = 0;

    bool success = DeviceIoControl(
        volumeHandle,
        IOCTL_STORAGE_GET_DEVICE_NUMBER,
        nullptr,
        0,
        &storageDeviceNumber,
        sizeof(storageDeviceNumber),
        &bytesReturned,
        nullptr
    );

    CloseHandle(volumeHandle);

    if (!success)
    {
        return false;
    }

    systemDiskNumber =
        storageDeviceNumber.DeviceNumber;

    return true;
}


// ============================================================
// Main discovery function
// ============================================================

std::vector<StorageDevice>
WindowsStorageDiscovery::discover()
{
    std::vector<StorageDevice> devices;


    // ========================================================
    // STEP 1
    // Directly ask Windows for PRESENT DISK INTERFACES
    // ========================================================

    HDEVINFO deviceInfoSet = SetupDiGetClassDevsW(
        &GUID_DEVINTERFACE_DISK,
        nullptr,
        nullptr,
        DIGCF_PRESENT | DIGCF_DEVICEINTERFACE
    );

    if (deviceInfoSet == INVALID_HANDLE_VALUE)
    {
        return devices;
    }


    // ========================================================
    // STEP 2
    // Find the physical disk containing Windows
    // ========================================================

    DWORD systemDiskNumber = 0;

    bool hasSystemDiskNumber =
        getSystemDiskNumber(systemDiskNumber);


    // ========================================================
    // STEP 3
    // Enumerate disk interfaces directly
    // ========================================================

    for (DWORD index = 0; ; ++index)
    {
        SP_DEVICE_INTERFACE_DATA interfaceData{};

        interfaceData.cbSize =
            sizeof(SP_DEVICE_INTERFACE_DATA);


        if (!SetupDiEnumDeviceInterfaces(
                deviceInfoSet,
                nullptr,
                &GUID_DEVINTERFACE_DISK,
                index,
                &interfaceData))
        {
            break;
        }


        std::cout
            << "\nFOUND DISK INTERFACE: "
            << index
            << "\n";


        // ====================================================
        // STEP 4
        // Find required buffer size
        // ====================================================

        DWORD requiredSize = 0;

        SetupDiGetDeviceInterfaceDetailW(
            deviceInfoSet,
            &interfaceData,
            nullptr,
            0,
            &requiredSize,
            nullptr
        );

        if (requiredSize == 0)
        {
            std::cout
                << "Could not determine required buffer size.\n";

            continue;
        }


        // ====================================================
        // STEP 5
        // Allocate buffer
        // ====================================================

        std::vector<BYTE> buffer(requiredSize);


        // ====================================================
        // STEP 6
        // Treat buffer as interface detail structure
        // ====================================================

        auto detailData =
            reinterpret_cast<
                SP_DEVICE_INTERFACE_DETAIL_DATA_W*
            >(
                buffer.data()
            );

        detailData->cbSize =
            sizeof(SP_DEVICE_INTERFACE_DETAIL_DATA_W);


        // ====================================================
        // STEP 7
        // Get Device Interface Path
        // ====================================================

        if (!SetupDiGetDeviceInterfaceDetailW(
                deviceInfoSet,
                &interfaceData,
                detailData,
                requiredSize,
                nullptr,
                nullptr))
        {
            std::cout
                << "Could not get Device Interface Path.\n";

            continue;
        }


        std::wstring deviceInterfacePath =
            detailData->DevicePath;


        std::wcout
            << L"Device Interface Path: "
            << deviceInterfacePath
            << L"\n";


        // ====================================================
        // STEP 8
        // Get PhysicalDrive number
        // ====================================================

        DWORD physicalDiskNumber = 0;

        if (!getPhysicalDriveNumber(
                deviceInterfacePath,
                physicalDiskNumber))
        {
            std::wcout
                << L"PhysicalDrive mapping FAILED.\n";

            continue;
        }


        // ====================================================
        // STEP 9
        // Build PhysicalDrive path
        // ====================================================

        std::wstring physicalDrivePath =
            L"\\\\.\\PhysicalDrive" +
            std::to_wstring(physicalDiskNumber);


        std::wcout
            << L"Physical Drive: "
            << physicalDrivePath
            << L"\n";


        // ====================================================
        // STEP 10
        // Get model, serial, interface and removable state
        // ====================================================

        std::string model = "Unknown";
        std::string serialNumber = "Unknown";
        std::string interfaceType = "Unknown";

        bool isRemovable = false;

        getStorageDescriptor(
            physicalDrivePath,
            model,
            serialNumber,
            interfaceType,
            isRemovable
        );


        // ====================================================
        // STEP 11
        // Get capacity
        // ====================================================

        std::uint64_t capacityBytes = 0;

        getDiskCapacity(
            physicalDrivePath,
            capacityBytes
        );


        // ====================================================
        // STEP 12
        // Get seek penalty
        // ====================================================

        bool hasSeekPenalty = false;

        getSeekPenalty(
            physicalDrivePath,
            hasSeekPenalty
        );


        // ====================================================
        // STEP 13
        // Check whether this is the system disk
        // ====================================================

        bool isSystemDisk =
            hasSystemDiskNumber &&
            physicalDiskNumber == systemDiskNumber;


        // ====================================================
        // STEP 14
        // Device ID
        // ====================================================

        std::string deviceId =
            wideToString(physicalDrivePath);


        // ====================================================
        // STEP 15
        // Create StorageDevice
        // ====================================================

        StorageDevice device(
            deviceId,
            model,
            serialNumber,
            capacityBytes,
            interfaceType,
            isSystemDisk,
            isRemovable,
            hasSeekPenalty
        );


        // ====================================================
        // STEP 16
        // Add to result
        // ====================================================

        devices.push_back(
            std::move(device)
        );


        // ====================================================
        // STEP 17
        // Temporary output
        // ====================================================

        std::cout
            << "Model          : "
            << model
            << "\n";

        std::cout
            << "Serial Number  : "
            << serialNumber
            << "\n";

        std::cout
            << "Capacity       : "
            << capacityBytes
            << " bytes\n";

        std::cout
            << "Interface Type : "
            << interfaceType
            << "\n";

        std::cout
            << "System Disk    : "
            << (isSystemDisk ? "YES" : "NO")
            << "\n";

        std::cout
            << "Removable      : "
            << (isRemovable ? "YES" : "NO")
            << "\n";

        std::cout
            << "Seek Penalty   : "
            << (hasSeekPenalty ? "YES" : "NO")
            << "\n";
    }


    // ========================================================
    // STEP 18
    // Cleanup
    // ========================================================

    SetupDiDestroyDeviceInfoList(
        deviceInfoSet
    );


    // ========================================================
    // STEP 19
    // Return discovered devices
    // ========================================================

    return devices;
}