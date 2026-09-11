@echo off
rem RUNME. The one command that always works, and the one a person clicks.
rem
rem Windows carries no sh of its own and Git brings one, so this finds that
rem shell and hands RUNME.sh every argument. One installer serves every box.
rem
rem   RUNME.cmd            the install, then the editor opens here
rem   RUNME.cmd check      the tests, then the rules over the tree
setlocal
set "here=%~dp0"
set "root=%here:\=/%"

set "shell="
for %%one in (
  "%ProgramFiles%\Git\bin\bash.exe"
  "%ProgramFiles(x86)%\Git\bin\bash.exe"
  "%LocalAppData%\Programs\Git\bin\bash.exe"
) do if not defined shell if exist %%one set "shell=%%~one"

if not defined shell for /f "delims=" %%one in ('where bash.exe 2^>nul') do (
  if not defined shell set "shell=%%one"
)

if not defined shell (
  echo Git for Windows is missing, and it carries the shell this needs.
  echo Install it from https://git-scm.com/download/win, then click this again.
  pause
  exit /b 1
)

rem The path goes in with forward slashes, so the shell Git ships reads it.
"%shell%" "%root%RUNME.sh" %*
set "answered=%errorlevel%"

rem A window a person clicked closes the moment this ends, so a fault would
rem go unread. Holding it open is the only way they see one.
if not "%answered%"=="0" pause
exit /b %answered%
