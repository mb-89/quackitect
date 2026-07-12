@echo off
rem gofmt shim (adr-shim-product-tools): go-bin exposes only go.exe; gofmt ships inside its
rem GOROOT. Resolve GOROOT once and forward. Rides last on PATH - a native gofmt wins.
setlocal
for /f "delims=" %%i in ('uvx --from go-bin go env GOROOT 2^>nul') do set "QGOROOT=%%i"
if not defined QGOROOT (
  echo gofmt shim: could not resolve GOROOT via uvx go-bin
  exit /b 1
)
"%QGOROOT%\bin\gofmt.exe" %*
