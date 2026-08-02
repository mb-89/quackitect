// PRESSING A KEY, OURSELVES.
//
// VS Code will not synthesise keystrokes for extensions and says so: the
// request has stood open since 2020. A webview belongs to another extension,
// so nothing inside the editor can type into Claude's box. The key has to
// come from the operating system.
//
// DESKTOP-AUTOMATION LIBRARIES DO EXACTLY ONE THING FOR US HERE. They wrap
// SendInput on Windows in a C++ addon, and carry screen capture, mouse
// control and an image library along with it. We need one key. So this calls
// SendInput directly through an FFI and skips the rest.
//
// WHAT WE DEPEND ON is koffi: a C foreign-function interface, MIT, N-API, so
// one prebuilt binary keeps working across Node and Electron versions. Two
// packages. Everything below is ours.
//
// WINDOWS ONLY, and it says so rather than pretending. Elsewhere available()
// is false and the caller falls back or asks the reader to press Enter. The
// same shape works on macOS (CGEventPost) and Linux (XTestFakeKeyEvent) when
// somebody needs them.
const VK = {
  RETURN: 0x0d,
  CONTROL: 0x11,
  V: 0x56,
};

const INPUT_KEYBOARD = 1;
const KEYEVENTF_KEYUP = 0x0002;

let loaded;

/** Load koffi and declare the one call we need. Failure is an answer, not an
 *  exception: a machine without the binary keeps working without the key. */
function bind() {
  if (loaded !== undefined) return loaded;
  loaded = null;
  if (process.platform !== "win32") return loaded;
  try {
    const koffi = require("koffi");
    const user32 = koffi.load("user32.dll");
    // INPUT is a tagged union of three shapes; MOUSEINPUT is the largest, so
    // both must be declared or the struct comes out the wrong size and
    // SendInput rejects it. On x64 the whole thing is 40 bytes.
    const KEYBDINPUT = koffi.struct("SeKEYBDINPUT", {
      wVk: "uint16",
      wScan: "uint16",
      dwFlags: "uint32",
      time: "uint32",
      dwExtraInfo: "uintptr",
    });
    const MOUSEINPUT = koffi.struct("SeMOUSEINPUT", {
      dx: "int32",
      dy: "int32",
      mouseData: "uint32",
      dwFlags: "uint32",
      time: "uint32",
      dwExtraInfo: "uintptr",
    });
    const UNION = koffi.union("SeINPUTUNION", { mi: MOUSEINPUT, ki: KEYBDINPUT });
    const INPUT = koffi.struct("SeINPUT", { type: "uint32", u: UNION });
    const SendInput = user32.func("uint32 __stdcall SendInput(uint32 cInputs, SeINPUT *pInputs, int cbSize)");
    loaded = { koffi, INPUT, SendInput };
  } catch {
    loaded = null;
  }
  return loaded;
}

/** Whether keys can be sent in this process at all. */
function available() {
  return bind() !== null;
}

function event(vk, up) {
  return {
    type: INPUT_KEYBOARD,
    u: { ki: { wVk: vk, wScan: 0, dwFlags: up ? KEYEVENTF_KEYUP : 0, time: 0, dwExtraInfo: 0 } },
  };
}

/**
 * Tap one key, optionally with modifiers held.
 *
 * The whole chord goes in ONE SendInput call, which is what makes it a
 * keystroke rather than a race: Windows delivers the batch without another
 * process interleaving between the modifier and the key.
 *
 * Returns how many events were accepted, or 0 when nothing could be sent.
 */
function tap(vk, modifiers = []) {
  const bound = bind();
  if (bound === null) return 0;
  const events = [];
  for (const m of modifiers) events.push(event(m, false));
  events.push(event(vk, false), event(vk, true));
  for (const m of [...modifiers].reverse()) events.push(event(m, true));
  try {
    return bound.SendInput(events.length, events, bound.koffi.sizeof(bound.INPUT));
  } catch {
    return 0;
  }
}

const paste = () => tap(VK.V, [VK.CONTROL]);
const enter = () => tap(VK.RETURN);

module.exports = { available, tap, paste, enter, VK };
