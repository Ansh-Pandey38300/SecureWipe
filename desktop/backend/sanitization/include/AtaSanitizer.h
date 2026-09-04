#pragma once
#include <Windows.h>

enum class AtaSanitizeMethod
{
    CryptoScramble,
    BlockErase,
    Overwrite
};

bool executeAtaSanitize(HANDLE deviceHandle, AtaSanitizeMethod method);