"""Module entry point: `python -m quackitect <cmd>`.

This bypasses the generated `quack.exe` launcher, which Windows
Smart App Control / WDAC blocks on some machines (os error 4551).
See the `quack` / `quack.ps1` / `quack.cmd` wrappers at the repo root.
"""
from quackitect.cli import main

if __name__ == "__main__":
    main()
