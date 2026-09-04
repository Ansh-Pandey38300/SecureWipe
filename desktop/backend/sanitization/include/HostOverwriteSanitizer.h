#pragma once
#include <Windows.h>
#include <cstdint>
#include <cstddef>

class HostOverwriteSanitizer
{
public:
    bool sanitize(
        HANDLE deviceHandle,
        std::uint64_t totalBytes);

private:
    bool overwrite(
        HANDLE deviceHandle,
        std::uint64_t totalBytes);

    bool verify(
        HANDLE deviceHandle,
        std::uint64_t totalBytes);

    static constexpr std::size_t BUFFER_SIZE =
        4 * 1024 * 1024;
};