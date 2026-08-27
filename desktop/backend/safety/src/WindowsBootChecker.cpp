#include "WindowsBootChecker.h"

#include <Windows.h>
#include <Wbemidl.h>
#include <winioctl.h>

#include <iostream>
#include <string>

#pragma comment(lib, "wbemuuid.lib")


// ============================================================
// Convert std::wstring to std::string
// ============================================================

std::string wideToString(const std::wstring& value)
{
    if (value.empty())
    {
        return "";
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
        return "";
    }

    std::string result(size, '\0');

    WideCharToMultiByte(
        CP_UTF8,
        0,
        value.c_str(),
        -1,
        &result[0],
        size,
        nullptr,
        nullptr
    );

    // Remove terminating '\0'
    if (!result.empty() && result.back() == '\0')
    {
        result.pop_back();
    }

    return result;
}


// ============================================================
// Enable a Windows privilege
// ============================================================

bool enablePrivilege(const wchar_t* privilegeName)
{
    HANDLE tokenHandle = nullptr;


    // --------------------------------------------------------
    // Open current process token
    // --------------------------------------------------------

    if (!OpenProcessToken(
            GetCurrentProcess(),
            TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY,
            &tokenHandle))
    {
        std::cout
            << "OpenProcessToken failed. Error: "
            << GetLastError()
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Find privilege LUID
    // --------------------------------------------------------

    LUID privilegeLuid{};


    if (!LookupPrivilegeValueW(
            nullptr,
            privilegeName,
            &privilegeLuid))
    {
        std::cout
            << "LookupPrivilegeValueW failed. Error: "
            << GetLastError()
            << std::endl;

        CloseHandle(tokenHandle);

        return false;
    }


    // --------------------------------------------------------
    // Prepare privilege structure
    // --------------------------------------------------------

    TOKEN_PRIVILEGES privileges{};

    privileges.PrivilegeCount = 1;

    privileges.Privileges[0].Luid =
        privilegeLuid;

    privileges.Privileges[0].Attributes =
        SE_PRIVILEGE_ENABLED;


    // --------------------------------------------------------
    // Enable privilege
    // --------------------------------------------------------

    if (!AdjustTokenPrivileges(
            tokenHandle,
            FALSE,
            &privileges,
            sizeof(TOKEN_PRIVILEGES),
            nullptr,
            nullptr))
    {
        DWORD error = GetLastError();

        std::cout
            << "AdjustTokenPrivileges failed. Error: "
            << error
            << std::endl;

        CloseHandle(tokenHandle);

        return false;
    }


    // --------------------------------------------------------
    // IMPORTANT:
    //
    // AdjustTokenPrivileges can return TRUE even when
    // the privilege is not present in the token.
    // --------------------------------------------------------

    DWORD error = GetLastError();


    CloseHandle(tokenHandle);


    if (error == ERROR_NOT_ALL_ASSIGNED)
    {
        std::cout
            << "Privilege is not present in this process token: "
            << wideToString(privilegeName)
            << std::endl;

        return false;
    }


    return true;
}


// ============================================================
// Get Windows directory
//
// Example:
//
// C:\Windows
// ============================================================

bool getWindowsDirectory(
    std::wstring& windowsDirectory)
{
    wchar_t buffer[MAX_PATH] = {};


    UINT length =
        GetWindowsDirectoryW(
            buffer,
            MAX_PATH
        );


    if (length == 0)
    {
        std::cout
            << "GetWindowsDirectoryW failed. Error: "
            << GetLastError()
            << std::endl;

        return false;
    }


    if (length >= MAX_PATH)
    {
        return false;
    }


    windowsDirectory =
        buffer;


    return true;
}


// ============================================================
// Get Windows drive
//
// C:\Windows
//
// becomes:
//
// C:
// ============================================================

bool getWindowsDrive(
    const std::wstring& windowsDirectory,
    std::wstring& windowsDrive)
{
    if (windowsDirectory.size() < 2)
    {
        return false;
    }


    if (windowsDirectory[1] != L':')
    {
        return false;
    }


    windowsDrive =
        windowsDirectory.substr(
            0,
            2
        );


    return true;
}


// ============================================================
// Get volume GUID
//
// C:
//
// becomes:
//
// \\?\Volume{GUID}\
// ============================================================

bool getVolumeGuid(
    const std::wstring& drive,
    std::wstring& volumeGuid)
{
    std::wstring mountPoint =
        drive + L"\\";


    wchar_t buffer[MAX_PATH] = {};


    BOOL result =
        GetVolumeNameForVolumeMountPointW(
            mountPoint.c_str(),
            buffer,
            MAX_PATH
        );


    if (!result)
    {
        std::cout
            << "GetVolumeNameForVolumeMountPointW failed. Error: "
            << GetLastError()
            << std::endl;

        return false;
    }


    volumeGuid =
        buffer;


    return true;
}


// ============================================================
// Map Windows drive to physical disk
//
// C:
//  |
//  v
// \\.\C:
//  |
//  v
// IOCTL_STORAGE_GET_DEVICE_NUMBER
//  |
//  v
// PhysicalDrive0
// ============================================================

bool getPhysicalDisk(
    const std::wstring& drive,
    DWORD& diskNumber,
    DWORD& partitionNumber)
{
    std::wstring devicePath =
        L"\\\\.\\" + drive;


    HANDLE handle =
        CreateFileW(
            devicePath.c_str(),
            0,
            FILE_SHARE_READ |
            FILE_SHARE_WRITE,
            nullptr,
            OPEN_EXISTING,
            0,
            nullptr
        );


    if (handle == INVALID_HANDLE_VALUE)
    {
        std::cout
            << "CreateFileW failed for "
            << wideToString(drive)
            << ". Error: "
            << GetLastError()
            << std::endl;

        return false;
    }


    STORAGE_DEVICE_NUMBER deviceNumber = {};

    DWORD bytesReturned = 0;


    BOOL result =
        DeviceIoControl(
            handle,
            IOCTL_STORAGE_GET_DEVICE_NUMBER,
            nullptr,
            0,
            &deviceNumber,
            sizeof(deviceNumber),
            &bytesReturned,
            nullptr
        );


    CloseHandle(handle);


    if (!result)
    {
        std::cout
            << "DeviceIoControl failed. Error: "
            << GetLastError()
            << std::endl;

        return false;
    }


    diskNumber =
        deviceNumber.DeviceNumber;


    partitionNumber =
        deviceNumber.PartitionNumber;


    return true;
}


// ============================================================
// Initialize WMI
// ============================================================

bool initializeWmi(
    IWbemLocator*& locator,
    IWbemServices*& services)
{
    locator = nullptr;

    services = nullptr;


    // --------------------------------------------------------
    // Enable Backup privilege
    // --------------------------------------------------------

    std::cout
        << "Enabling Backup privilege..."
        << std::endl;


    if (!enablePrivilege(
            L"SeBackupPrivilege"))
    {
        std::cout
            << "SeBackupPrivilege could not be enabled."
            << std::endl;

        std::cout
            << "Run this program from an elevated "
               "Administrator terminal."
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Enable Restore privilege
    // --------------------------------------------------------

    std::cout
        << "Enabling Restore privilege..."
        << std::endl;


    if (!enablePrivilege(
            L"SeRestorePrivilege"))
    {
        std::cout
            << "SeRestorePrivilege could not be enabled."
            << std::endl;

        std::cout
            << "Run this program from an elevated "
               "Administrator terminal."
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Initialize COM
    // --------------------------------------------------------

    std::cout
        << "Initializing COM..."
        << std::endl;


    HRESULT result =
        CoInitializeEx(
            nullptr,
            COINIT_MULTITHREADED
        );


    bool comInitialized = SUCCEEDED(result);


    if (FAILED(result) &&
        result != RPC_E_CHANGED_MODE)
    {
        std::cout
            << "CoInitializeEx failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Initialize COM security
    // --------------------------------------------------------

    result =
        CoInitializeSecurity(
            nullptr,
            -1,
            nullptr,
            nullptr,
            RPC_C_AUTHN_LEVEL_DEFAULT,
            RPC_C_IMP_LEVEL_IMPERSONATE,
            nullptr,
            EOAC_NONE,
            nullptr
        );


    if (FAILED(result) &&
        result != RPC_E_TOO_LATE)
    {
        std::cout
            << "CoInitializeSecurity failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        if (comInitialized)
        {
            CoUninitialize();
        }

        return false;
    }


    // --------------------------------------------------------
    // Create WMI locator
    // --------------------------------------------------------

    std::cout
        << "Creating WMI locator..."
        << std::endl;


    result =
        CoCreateInstance(
            CLSID_WbemLocator,
            nullptr,
            CLSCTX_INPROC_SERVER,
            IID_IWbemLocator,
            reinterpret_cast<void**>(
                &locator
            )
        );


    if (FAILED(result))
    {
        std::cout
            << "CoCreateInstance failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        if (comInitialized)
        {
            CoUninitialize();
        }

        return false;
    }


    // --------------------------------------------------------
    // Connect to ROOT\WMI
    // --------------------------------------------------------

    std::cout
        << "Connecting to ROOT\\WMI..."
        << std::endl;


    BSTR namespaceName =
        SysAllocString(
            L"ROOT\\WMI"
        );


    if (namespaceName == nullptr)
    {
        locator->Release();

        locator = nullptr;

        if (comInitialized)
        {
            CoUninitialize();
        }

        return false;
    }


    result =
        locator->ConnectServer(
            namespaceName,
            nullptr,
            nullptr,
            nullptr,
            0,
            nullptr,
            nullptr,
            &services
        );


    SysFreeString(
        namespaceName
    );


    if (FAILED(result))
    {
        std::cout
            << "ConnectServer failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        locator->Release();

        locator = nullptr;

        if (comInitialized)
        {
            CoUninitialize();
        }

        return false;
    }


    // --------------------------------------------------------
    // Set WMI impersonation
    // --------------------------------------------------------

    std::cout
        << "Setting WMI impersonation..."
        << std::endl;


    result =
        CoSetProxyBlanket(
            services,
            RPC_C_AUTHN_WINNT,
            RPC_C_AUTHZ_NONE,
            nullptr,
            RPC_C_AUTHN_LEVEL_CALL,
            RPC_C_IMP_LEVEL_IMPERSONATE,
            nullptr,
            EOAC_NONE
        );


    if (FAILED(result))
    {
        std::cout
            << "CoSetProxyBlanket failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        services->Release();

        locator->Release();

        services = nullptr;

        locator = nullptr;

        if (comInitialized)
        {
            CoUninitialize();
        }

        return false;
    }


    std::cout
        << "WMI initialized successfully."
        << std::endl;


    return true;
}


// ============================================================
// Get SYSTEM BCD store
//
// Flow:
//
// BcdStore
//     |
//     v
// OpenStore("")
//     |
//     v
// System BCD Store
//     |
//     v
// GetSystemPartition()
// ============================================================

bool getSystemPartitionFromBcd(
    IWbemServices* services,
    std::wstring& partitionPath)
{
    partitionPath = L"";


    if (services == nullptr)
    {
        return false;
    }


    // --------------------------------------------------------
    // Get BcdStore class
    // --------------------------------------------------------

    IWbemClassObject* bcdStoreClass =
        nullptr;


    HRESULT result =
        services->GetObject(
            L"BcdStore",
            0,
            nullptr,
            &bcdStoreClass,
            nullptr
        );


    if (FAILED(result))
    {
        std::cout
            << "GetObject(BcdStore) failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Get OpenStore method
    // --------------------------------------------------------

    IWbemClassObject* inputDefinition =
        nullptr;

    IWbemClassObject* outputDefinition =
        nullptr;


    result =
        bcdStoreClass->GetMethod(
            L"OpenStore",
            0,
            &inputDefinition,
            &outputDefinition
        );


    if (FAILED(result))
    {
        std::cout
            << "GetMethod(OpenStore) failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        bcdStoreClass->Release();

        return false;
    }


    // --------------------------------------------------------
    // Create input object
    // --------------------------------------------------------

    IWbemClassObject* inputObject =
        nullptr;


    result =
        inputDefinition->SpawnInstance(
            0,
            &inputObject
        );


    if (FAILED(result))
    {
        std::cout
            << "SpawnInstance failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        inputDefinition->Release();

        outputDefinition->Release();

        bcdStoreClass->Release();

        return false;
    }


    // --------------------------------------------------------
    // Empty string = system BCD store
    // --------------------------------------------------------

    VARIANT file;

    VariantInit(&file);


    file.vt =
        VT_BSTR;


    file.bstrVal =
        SysAllocString(L"");


    if (file.bstrVal == nullptr)
    {
        inputObject->Release();

        inputDefinition->Release();

        outputDefinition->Release();

        bcdStoreClass->Release();

        return false;
    }


    result =
        inputObject->Put(
            L"File",
            0,
            &file,
            0
        );


    VariantClear(&file);


    if (FAILED(result))
    {
        std::cout
            << "Putting File failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        inputObject->Release();

        inputDefinition->Release();

        outputDefinition->Release();

        bcdStoreClass->Release();

        return false;
    }


    // --------------------------------------------------------
    // Open system BCD store
    //
    // IMPORTANT:
    // IWbemServices::ExecMethod expects BSTR
    // for object path and method name.
    // --------------------------------------------------------

    IWbemClassObject* openStoreOutput =
        nullptr;


    BSTR bcdStoreClassName =
        SysAllocString(
            L"BcdStore"
        );


    BSTR openStoreMethod =
        SysAllocString(
            L"OpenStore"
        );


    if (bcdStoreClassName == nullptr ||
        openStoreMethod == nullptr)
    {
        std::cout
            << "Failed to allocate BSTR for OpenStore."
            << std::endl;


        if (bcdStoreClassName != nullptr)
        {
            SysFreeString(
                bcdStoreClassName
            );
        }


        if (openStoreMethod != nullptr)
        {
            SysFreeString(
                openStoreMethod
            );
        }


        inputObject->Release();

        inputDefinition->Release();

        outputDefinition->Release();

        bcdStoreClass->Release();

        return false;
    }


    result =
        services->ExecMethod(
            bcdStoreClassName,
            openStoreMethod,
            0,
            nullptr,
            inputObject,
            &openStoreOutput,
            nullptr
        );


    SysFreeString(
        bcdStoreClassName
    );


    SysFreeString(
        openStoreMethod
    );


    inputObject->Release();

    inputDefinition->Release();

    outputDefinition->Release();

    bcdStoreClass->Release();


    if (FAILED(result) ||
        openStoreOutput == nullptr)
    {
        std::cout
            << "OpenStore failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Get Store object
    // --------------------------------------------------------

    VARIANT store;

    VariantInit(&store);


    result =
        openStoreOutput->Get(
            L"Store",
            0,
            &store,
            nullptr,
            nullptr
        );


    openStoreOutput->Release();


    if (FAILED(result))
    {
        std::cout
            << "Reading Store output failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        VariantClear(&store);

        return false;
    }


    // --------------------------------------------------------
    // Get IWbemClassObject from returned Store
    // --------------------------------------------------------

    IWbemClassObject* bcdStoreObject =
        nullptr;


    if (store.vt == VT_UNKNOWN &&
        store.punkVal != nullptr)
    {
        result =
            store.punkVal->QueryInterface(
                IID_IWbemClassObject,
                reinterpret_cast<void**>(
                    &bcdStoreObject
                )
            );
    }
    else
    {
        result = E_FAIL;
    }


    VariantClear(&store);


    if (FAILED(result) ||
        bcdStoreObject == nullptr)
    {
        std::cout
            << "Could not get BcdStore object. HRESULT: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Get object's WMI path
    // --------------------------------------------------------

    VARIANT objectPath;

    VariantInit(&objectPath);


    result =
        bcdStoreObject->Get(
            L"__PATH",
            0,
            &objectPath,
            nullptr,
            nullptr
        );


    if (FAILED(result) ||
        objectPath.vt != VT_BSTR ||
        objectPath.bstrVal == nullptr)
    {
        std::cout
            << "Could not get BcdStore __PATH. HRESULT: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        VariantClear(&objectPath);

        bcdStoreObject->Release();

        return false;
    }


    std::wstring bcdStorePath =
        objectPath.bstrVal;


    VariantClear(&objectPath);


    bcdStoreObject->Release();


    // --------------------------------------------------------
    // Call GetSystemPartition()
    //
    // IMPORTANT:
    // ExecMethod expects BSTR here too.
    // --------------------------------------------------------

    IWbemClassObject* partitionOutput =
        nullptr;


    BSTR objectPathBstr =
        SysAllocString(
            bcdStorePath.c_str()
        );


    BSTR methodNameBstr =
        SysAllocString(
            L"GetSystemPartition"
        );


    if (objectPathBstr == nullptr ||
        methodNameBstr == nullptr)
    {
        std::cout
            << "Failed to allocate BSTR for "
               "GetSystemPartition."
            << std::endl;


        if (objectPathBstr != nullptr)
        {
            SysFreeString(
                objectPathBstr
            );
        }


        if (methodNameBstr != nullptr)
        {
            SysFreeString(
                methodNameBstr
            );
        }


        return false;
    }


    result =
        services->ExecMethod(
            objectPathBstr,
            methodNameBstr,
            0,
            nullptr,
            nullptr,
            &partitionOutput,
            nullptr
        );


    SysFreeString(
        objectPathBstr
    );


    SysFreeString(
        methodNameBstr
    );


    if (FAILED(result) ||
        partitionOutput == nullptr)
    {
        std::cout
            << "GetSystemPartition failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        return false;
    }


    // --------------------------------------------------------
    // Read Partition
    // --------------------------------------------------------

    VARIANT partition;

    VariantInit(&partition);


    result =
        partitionOutput->Get(
            L"Partition",
            0,
            &partition,
            nullptr,
            nullptr
        );


    partitionOutput->Release();


    if (FAILED(result) ||
        partition.vt != VT_BSTR ||
        partition.bstrVal == nullptr)
    {
        std::cout
            << "Reading Partition output failed: 0x"
            << std::hex
            << result
            << std::dec
            << std::endl;

        VariantClear(&partition);

        return false;
    }


    partitionPath =
        partition.bstrVal;


    VariantClear(&partition);


    return true;
}


// ============================================================
// Map BCD device path to physical disk
//
// Example:
//
// \Device\HarddiskVolume2
//
// We enumerate volumes and compare their device names.
// ============================================================

bool getPhysicalDiskFromBcdPath(
    const std::wstring& bcdPath,
    DWORD& diskNumber,
    DWORD& partitionNumber,
    std::wstring& volumePath)
{
    HANDLE searchHandle =
        INVALID_HANDLE_VALUE;


    wchar_t volumeName[MAX_PATH] = {};


    searchHandle =
        FindFirstVolumeW(
            volumeName,
            MAX_PATH
        );


    if (searchHandle ==
        INVALID_HANDLE_VALUE)
    {
        std::cout
            << "FindFirstVolumeW failed. Error: "
            << GetLastError()
            << std::endl;

        return false;
    }


    bool found = false;


    do
    {
        HANDLE volumeHandle =
            CreateFileW(
                volumeName,
                0,
                FILE_SHARE_READ |
                FILE_SHARE_WRITE,
                nullptr,
                OPEN_EXISTING,
                0,
                nullptr
            );


        if (volumeHandle !=
            INVALID_HANDLE_VALUE)
        {
            wchar_t deviceName[512] = {};


            DWORD length =
                QueryDosDeviceW(
                    volumeName + 4,
                    deviceName,
                    512
                );


            if (length > 0)
            {
                std::wstring currentDevice =
                    deviceName;


                if (_wcsicmp(
                        currentDevice.c_str(),
                        bcdPath.c_str()) == 0)
                {
                    STORAGE_DEVICE_NUMBER deviceNumber = {};

                    DWORD bytesReturned = 0;


                    BOOL result =
                        DeviceIoControl(
                            volumeHandle,
                            IOCTL_STORAGE_GET_DEVICE_NUMBER,
                            nullptr,
                            0,
                            &deviceNumber,
                            sizeof(deviceNumber),
                            &bytesReturned,
                            nullptr
                        );


                    if (result)
                    {
                        diskNumber =
                            deviceNumber.DeviceNumber;


                        partitionNumber =
                            deviceNumber.PartitionNumber;


                        volumePath =
                            volumeName;


                        found = true;
                    }
                    else
                    {
                        std::cout
                            << "DeviceIoControl failed while "
                               "mapping BCD volume. Error: "
                            << GetLastError()
                            << std::endl;
                    }
                }
            }


            CloseHandle(
                volumeHandle
            );
        }


        if (found)
        {
            break;
        }


    }
    while (
        FindNextVolumeW(
            searchHandle,
            volumeName,
            MAX_PATH
        )
    );


    FindVolumeClose(
        searchHandle
    );


    return found;
}


// ============================================================
// WindowsBootChecker
// ============================================================

BootInfo WindowsBootChecker::checkBootInfo()
{
    std::cout
        << std::endl
        << "========================================"
        << std::endl;


    std::cout
        << "WindowsBootChecker started"
        << std::endl;


    std::cout
        << "========================================"
        << std::endl;


    // ========================================================
    // STEP 1
    // Detect UEFI / BIOS
    // ========================================================

    FIRMWARE_TYPE firmwareType;


    if (!GetFirmwareType(
            &firmwareType))
    {
        std::cout
            << "GetFirmwareType failed. Error: "
            << GetLastError()
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            false,
            false
        );
    }


    bool isUefi =
        firmwareType ==
        FirmwareTypeUefi;


    std::cout
        << "UEFI: "
        << isUefi
        << std::endl;


    // ========================================================
    // STEP 2
    // Find Windows directory
    // ========================================================

    std::wstring windowsDirectory;


    if (!getWindowsDirectory(
            windowsDirectory))
    {
        std::cout
            << "getWindowsDirectory failed."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    std::cout
        << "Windows Directory: "
        << wideToString(
            windowsDirectory
        )
        << std::endl;


    // ========================================================
    // STEP 3
    // Find Windows drive
    // ========================================================

    std::wstring windowsDrive;


    if (!getWindowsDrive(
            windowsDirectory,
            windowsDrive))
    {
        std::cout
            << "getWindowsDrive failed."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    std::cout
        << "Windows Drive: "
        << wideToString(
            windowsDrive
        )
        << std::endl;


    // ========================================================
    // STEP 4
    // Get Windows volume GUID
    // ========================================================

    std::wstring systemVolumeGuid;


    if (!getVolumeGuid(
            windowsDrive,
            systemVolumeGuid))
    {
        std::cout
            << "getVolumeGuid failed."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    std::cout
        << "Windows Volume: "
        << wideToString(
            systemVolumeGuid
        )
        << std::endl;


    // ========================================================
    // STEP 5
    // Map Windows drive to physical disk
    // ========================================================

    DWORD systemDiskNumber =
        0;


    DWORD systemPartitionNumber =
        0;


    if (!getPhysicalDisk(
            windowsDrive,
            systemDiskNumber,
            systemPartitionNumber))
    {
        std::cout
            << "getPhysicalDisk failed."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    std::cout
        << "Windows Physical Disk: PhysicalDrive"
        << systemDiskNumber
        << std::endl;


    std::cout
        << "Windows Partition Number: "
        << systemPartitionNumber
        << std::endl;


    // ========================================================
    // STEP 6
    // Initialize WMI
    // ========================================================

    IWbemLocator* locator =
        nullptr;


    IWbemServices* services =
        nullptr;


    if (!initializeWmi(
            locator,
            services))
    {
        std::cout
            << "initializeWmi failed."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    // ========================================================
    // STEP 7
    // Get system partition from BCD
    // ========================================================

    std::wstring bootPartitionDevice;


    bool bootPartitionFound =
        getSystemPartitionFromBcd(
            services,
            bootPartitionDevice
        );


    // ========================================================
    // WMI cleanup
    // ========================================================

    services->Release();

    locator->Release();

    CoUninitialize();


    if (!bootPartitionFound)
    {
        std::cout
            << "Boot partition was NOT found."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    std::cout
        << "BCD Boot Partition Device: "
        << wideToString(
            bootPartitionDevice
        )
        << std::endl;


    // ========================================================
    // STEP 8
    // Map boot partition to physical disk
    // ========================================================

    DWORD bootDiskNumber =
        0;


    DWORD bootPartitionNumber =
        0;


    std::wstring bootVolumePath;


    if (!getPhysicalDiskFromBcdPath(
            bootPartitionDevice,
            bootDiskNumber,
            bootPartitionNumber,
            bootVolumePath))
    {
        std::cout
            << "Could not map boot partition to physical disk."
            << std::endl;

        return BootInfo(
            "",
            "",
            "",
            "",
            isUefi,
            false
        );
    }


    std::cout
        << "Boot Physical Disk: PhysicalDrive"
        << bootDiskNumber
        << std::endl;


    std::cout
        << "Boot Partition Number: "
        << bootPartitionNumber
        << std::endl;


    std::cout
        << "Boot Volume: "
        << wideToString(
            bootVolumePath
        )
        << std::endl;


    // ========================================================
    // STEP 9
    // Create disk IDs
    // ========================================================

    std::string bootDiskId =
        "\\\\.\\PhysicalDrive" +
        std::to_string(
            bootDiskNumber
        );


    std::string systemDiskId =
        "\\\\.\\PhysicalDrive" +
        std::to_string(
            systemDiskNumber
        );


    // ========================================================
    // STEP 10
    // Create partition paths
    // ========================================================

    std::string bootPartitionPath =
        wideToString(
            bootVolumePath
        );


    std::string systemPartitionPath =
        wideToString(
            systemVolumeGuid
        );


    // ========================================================
    // STEP 11
    // Success
    // ========================================================

    std::cout
        << "========================================"
        << std::endl;


    std::cout
        << "WindowsBootChecker SUCCESS"
        << std::endl;


    std::cout
        << "========================================"
        << std::endl;


    return BootInfo(
        bootDiskId,
        systemDiskId,
        bootPartitionPath,
        systemPartitionPath,
        isUefi,
        true
    );
}