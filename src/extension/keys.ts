// Pressing keys, because an extension cannot type into another extension's
// chat box. This is v3's mechanism, and it is here for v3's reason: the agent
// has to start when the button is pressed, not when the person remembers to
// paste something.
//
// It is deliberately narrow. Windows only, never while the window is not
// focused, and only the two keys the launch needs.

const VK = { RETURN: 13, CONTROL: 17, V: 86 };
const INPUT_KEYBOARD = 1;
const KEYEVENTF_KEYUP = 2;

type Bound = { koffi: any; INPUT: any; SendInput: (n: number, p: unknown[], size: number) => number };
let loaded: Bound | null | undefined;

function bind(): Bound | null {
  if (loaded !== undefined) return loaded;
  loaded = null;
  if (process.platform !== "win32") return loaded;
  try {
    // Required at run time, never bundled: it is a native module.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const koffi = require("koffi");
    const user32 = koffi.load("user32.dll");
    const KEYBDINPUT = koffi.struct("SeKEYBDINPUT", {
      wVk: "uint16", wScan: "uint16", dwFlags: "uint32", time: "uint32", dwExtraInfo: "uintptr",
    });
    const MOUSEINPUT = koffi.struct("SeMOUSEINPUT", {
      dx: "int32", dy: "int32", mouseData: "uint32", dwFlags: "uint32", time: "uint32", dwExtraInfo: "uintptr",
    });
    const UNION = koffi.union("SeINPUTUNION", { mi: MOUSEINPUT, ki: KEYBDINPUT });
    const INPUT = koffi.struct("SeINPUT", { type: "uint32", u: UNION });
    const SendInput = user32.func("uint32 __stdcall SendInput(uint32 cInputs, SeINPUT *pInputs, int cbSize)");
    loaded = { koffi, INPUT, SendInput };
  } catch {
    // No key sender here. The caller says so and the launch still finishes.
    loaded = null;
  }
  return loaded;
}

export function available(): boolean {
  return bind() !== null;
}

function event(vk: number, up: boolean) {
  return {
    type: INPUT_KEYBOARD,
    u: { ki: { wVk: vk, wScan: 0, dwFlags: up ? KEYEVENTF_KEYUP : 0, time: 0, dwExtraInfo: 0 } },
  };
}

function tap(vk: number, modifiers: number[] = []): number {
  const bound = bind();
  if (bound === null) return 0;
  const events: unknown[] = [];
  for (const m of modifiers) events.push(event(m, false));
  events.push(event(vk, false), event(vk, true));
  for (const m of [...modifiers].reverse()) events.push(event(m, true));
  try {
    return bound.SendInput(events.length, events, bound.koffi.sizeof(bound.INPUT));
  } catch {
    return 0;
  }
}

export const paste = () => tap(VK.V, [VK.CONTROL]);
export const enter = () => tap(VK.RETURN);
