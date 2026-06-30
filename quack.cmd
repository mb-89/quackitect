@echo off
rem quackitect launcher: forwards to the engine binary built under .quack\engine.
rem Run `.\quack <cmd>` from the project root. Build the binary first if missing (from the module dir):
rem   cd product\engine-go ^&^& go build -o ..\..\.quack\engine\quack.exe .
"%~dp0.quack\engine\quack.exe" %*
