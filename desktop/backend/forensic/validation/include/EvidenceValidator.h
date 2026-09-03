#pragma once

#include "EvidenceItem.h"

#include <string>

class EvidenceValidator
{
public:
    bool validateHeader(const std::string &filePath) const;
    bool validateFooter(const std::string &filePath) const;
    bool validateSize(const EvidenceItem &item) const;
};