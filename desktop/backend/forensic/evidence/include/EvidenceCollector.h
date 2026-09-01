#pragma once
#include <Windows.h>
#include "EvidenceItem.h"
#include <vector>

class EvidenceCollector
{

private:
    std::string detectFileType(const std::vector<std::uint8_t> &buffer, std::size_t offset) const;

    std::size_t findEndOffset(const std::vector<std::uint8_t> &buffer, std::size_t startOffset) const;

   bool readChunk(HANDLE deviceHandle, std::vector<std::uint8_t> &buffer);

    bool carveArtifacts(const std::vector<std::uint8_t> &buffer, std::size_t startOffset, std::size_t endOffset, const std::string &outputPath) const;

    std::uint64_t findArtifactEnd(const std::vector<std::uint8_t> &buffer, std::size_t offset, const std::string &fileType) const;

    std::string generateArtifactId(std::uint64_t index) const;

public:
    std::vector<EvidenceItem> collect(const std::string &source);
};