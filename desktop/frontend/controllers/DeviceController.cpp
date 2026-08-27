#include "DeviceController.h"

#include "../services/StorageService.h"

DeviceController::DeviceController(QObject *parent)
    : QObject(parent),
      storageService_(new StorageService()),
      devices_()
{
}

const std::vector<StorageDevice> &DeviceController::devices() const
{
    return devices_;
}

void DeviceController::refreshDevices()
{
    try
    {
        devices_ = storageService_->discoverDevices();

        emit devicesUpdated();
    }
    catch (const std::exception &exception)
    {
        emit discoveryFailed(
            QString::fromStdString(exception.what())
        );
    }
    catch (...)
    {
        emit discoveryFailed(
            QStringLiteral("Unknown error occurred while discovering storage devices.")
        );
    }
}