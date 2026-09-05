#pragma once

#include <cstdint>
#include <string>

struct VerificationResult
{
    bool performed = false;
    bool passed = false;

    std::uint64_t bytesVerified = 0;
    std::uint32_t samples = 0;

    std::string message;
};