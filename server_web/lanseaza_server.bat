@echo off

REM Utilizare: lanseaza_server.bat GET http.server 1.1

IF "%~3"=="" (
    echo Eroare: numar gresit de argumente.
    echo Utilizare: lanseaza_server.bat ^<metoda^> ^<protocol^> ^<versiune^>
    exit /b 1
)

echo Procesam metoda...
IF "%1"=="GET" (
    goto metoda_ok
)
IF "%1"=="POST" (
    goto metoda_ok
)

echo Eroare: metoda invalida "%1".
echo Folositi GET sau POST
exit /b 1

:metoda_ok
echo Metoda valida: %1

echo Procesam protocol...
IF "%2"=="http.server" (
    goto protocol_ok
)

echo Eroare: protocol invalid "%2".
echo Folositi http.server
exit /b 1

:protocol_ok
echo Protocol valid: %2

echo Procesam versiunea...
IF "%3"=="1.1" (
    goto versiune_ok
)

echo Eroare: versiune invalida "%3".
echo Folositi 1.1
exit /b 1

:versiune_ok
echo Versiune valida: %3

echo Se lanseaza serverul pe port 5678...
python server_web.py