#include "EvidenceValidator.h"
#include <fstream>

bool EvidenceValidator::validateHeader(const std::string &filePath) const
{
    std::ifstream file(filePath, std::ios::binary);

    if (!file)
        return false;

    std::uint8_t header[3];

    file.read(reinterpret_cast<char *>(header), sizeof(header));

    if (file.gcount() != sizeof(header))
        return false;

    return header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
}

bool EvidenceValidator::validateFooter(const std::string &filePath) const
{
    std::ifstream file(filePath, std::ios::binary);

    if (!file)
        return false;
    
    
}