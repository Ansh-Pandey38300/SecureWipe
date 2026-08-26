cmake_minimum_required(VERSION 3.20)

project(SecureWipe
    VERSION 1.0
    LANGUAGES CXX
)

find_package(Qt6 6.5 REQUIRED COMPONENTS Core Widgets Network)

qt_standard_project_setup()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

qt_add_executable(SecureWipe
    WIN32 MACOSX_BUNDLE
    frontend/main.cpp
    frontend/mainwindow.cpp
    frontend/mainwindow.h
    frontend/mainwindow.ui
    frontend/AuthManager.cpp
    frontend/AuthManager.h
)

target_link_libraries(SecureWipe
    PRIVATE
        Qt::Core
        Qt::Widgets
        Qt::Network
)

add_subdirectory(backend)

install(TARGETS SecureWipe
    BUNDLE  DESTINATION .
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
)

qt_generate_deploy_app_script(
    TARGET SecureWipe
    OUTPUT_SCRIPT deploy_script
    NO_UNSUPPORTED_PLATFORM_ERROR
)

install(SCRIPT ${deploy_script})