#include "mainwindow.h"
#include "AuthManager.h"
#include "ui_mainwindow.h"
#include <QPushButton>
#include <QRegularExpression>
MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    authManager = new AuthManager(this);
    connect(authManager, &AuthManager::loginSuccessful, this, [this]() {
        ui->stackedWidget->setCurrentWidget(ui->appPage);
        ui->contentStack->setCurrentWidget(ui->dashboardPage);
        setActiveNavButton(ui->dashboardNavButton);
    });
    connect(authManager, &AuthManager::loginFailed, this, [this](const QString &message) {
        ui->loginErrorLabel->setText(message);
    });
    connect(ui->loginButton, &QPushButton::clicked, this, [this]() {
        ui->loginErrorLabel->clear();
        QString email = ui->emailLineEdit->text().trimmed();
        if (email.isEmpty()) {
            ui->loginErrorLabel->setText("Email is required.");
            return;
        }
        QRegularExpression emailPattern(
            R"(^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$)"
            );

        if (!emailPattern.match(email).hasMatch()) {
            ui->loginErrorLabel->setText("Please enter a valid email address.");
            return;
        }
        QString password = ui->passwordLineEdit->text().trimmed();
        if (password.isEmpty()) {
            ui->loginErrorLabel->setText("Password is required.");
            return;
        }
        authManager->login(email, password);
    });
    connect(ui->dashboardNavButton, &QPushButton::clicked, this, [this](){
        ui->contentStack->setCurrentWidget(ui->dashboardPage);
        setActiveNavButton(ui->dashboardNavButton);
    });
    connect(ui->devicesNavButton, &QPushButton::clicked, this, [this](){
        ui->contentStack->setCurrentWidget(ui->devicesPage);
        setActiveNavButton(ui->devicesNavButton);
    });
    connect(ui->wipeNavButton, &QPushButton::clicked, this, [this](){
        ui->contentStack->setCurrentWidget(ui->wipePage);
        setActiveNavButton(ui->wipeNavButton);
    });
    connect(ui->reportsNavButton, &QPushButton::clicked, this, [this](){
        ui->contentStack->setCurrentWidget(ui->reportsPage);
        setActiveNavButton(ui->reportsNavButton);
    });
    connect(ui->settingsNavButton, &QPushButton::clicked, this, [this](){
        ui->contentStack->setCurrentWidget(ui->settingsPage);
        setActiveNavButton(ui->settingsNavButton);
    });
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::setActiveNavButton(QPushButton *activeButton)
{
    QList<QPushButton*> navButtons = {
        ui->dashboardNavButton,
        ui->devicesNavButton,
        ui->wipeNavButton,
        ui->reportsNavButton,
        ui->settingsNavButton
    };

    QString inactiveStyle =
        "QPushButton { text-align: left; padding-left: 10px; color: #C8D4E5; "
        "background-color: transparent; border: none; border-radius: 6px; font-size: 13px; } "
        "QPushButton:hover { background-color: #16233A; }";

    QString activeStyle =
        "QPushButton { text-align: left; padding-left: 10px; color: #EAF2FF; "
        "background-color: #2563EB; border: none; border-radius: 6px; font-size: 13px; }";

    for (QPushButton *btn : navButtons) {
        btn->setStyleSheet(btn == activeButton ? activeStyle : inactiveStyle);
    }
}
