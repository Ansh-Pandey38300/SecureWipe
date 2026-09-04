#include "HostOverwriteSanitizer.h"

#include <algorithm>
#include <iostream>
#include <vector>

bool HostOverwriteSanitizer::verify(HANDLE deviceHandle, std::uint64_t totalBytes)
{
    constexpr std::size_t VERIFY_SIZE = 4096;
    std::vector<std::uint8_t> buffer(VERIFY_SIZE);

    const std::uint64_t offsets[] = {
        0,
        totalBytes / 4,
        totalBytes / 2,
        (totalBytes * 3) / 4,
        totalBytes > VERIFY_SIZE ? totalBytes - VERIFY_SIZE : 0};

    for (std::uint64_t offset : offsets)
    {
        LARGE_INTEGER position;
        position.QuadPart = static_cast<LONGLONG>(offset);

        if (!SetFilePointerEx(deviceHandle, position, nullptr, FILE_BEGIN))
            return false;

        DWORD bytesRead = 0;

        if (!ReadFile(deviceHandle, buffer.data(), VERIFY_SIZE, &bytesRead, nullptr))
            return false;

        if (bytesRead != VERIFY_SIZE)
            return false;

        if (!std::all_of(buffer.begin(), buffer.end(),
                         [](std::uint8_t value)
                         { return value == 0x00; }))
            return false;
    }

    std::cout << "Host overwrite verification passed.\n";
    return true;
}

bool HostOverwriteSanitizer::overwrite(HANDLE deviceHandle, std::uint64_t totalBytes)
{
    std::vector<std::uint8_t> buffer(BUFFER_SIZE, 0x00);
    std::uint64_t offset = 0;

    while (offset < totalBytes)
    {
        const DWORD bytesToWrite = static_cast<DWORD>(
            std::min<std::uint64_t>(BUFFER_SIZE, totalBytes - offset));

        LARGE_INTEGER position;
        position.QuadPart = static_cast<LONGLONG>(offset);

        if (!SetFilePointerEx(deviceHandle, position, nullptr, FILE_BEGIN))
            return false;

        DWORD bytesWritten = 0;

        if (!WriteFile(deviceHandle, buffer.data(), bytesToWrite, &bytesWritten, nullptr))
            return false;

        if (bytesWritten != bytesToWrite)
            return false;

        offset += bytesWritten;

        const int progress = static_cast<int>((offset * 100) / totalBytes);
        std::cout << "\rHost overwrite: " << progress << "%" << std::flush;
    }

    std::cout << "\nHost overwrite completed.\n";
    return true;
}

bool HostOverwriteSanitizer::sanitize(HANDLE deviceHandle, std::uint64_t totalBytes)
{
    if (deviceHandle == INVALID_HANDLE_VALUE || totalBytes == 0)
        return false;

    if (!overwrite(deviceHandle, totalBytes))
        return false;

    if (!FlushFileBuffers(deviceHandle))
        return false;

    return verify(deviceHandle, totalBytes);
}