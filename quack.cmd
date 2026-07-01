@echo off
rem quackitect launcher: forwards to the engine binary built under .quack\engine.
rem Run `.\quack <cmd>` from the project root. Build the binary first if missing (from the module dir):
rem   cd product\engine-go ^&^& go build -o ..\..\.quack\engine\quack.exe .
rem Append the go-bin shim (.quack\tools\go.cmd) to PATH as a fallback so `quack build` finds a `go`
rem even when Go isn't installed natively; a real Go install still wins (shim is appended last).
setlocal
set "PATH=%PATH%;%~dp0.quack\tools"
"%~dp0.quack\engine\quack.exe" %*
