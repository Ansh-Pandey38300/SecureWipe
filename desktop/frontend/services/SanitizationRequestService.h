#ifndef SANITIZATIONREQUESTSERVICE_H
#define SANITIZATIONREQUESTSERVICE_H

#include <QObject>
#include <QNetworkAccessManager>
#include <QJsonArray>
#include <QString>

class SanitizationRequestService : public QObject
{
    Q_OBJECT

public:
    explicit SanitizationRequestService(
        QObject *parent = nullptr
    );

    void fetchAssignedRequests(
        const QString &token
    );

signals:
    void assignedRequestsFetched(
        const QJsonArray &requests
    );

    void requestFetchFailed(
        const QString &message
    );

private:
    QNetworkAccessManager *networkManager;
};

#endif // SANITIZATIONREQUESTSERVICE_H