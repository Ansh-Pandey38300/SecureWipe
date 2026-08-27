#pragma once

#include <QObject>
#include <vector>

#include "StorageDevice.h"

class StorageService;

class DeviceController : public QObject
{
    Q_OBJECT

public:
    explicit DeviceController(QObject *parent = nullptr);

    const std::vector<StorageDevice> &devices() const;

public slots:
    void refreshDevices();

signals:
    void devicesUpdated();
    void discoveryFailed(const QString &message);

private:
    StorageService *storageService_;
    std::vector<StorageDevice> devices_;
};