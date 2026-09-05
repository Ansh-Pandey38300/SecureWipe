#pragma once

#include "VerificationResult.h"
#include <Windows.h>
#include <cstdint>
#include <cstddef>
#include <string>

class HostOverwriteSanitizer
{
public:
    VerificationResult sanitize(HANDLE deviceHandle, std::uint64_t totalBytes);

private:
    bool overwrite(HANDLE deviceHandle, std::uint64_t totalBytes);
    VerificationResult verify(HANDLE deviceHandle, std::uint64_t totalBytes);

    static constexpr std::size_t BUFFER_SIZE = 4 * 1024 * 1024;
};