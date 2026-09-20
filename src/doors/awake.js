// The awake door: the one place this tree asks the box to hold off sleep. The
// hold is a child process that lives while the server does, and ends with it.
// [[spec/design_output/level0#the-server-holds-off-sleep]]

import { spawn } from "node:child_process";

// The flags the Windows call takes: the hold stands until cleared, and the system stays up. [[spec/design_output/level0#the-server-holds-off-sleep]]
const CONTINUOUS_SYSTEM = "0x80000001";

// The child a box runs to hold the system up, or nothing where the tree knows none. [[spec/design_output/level0#the-server-holds-off-sleep]]
export function holdArgv(platform, pid) {
  if (platform === "win32") {
    return [
      "powershell",
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      [
        "Add-Type -Namespace Se -Name Awake -MemberDefinition '[DllImport(\"kernel32.dll\")] public static extern uint SetThreadExecutionState(uint f);'",
        `[Se.Awake]::SetThreadExecutionState(${CONTINUOUS_SYSTEM}) | Out-Null`,
        "[Console]::In.ReadLine() | Out-Null",
      ].join("; "),
    ];
  }
  if (platform === "darwin") return ["caffeinate", "-i", "-w", String(pid)];
  if (platform === "linux") {
    return [
      "systemd-inhibit",
      "--what=sleep:idle",
      "--who=level0",
      "--why=the hook runs",
      "cat",
    ];
  }
  return [];
}

export function awake(platform = process.platform, pid = process.pid) {
  return {
    // The hold stands while the child lives, and the child ends with its input. [[spec/design_output/level0#the-server-holds-off-sleep]]
    hold() {
      const argv = holdArgv(platform, pid);
      if (!argv.length)
        return { held: false, why: `no hold stands for ${platform}`, release() {} };
      let child;
      try {
        child = spawn(argv[0], argv.slice(1), {
          stdio: ["pipe", "ignore", "ignore"],
          windowsHide: true,
        });
      } catch (bad) {
        return { held: false, why: bad?.message ?? String(bad), release() {} };
      }
      child.on("error", () => {});
      return {
        held: true,
        why: "",
        pid: child.pid,
        release() {
          try {
            child.stdin.end();
          } catch {}
          try {
            child.kill();
          } catch {}
        },
      };
    },
  };
}
