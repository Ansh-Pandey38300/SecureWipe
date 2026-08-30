#pragma once

#include <QObject>
#include <optional>
#include <vector>

#include "StorageDevice.h"
#include "SafetyEngine.h"

class StorageService;

class DeviceController : public QObject
{
    Q_OBJECT

public:
    explicit DeviceController(
        QObject *parent = nullptr);

    const std::vector<StorageDevice> &devices() const;

    // Save the device selected by the user.
    bool selectTarget(int index);

    // Rediscover devices and validate the previously selected target.
    bool validateSelectedTarget();

    // Run SafetyEngine after successful target validation.
    bool evaluateSelectedTarget();

public slots:
    void refreshDevices();

signals:
    void devicesUpdated();

    void discoveryFailed(
        const QString &message);

    void safetyCheckPassed();

    void safetyCheckFailed(
        const QString &message);

private:
    StorageService *storageService_;

    std::vector<StorageDevice> devices_;

    SafetyEngine safetyEngine_;

    // Copy of the device selected by the user.
    // It remains valid even when devices_ is freshly replaced.
    std::optional<StorageDevice> selectedTarget_;
};