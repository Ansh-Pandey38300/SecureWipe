#include "mainwindow.h"

#include "AuthManager.h"

#include "controllers/DeviceController.h"
#include "models/DeviceTableModel.h"
#include "pages/DeviceDetailsPage.h"

#include "ui_mainwindow.h"
#include "services/SanitizationRequestService.h"

#include <QHeaderView>
#include <QHBoxLayout>
#include <QMessageBox>
#include <QPushButton>
#include <QRegularExpression>
#include <QTableView>
#include <QVBoxLayout>
#include <QComboBox>
#include <QLabel>
#include <QJsonArray>
#include <QJsonObject>
#include <QJsonValue>
#include <QTableWidgetItem>

#include "styles/AppTheme.h"
#include <QLayout>


MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
    , authManager(new AuthManager(this))
    , sanitizationRequestService(
      new SanitizationRequestService(this))
    , deviceController(new DeviceController(this))
    , deviceTableModel(new DeviceTableModel(this))
    , deviceDetailsPage(nullptr)
    , refreshDevicesButton(nullptr)
{
    ui->setupUi(this);

    /*
     * The .ui file contains old dark-theme styles.
     * Remove those styles so AppTheme can control
     * the complete application appearance.
     */
    connect(
        ui->logoutButton,
        &QPushButton::clicked,
        this,
        &MainWindow::logout
    );

    const QList<QWidget *> widgets =
        findChildren<QWidget *>();

    for (QWidget *widget : widgets)
    {
        widget->setStyleSheet("");
    }

    AppTheme::apply(this);

    setupDevicesPage();


    /*
     * ---------------------------------------------------------
     * Authentication
     * ---------------------------------------------------------
     */

    connect(
    authManager,
    &AuthManager::loginSuccessful,
    this,
    [this]()
    {
        ui->stackedWidget->setCurrentWidget(
            ui->appPage
        );

        ui->contentStack->setCurrentWidget(
            ui->dashboardPage
        );

        setActiveNavButton(
            ui->dashboardNavButton
        );

        /*
         * Fetch requests assigned to the
         * currently logged-in employee.
         */

        sanitizationRequestService
    ->fetchAssignedRequests(
        authManager->token()
    );

        /*
         * Discover physical storage devices
         * after successful login.
         */
        refreshDevices();
    }
);


    connect(
        authManager,
        &AuthManager::loginFailed,
        this,
        [this](const QString &message)
        {
            ui->loginErrorLabel->setText(
                message
            );
        }
    );


    connect(
        ui->loginButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            ui->loginErrorLabel->clear();

            const QString email =
                ui->emailLineEdit->text().trimmed();

            if (email.isEmpty())
            {
                ui->loginErrorLabel->setText(
                    "Email is required."
                );

                return;
            }

            QRegularExpression emailPattern(
                R"(^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$)"
            );

            if (!emailPattern.match(email).hasMatch())
            {
                ui->loginErrorLabel->setText(
                    "Please enter a valid email address."
                );

                return;
            }

            const QString password =
                ui->passwordLineEdit->text().trimmed();

            if (password.isEmpty())
            {
                ui->loginErrorLabel->setText(
                    "Password is required."
                );

                return;
            }

            authManager->login(
                email,
                password
            );
        }
    );


    /*
     * ---------------------------------------------------------
     * Navigation
     * ---------------------------------------------------------
     */

    connect(
        ui->dashboardNavButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            ui->contentStack->setCurrentWidget(
                ui->dashboardPage
            );

            setActiveNavButton(
                ui->dashboardNavButton
            );
        }
    );


    connect(
        ui->devicesNavButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            ui->contentStack->setCurrentWidget(
                ui->devicesPage
            );

            setActiveNavButton(
                ui->devicesNavButton
            );

            /*
             * Refresh whenever the Devices page is opened.
             */
            refreshDevices();
        }
    );


    connect(
        ui->wipeNavButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            ui->contentStack->setCurrentWidget(
                ui->wipePage
            );

            setActiveNavButton(
                ui->wipeNavButton
            );
        }
    );


    connect(
        ui->reportsNavButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            ui->contentStack->setCurrentWidget(
                ui->reportsPage
            );

            setActiveNavButton(
                ui->reportsNavButton
            );
        }
    );


    connect(
        ui->settingsNavButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            ui->contentStack->setCurrentWidget(
                ui->settingsPage
            );

            setActiveNavButton(
                ui->settingsNavButton
            );
        }
    );


    /*
     * ---------------------------------------------------------
     * Backend → Frontend
     * ---------------------------------------------------------
     */

    connect(
        deviceController,
        &DeviceController::devicesUpdated,
        this,
        [this]()
        {
            deviceTableModel->setDevices(
                deviceController->devices()
            );


            /*
             * Keep the Wipe page device selector
             * synchronized with the latest discovery.
             */
            ui->deviceComboBox->clear();

            for (const StorageDevice& device :
                 deviceController->devices())
            {
                QString label =
                    QString::fromStdString(
                        device.getModel()
                    );

                label +=
                    QStringLiteral(" (");

                label +=
                    QString::fromStdString(
                        device.getDeviceId()
                    );

                label +=
                    QStringLiteral(")");

                ui->deviceComboBox->addItem(
                    label
                );
            }
        }
    );


    connect(
        deviceController,
        &DeviceController::discoveryFailed,
        this,
        [this](const QString &message)
        {
            QMessageBox::warning(
                this,
                "Storage Discovery",
                message
            );
        }
    );

    connect(
    deviceController,
    &DeviceController::safetyCheckPassed,
    this,
    [this]()
    {
        if (!deviceDetailsPage)
        {
            return;
        }

        deviceDetailsPage->updateSafetyStatus(
            true
        );
    }
);


    connect(
        deviceController,
        &DeviceController::safetyCheckFailed,
        this,
        [this](const QString &message)
        {
            if (!deviceDetailsPage)
            {
                return;
            }

            deviceDetailsPage->updateSafetyStatus(
                false,
                message
            );
        }
    );

    connect(
    sanitizationRequestService,
    &SanitizationRequestService::assignedRequestsFetched,
    this,
    [this](const QJsonArray &requests)
    {
        int totalCount = requests.size();
        int completedCount = 0;
        int failedCount = 0;
        int inProgressCount = 0;
        ui->recentJobsTable->setRowCount(
            0
        );

        for (const QJsonValue &value : requests)
        {
            if (!value.isObject())
            {
                continue;
            }

            const QJsonObject request =
                value.toObject();

            const int row =
                ui->recentJobsTable->rowCount();

            ui->recentJobsTable->insertRow(
                row
            );

            const QString requestId =
                request.value(
                    QStringLiteral("requestId")
                ).toString();

            const QString deviceType =
                request.value(
                    QStringLiteral("deviceType")
                ).toString();

            const QString method =
                request.value(
                    QStringLiteral("sanitizationMethod")
                ).toString();

            const QString status =
                request.value(
                    QStringLiteral("status")
                ).toString();
            
            if (status == QStringLiteral("COMPLETED"))
{
    completedCount++;
}
else if (status == QStringLiteral("FAILED"))
{
    failedCount++;
}
else if (status == QStringLiteral("IN_PROGRESS"))
{
    inProgressCount++;
}

            ui->recentJobsTable->setItem(
                row,
                0,
                new QTableWidgetItem(
                    requestId
                )
            );

            ui->recentJobsTable->setItem(
                row,
                1,
                new QTableWidgetItem(
                    deviceType
                )
            );

            ui->recentJobsTable->setItem(
                row,
                2,
                new QTableWidgetItem(
                    method
                )
            );

            ui->recentJobsTable->setItem(
                row,
                3,
                new QTableWidgetItem(
                    status
                )
            );
        }

        ui->totalJobsValue->setText(
    QString::number(totalCount)
);

ui->completedJobsValue->setText(
    QString::number(completedCount)
);

ui->failedJobsValue->setText(
    QString::number(failedCount)
);

ui->inProgressValue->setText(
    QString::number(inProgressCount)
);

        ui->recentJobsTable
            ->resizeColumnsToContents();
    }
);

    connect(
        sanitizationRequestService,
        &SanitizationRequestService::requestFetchFailed,
        this,
        [this](const QString &message)
        {
            ui->recentJobsTable->setRowCount(
                0
                );

            QMessageBox::warning(
                this,
                QStringLiteral("Assigned Requests"),
                message
                );
        }
);


    /*
     * ---------------------------------------------------------
     * Wipe Target Selection
     * ---------------------------------------------------------
     *
     * When the user selects a device from the Wipe page,
     * DeviceController saves that device as the expected target.
     */
    connect(
        ui->deviceComboBox,
        QOverload<int>::of(
            &QComboBox::currentIndexChanged
        ),
        this,
        [this](int index)
        {
            if (index < 0)
            {
                return;
            }

            if (!deviceController->selectTarget(index))
            {
                ui->statusLabel->setText(
                    QStringLiteral(
                        "Unable to select target device."
                    )
                );

                return;
            }

            ui->statusLabel->setText(
                QStringLiteral(
                "Target device selected."
            )
);

const bool methodSelected =
    ui->methodComboBox->currentIndex() >= 0;

ui->startWipeButton->setEnabled(
    methodSelected
);
        }
    );
    ui->startWipeButton->setEnabled(false);

    connect(
    ui->methodComboBox,
    QOverload<int>::of(
        &QComboBox::currentIndexChanged
    ),
    this,
    [this](int index)
    {
        const bool deviceSelected =
            ui->deviceComboBox->currentIndex() >= 0;

        const bool methodSelected =
            index >= 0;

        ui->startWipeButton->setEnabled(
            deviceSelected && methodSelected
        );
    }
);

    /*
     * ---------------------------------------------------------
     * Start Sanitization
     * ---------------------------------------------------------
     *
     * The target is freshly discovered and validated first.
     * Only after successful validation does SafetyEngine run.
     */
    connect(
        ui->startWipeButton,
        &QPushButton::clicked,
        this,
        [this]()
        {
            /*
             * Step 1:
             *
             * Freshly discover the storage devices and
             * verify that the device originally selected
             * by the user still exists with the same identity.
             */
            if (!deviceController->validateSelectedTarget())
            {
                return;
            }


            /*
             * Step 2:
             *
             * Run the SafetyEngine only after target
             * validation has succeeded.
             */
            if (!deviceController->evaluateSelectedTarget())
            {
                return;
            }


            /*
             * Step 3:
             *
             * All currently enabled safety checks passed.
             *
             * The actual sanitization engine should be
             * called from this point later.
             */
            ui->statusLabel->setText(
                QStringLiteral(
                    "Safety checks passed. Ready for sanitization."
                )
            );

            QMessageBox::information(
                this,
                QStringLiteral("Safety Check"),
                QStringLiteral(
                    "All safety checks passed.\n\n"
                    "The target device is ready for sanitization."
                )
            );

            // Actual sanitization call will be added here.
        }
    );
}


/*
 * =============================================================
 * Destructor
 * =============================================================
 */

MainWindow::~MainWindow()
{
    delete ui;
}


/*
 * =============================================================
 * Devices Page
 * =============================================================
 */

void MainWindow::setupDevicesPage()
{
    /*
     * The existing UI contains a placeholder label.
     *
     * We keep the .ui file untouched and build the actual
     * device integration UI here.
     */

    ui->devicesPlaceholderLabel->hide();


    /*
     * Main devices layout
     */

    QVBoxLayout *layout =
        qobject_cast<QVBoxLayout *>(
            ui->devicesPage->layout()
        );

    if (!layout)
    {
        layout = new QVBoxLayout(
            ui->devicesPage
        );

        ui->devicesPage->setLayout(
            layout
        );
    }


    /*
     * ---------------------------------------------------------
     * Header
     * ---------------------------------------------------------
     */

    QLabel *titleLabel =
        new QLabel(
            "Storage Devices",
            ui->devicesPage
        );

    titleLabel->setStyleSheet(
        "QLabel {"
        "color: #172033;"
        "font-size: 24px;"
        "font-weight: 600;"
        "}"
    );


    QLabel *subtitleLabel =
        new QLabel(
            "Physical storage devices detected by SecureWipe.",
            ui->devicesPage
        );

    subtitleLabel->setStyleSheet(
        "QLabel {"
        "color: #667085;"
        "font-size: 13px;"
        "}"
    );


    /*
     * ---------------------------------------------------------
     * Refresh button
     * ---------------------------------------------------------
     */

    refreshDevicesButton =
        new QPushButton(
            "Refresh Devices",
            ui->devicesPage
        );

    refreshDevicesButton->setMinimumHeight(
        38
    );

    refreshDevicesButton->setMinimumWidth(
        150
    );

    refreshDevicesButton->setCursor(
        Qt::PointingHandCursor
    );

    refreshDevicesButton->setStyleSheet(
        "QPushButton {"
        "background-color: #2563EB;"
        "color: white;"
        "border: none;"
        "border-radius: 6px;"
        "padding: 8px 16px;"
        "font-size: 13px;"
        "font-weight: 500;"
        "}"
        ""
        "QPushButton:hover {"
        "background-color: #1D4ED8;"
        "}"
        ""
        "QPushButton:pressed {"
        "background-color: #1E40AF;"
        "}"
        ""
        "QPushButton:disabled {"
        "background-color: #CBD5E1;"
        "color: #64748B;"
        "}"
    );


    connect(
        refreshDevicesButton,
        &QPushButton::clicked,
        this,
        &MainWindow::refreshDevices
    );


    QHBoxLayout *headerLayout =
        new QHBoxLayout();

    headerLayout->addWidget(
        titleLabel
    );

    headerLayout->addStretch();

    headerLayout->addWidget(
        refreshDevicesButton
    );


    /*
     * ---------------------------------------------------------
     * Device table
     * ---------------------------------------------------------
     */

    QTableView *deviceTable =
        new QTableView(
            ui->devicesPage
        );

    deviceTable->setModel(
        deviceTableModel
    );

    deviceTable->setSelectionBehavior(
        QAbstractItemView::SelectRows
    );

    deviceTable->setSelectionMode(
        QAbstractItemView::SingleSelection
    );

    deviceTable->setEditTriggers(
        QAbstractItemView::NoEditTriggers
    );

    deviceTable->setAlternatingRowColors(
        true
    );

    deviceTable->setShowGrid(
        false
    );

    deviceTable->verticalHeader()->setVisible(
        false
    );

    deviceTable->horizontalHeader()
        ->setStretchLastSection(true);

    deviceTable->horizontalHeader()
        ->setSectionResizeMode(
            QHeaderView::ResizeToContents
        );

    deviceTable->setMinimumHeight(
        300
    );


    deviceTable->setStyleSheet(
        "QTableView {"
        "background-color: #FFFFFF;"
        "alternate-background-color: #F8FAFC;"
        "border: 1px solid #E2E8F0;"
        "border-radius: 8px;"
        "color: #172033;"
        "font-size: 13px;"
        "selection-background-color: #DBEAFE;"
        "selection-color: #172033;"
        "}"
        ""
        "QHeaderView::section {"
        "background-color: #F8FAFC;"
        "color: #475467;"
        "border: none;"
        "border-bottom: 1px solid #E2E8F0;"
        "padding: 10px;"
        "font-size: 12px;"
        "font-weight: 600;"
        "}"
    );


    /*
     * Double-click → device details
     */

    connect(
        deviceTable,
        &QTableView::doubleClicked,
        this,
        [this](const QModelIndex &)
        {
            showSelectedDeviceDetails();
        }
    );


    /*
     * ---------------------------------------------------------
     * Page layout
     * ---------------------------------------------------------
     */

    layout->setContentsMargins(
        28,
        24,
        28,
        24
    );

    layout->setSpacing(
        6
    );

    layout->addLayout(
        headerLayout
    );

    layout->addWidget(
        subtitleLabel
    );

    layout->addSpacing(
        14
    );

    layout->addWidget(
        deviceTable
    );
}


/*
 * =============================================================
 * Refresh Devices
 * =============================================================
 */

void MainWindow::refreshDevices()
{
    if (!refreshDevicesButton)
    {
        return;
    }

    refreshDevicesButton->setEnabled(
        false
    );

    refreshDevicesButton->setText(
        "Scanning..."
    );

    /*
     * Current backend discovery is synchronous.
     *
     * We will move this to a worker thread later when the
     * sanitization workflow is integrated.
     */
    deviceController->refreshDevices();

    refreshDevicesButton->setText(
        "Refresh Devices"
    );

    refreshDevicesButton->setEnabled(
        true
    );
}


/*
 * =============================================================
 * Device Details
 * =============================================================
 */

void MainWindow::showSelectedDeviceDetails()
{
    const QList<QTableView *> tables =
        ui->devicesPage->findChildren<QTableView *>();

    if (tables.isEmpty())
    {
        return;
    }

    QTableView *table =
        tables.first();

    const QModelIndex currentIndex =
        table->currentIndex();

    if (!currentIndex.isValid())
    {
        return;
    }

    const StorageDevice *device =
        deviceTableModel->deviceAt(
            currentIndex.row()
        );

    if (!device)
    {
        return;
    }

    showDeviceDetails(
        *device
    );
}


void MainWindow::showDeviceDetails(
    const StorageDevice &device)
{
    /*
     * Remove the old details page if one already exists.
     */
    if (deviceDetailsPage)
    {
        ui->contentStack->removeWidget(
            deviceDetailsPage
        );

        deviceDetailsPage->deleteLater();

        deviceDetailsPage = nullptr;
    }


    /*
     * Create a new details page for the selected device.
     */
    deviceDetailsPage =
        new DeviceDetailsPage(
            device,
            ui->contentStack
        );


    /*
     * Add the page to the application's stacked
     * content area.
     */
    ui->contentStack->addWidget(
        deviceDetailsPage
    );


    /*
     * Show Device Details.
     */
    ui->contentStack->setCurrentWidget(
        deviceDetailsPage
    );


    /*
     * No sidebar item is selected because this is a
     * detail view inside the Devices workflow.
     */
    setActiveNavButton(
        ui->devicesNavButton
    );


    /*
     * Back → Devices
     */
    connect(
        deviceDetailsPage,
        &DeviceDetailsPage::backRequested,
        this,
        &MainWindow::showDevicesPage
    );


    /*
     * Refresh → rediscover devices.
     */
    connect(
        deviceDetailsPage,
        &DeviceDetailsPage::refreshRequested,
        this,
        [this]()
        {
            showDevicesPage();
            refreshDevices();
        }
    );
}


void MainWindow::showDevicesPage()
{
    ui->contentStack->setCurrentWidget(
        ui->devicesPage
    );

    setActiveNavButton(
        ui->devicesNavButton
    );
}


void MainWindow::hideDeviceDetailsPage()
{
    showDevicesPage();
}


/*
 * =============================================================
 * Navigation Styling
 * =============================================================
 */

void MainWindow::setActiveNavButton(
    QPushButton *activeButton)
{
    const QString inactiveStyle =
        "QPushButton {"
        "background-color: transparent;"
        "border: none;"
        "border-radius: 7px;"
        "color: #475467;"
        "font-size: 13px;"
        "font-weight: 500;"
        "text-align: left;"
        "padding: 10px 12px;"
        "}"
        ""
        "QPushButton:hover {"
        "background-color: #F2F4F7;"
        "color: #172033;"
        "}";


    const QString activeStyle =
        "QPushButton {"
        "background-color: #EFF6FF;"
        "border: none;"
        "border-radius: 7px;"
        "color: #1D4ED8;"
        "font-size: 13px;"
        "font-weight: 600;"
        "text-align: left;"
        "padding: 10px 12px;"
        "}"
        ""
        "QPushButton:hover {"
        "background-color: #DBEAFE;"
        "color: #1D4ED8;"
        "}";


    const QList<QPushButton *> navButtons = {
        ui->dashboardNavButton,
        ui->devicesNavButton,
        ui->wipeNavButton,
        ui->reportsNavButton,
        ui->settingsNavButton
    };


    for (QPushButton *button : navButtons)
    {
        if (!button)
        {
            continue;
        }

        button->setStyleSheet(
            button == activeButton
                ? activeStyle
                : inactiveStyle
        );
    }
}


void MainWindow::logout()
{
    ui->passwordLineEdit->clear();

    ui->loginErrorLabel->clear();

    ui->stackedWidget->setCurrentWidget(
        ui->loginPage
    );
}