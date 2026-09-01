# EVERY COMMAND CRITERION ON ONE TOKEN, RUN THE WAY THE ENGINE RUNS IT.
#
# A criterion is a sentence until somebody has watched it fail. This runs each
# one and prints what it exited with, so a draft can say what was seen rather
# than what was expected.
#
# It runs them through the same door the engine uses, cmd /c on Windows and
# sh -c elsewhere, because a shell one level out quotes differently and a form
# that works in bash can still reach the engine mangled.
#
#   python util/checks/run-criteria.py doc/work/wk-xxxx.md
import os
import re
import subprocess
import sys

root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
runner = os.path.join(root, "util", "checks", "trycmd", "try.exe")
note = sys.argv[1]

text = open(os.path.join(root, note), encoding="utf-8").read()
start = text.index("## done when")
stop = len(text)
for head in ("\n## finding", "\n## lesson"):
    if head in text[start:]:
        stop = min(stop, start + text[start:].index(head))
section = text[start:stop]

red = 0
green = 0
for command in re.findall(r"^\s*`(.+)`\s*$", section, re.M):
    done = subprocess.run([runner, command, root], capture_output=True, text=True)
    lines = done.stdout.strip().splitlines()
    said = lines[0] if lines else ""
    if said == "exit: <nil>":
        green += 1
        mark = "GREEN"
    else:
        red += 1
        mark = "red  "
    print(mark, command)
print("")
print("%d red, %d green" % (red, green))
