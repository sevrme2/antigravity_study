@echo off
title KU Club Hub - 고려대학교 중앙동아리 통합 플랫폼
chcp 65001 >nul

echo.
echo  ============================================
echo   KU CLUB HUB
echo   고려대학교 중앙동아리 통합 플랫폼 v2.0
echo  ============================================
echo.

SET SCRIPT_DIR=%~dp0
SET NODE_EXE=%SCRIPT_DIR%node_portable\node-v20.11.1-win-x64\node.exe
SET ELECTRON_CMD=%SCRIPT_DIR%node_modules\.bin\electron.cmd

IF NOT EXIST "%NODE_EXE%" (
  echo [오류] Node.js 포터블 환경을 찾을 수 없습니다.
  echo       setup_env.ps1 을 먼저 실행해주세요.
  pause
  exit /b 1
)

IF NOT EXIST "%ELECTRON_CMD%" (
  echo [오류] Electron 모듈을 찾을 수 없습니다.
  echo       setup_env.ps1 을 먼저 실행해주세요.
  pause
  exit /b 1
)

echo  앱을 시작하는 중입니다...
echo.

SET PATH=%SCRIPT_DIR%node_portable\node-v20.11.1-win-x64;%PATH%
cd /d "%SCRIPT_DIR%"
call "%ELECTRON_CMD%" .

exit /b 0
