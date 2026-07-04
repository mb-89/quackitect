@echo off
rem go shim: forwards to the Go toolchain fetched from PyPI via uv (go-bin package).
rem Fallback for machines where go.dev/dl is blocked and Go isn't installed natively.
rem quack.cmd appends this dir to PATH (last), so a real `go` install still takes precedence.
uvx --from go-bin go %*
exit /b %errorlevel%
