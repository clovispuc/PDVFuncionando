@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo   PDV CONTROL - GERADOR DE EXECUTAVEL
echo ==========================================
echo.

:: 1. Verifica se está no System32
if /i "%cd%"=="C:\Windows\System32" (
    echo [ERRO] Nao rode este script dentro da pasta System32.
    echo Mova a pasta do projeto para Documentos ou Area de Trabalho.
    pause
    exit /b
)

:: 2. Tenta encontrar o comando python
where python >nul 2>nul
if %errorlevel% equ 0 (
    set PY_CMD=python
) else (
    where py >nul 2>nul
    if %errorlevel% equ 0 (
        set PY_CMD=py
    ) else (
        echo [ERRO] Python nao encontrado! Instale o Python e marque 'Add Python to PATH'.
        pause
        exit /b
    )
)

echo [1/3] Usando comando: !PY_CMD!
echo [2/3] Instalando dependencias...
!PY_CMD! -m pip install flask flask-cors pyinstaller

echo.
echo [3/3] Criando executavel (Modo Navegador)...
!PY_CMD! -m PyInstaller --noconsole --onefile --add-data "index.html;." --add-data "css;css" --add-data "js;js" --name "PDV_Sistema" app.py

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   SUCESSO! O arquivo esta na pasta 'dist'
    echo   Nome: PDV_Sistema.exe
    echo ==========================================
) else (
    echo.
    echo [ERRO] Ocorreu um problema durante o build.
)

pause
