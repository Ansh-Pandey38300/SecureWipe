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
    return 0;
}