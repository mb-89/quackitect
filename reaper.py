"""PID 1 of a run's namespace: start the command, reap every orphan, pass signals on.

A detached server the agent starts (level0's index) is reparented to PID 1 when its parent
exits. A PID 1 that never waits leaves it a zombie, which `kill -0` still finds, and the
repository's own contract test ("a stopped index leaves no se-index process past the case")
then fails for a reason no real box has. So PID 1 here reaps, as an init does. When the command
exits, PID 1 exits, and the kernel ends everything else in the namespace.
"""
import os
import signal
import sys


def main():
    child = os.fork()
    if child == 0:
        os.execvp(sys.argv[1], sys.argv[1:])
    for sig in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
        signal.signal(sig, lambda s, f: os.kill(child, s))
    code = 1
    while True:
        try:
            pid, status = os.waitpid(-1, 0)
        except ChildProcessError:
            break
        except InterruptedError:
            continue
        if pid == child:
            code = os.waitstatus_to_exitcode(status)
            break
    sys.exit(code if code >= 0 else 128 - code)


if __name__ == "__main__":
    main()
