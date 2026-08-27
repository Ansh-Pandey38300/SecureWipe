#include <Windows.h>
#include <iostream>
#include <string>

bool getWindowsDirectory(std::wstring &windowsDirectory)
{
    wchar_t buffer[MAX_PATH] = {};

    UINT length = GetWindowsDirectoryW(
        buffer,
        MAX_PATH);

    if (length == 0)
    {
        return false;
    }

    windowsDirectory = buffer;

    return true;
}

bool getWindowsDrive(const std::wstring &windowsDirectory, std::wstring &windowsDrive)
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
        windowsDirectory.substr(0, 2);

    return true;
}

bool getVolumeGuid(std::wstring &windowsDrive, std::wstring &volumeGuid)
{
    std::wstring mountPoint = windowsDrive + L"\\";

    wchar_t buffer[MAX_PATH] = {};

    BOOL result = GetVolumeNameForVolumeMountPointW(mountPoint.c_str(), buffer, MAX_PATH);

    if (!result)
    {
        std::cout << "Failed to get volume GUID\n";
        return false;
    }

    volumeGuid = buffer;

    return true;
}

bool getPhysicalDisk(
    const std::wstring &drive,
    DWORD &diskNumber,
    DWORD &partitionNumber)
{
    std::wstring devicePath = L"\\\\.\\" + drive;

    HANDLE handle = CreateFileW(
        devicePath.c_str(),                 // \\.\C:
        0,                                  // special read/write access nahi
        FILE_SHARE_READ | FILE_SHARE_WRITE, // sharing allow
        nullptr,                            // default security
        OPEN_EXISTING,                      // existing device open karo
        0,                                  // default flags
        nullptr                             // template nahi
    );

    if (handle == INVALID_HANDLE_VALUE)
    {
        std::cout << "Failed to open drive\n";
        return false;
    }

    STORAGE_DEVICE_NUMBER deviceNumber = {};
    DWORD bytesReturned = 0;

    BOOL result = DeviceIoControl(
        handle,
        IOCTL_STORAGE_GET_DEVICE_NUMBER,
        nullptr,
        0,
        &deviceNumber,
        sizeof(deviceNumber),
        &bytesReturned,
        nullptr);

    CloseHandle(handle);

    if (!result)
    {
        std::cout << "Failed to get physical disk\n";
        return false;
    }

    diskNumber = deviceNumber.DeviceNumber;
    partitionNumber = deviceNumber.PartitionNumber;
}

int main()
{
    std::wstring windowsDirectory;

    if (getWindowsDirectory(windowsDirectory))
    {
        std::wcout << L"Windows Directory: " << windowsDirectory << "\n";
    }
    else
    {
        std::cout << "Failed" << "\n";
    }

    std::wstring windowsDrive;

    if (!getWindowsDrive(
            windowsDirectory,
            windowsDrive))
    {
        std::cout << "Failed to get Windows drive" << "\n";
        return 1;
    }

    std::wcout << L"Windows Drive: " << windowsDrive << "\n";

    std::wstring volumeGuid;
    if (!getVolumeGuid(windowsDrive, volumeGuid))
    {
        std::cout << "Failed to get volume GUID\n";
        return 1;
    }

    std::wcout << L"Windows Volume: " << volumeGuid << "\n";

    DWORD diskNumber = 0;
    DWORD partitionNumber = 0;

    if (!getPhysicalDisk(windowsDrive, diskNumber, partitionNumber))
    {
        std::cout << "Failed to get physical disk\n";
        return 1;
    }

    std::cout << "Physical Disk: PhysicalDrive" << diskNumber << "\n";
    std::cout << "Partition Number: " << partitionNumber << "\n";

    return 0;
}