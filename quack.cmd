@echo off
rem quackitect launcher: forwards to the ONE global engine binary (adr-global-ratchet).
rem   %LOCALAPPDATA%\quackitect\bin\quack.exe
rem The launcher stays dumb: existence check + bootstrap build only. If the global binary is
rem missing, it is built once from this repo's vendored engine source (needs the Go toolchain;
rem the go-bin shim under .quack\tools is appended to PATH as a fallback). Version freshness is
rem NOT the launcher's job - the engine ratchets itself forward at startup when this workspace's
rem vendored source is newer.
setlocal
set "PATH=%PATH%;%~dp0.quack\tools"
set "QBIN=%LOCALAPPDATA%\quackitect\bin\quack.exe"
if exist "%QBIN%" goto run
echo quack: no global engine at %QBIN% - bootstrapping from vendored source...
if not exist "%LOCALAPPDATA%\quackitect\bin" mkdir "%LOCALAPPDATA%\quackitect\bin"
pushd "%~dp0product\engine-go"
go build -o "%QBIN%" .
popd
if not exist "%QBIN%" (
  echo quack: bootstrap failed - install the Go toolchain, see product/quackitect/method/prompts/dependencies.md
  exit /b 1
)
:run
"%QBIN%" %*
