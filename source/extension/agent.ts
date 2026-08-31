import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";
import * as keys from "./keys";

// Starting the agent. One act, three steps, and the person presses one thing.
//
// WHAT V3 LEARNED, and it is why the order matters: an agent that is already
// loaded cannot see a tool lane that came up after it. v3 offers a window
// reload for exactly this, and so does this.

// The Claude extension's own commands. Opening the side bar focuses the view
// that is already there, so pressing twice does not make a second agent.
const CLAUDE_SIDEBAR = "claude-vscode.sidebar.open";
const CLAUDE_EDITOR = "claude-vscode.editor.open";
const CLAUDE_FOCUS = "claude-vscode.focus";
const COPILOT_CHAT = "workbench.action.chat.open";

export type Harness = "claude" | "copilot" | "none";

export async function whichHarness(): Promise<Harness> {
  const all = await vscode.commands.getCommands(true);
  // Claude is preferred. Copilot is supported, and some things are absent
  // there, which is said at launch rather than found later.
  if (all.includes(CLAUDE_SIDEBAR) || all.includes(CLAUDE_EDITOR)) return "claude";
  if (all.includes(COPILOT_CHAT)) return "copilot";
  return "none";
}

export function kickoffText(methodRoot: string): string {
  // One file, used by every launch path. Two copies fork the wording, and
  // then the agent is told two different things.
  const file = path.join(methodRoot, "util", "cage", "kickoff.txt");
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {
    // A second wording is still a second wording. This one is the same text,
    // for the case where the file cannot be read at all.
    return "Say in one short message that you are ready, and name the folder you are in.\nThen wait.";
  }
}

export async function openAgent(harness: Harness, kickoff: string): Promise<string> {
  const all = await vscode.commands.getCommands(true);
  if (harness === "claude") {
    if (all.includes(CLAUDE_SIDEBAR)) {
      await vscode.commands.executeCommand(CLAUDE_SIDEBAR);
      await handToClaude(kickoff);
      return "claude is open and has the first instruction";
    }
    await vscode.commands.executeCommand(CLAUDE_EDITOR, undefined, kickoff);
    await vscode.commands.executeCommand("workbench.action.focusActiveEditorGroup");
    setTimeout(() => void pressEnterUntilItGoes(), 600);
    return "claude is open in a tab with the first instruction";
  }
  if (harness === "copilot") {
    // Copilot takes the text directly, so nothing has to be pasted.
    await vscode.commands.executeCommand(COPILOT_CHAT, {
      mode: "agent",
      query: kickoff,
      isPartialQuery: false,
    });
    return "copilot is open in agent mode with the first instruction sent";
  }
  return "";
}

// The chat box belongs to another extension, so the text goes through the
// clipboard and the keys are pressed for the person. v3 found no other way,
// and it works for both hosts.
//
// The view takes a moment to mount, so focus is asked for more than once. The
// clipboard is put back afterwards: it was the person's, not ours.
async function handToClaude(kickoff: string) {
  const previous = await vscode.env.clipboard.readText();
  await vscode.env.clipboard.writeText(kickoff);
  const focus = async () => {
    try {
      await vscode.commands.executeCommand(CLAUDE_FOCUS);
    } catch {
      /* still mounting */
    }
  };
  await focus();
  setTimeout(() => void focus(), 400);
  setTimeout(() => void focus(), 800);
  setTimeout(() => {
    void focus();
    void pasteAndEnter();
  }, 1100);
  setTimeout(() => void vscode.env.clipboard.writeText(previous), 6000);
}

// Keys are never sent to a window that is not focused. They would land in
// whatever the person moved to, and that is somebody else's application.
async function pasteAndEnter() {
  if (!keys.available()) {
    vscode.window.showInformationMessage(
      "No key sender on this platform. The first instruction is on the clipboard: paste it and press enter.",
    );
    return;
  }
  if (!vscode.window.state.focused) return;
  if (keys.paste() === 0) return;
  await new Promise((r) => setTimeout(r, 250));
  await pressEnterUntilItGoes();
}

async function pressEnterUntilItGoes() {
  if (!keys.available()) return;
  for (let i = 0; i < 10; i++) {
    // Focus leaving mid-send stops the rest. Half a launch is better than
    // keystrokes in somebody else's window.
    if (!vscode.window.state.focused) return;
    keys.enter();
    await new Promise((r) => setTimeout(r, 150));
  }
}

// ORDERING IS NOT THE PERSON'S PROBLEM.
//
// v3 asked the person to reload the window when the engine came up after an
// agent had already loaded, because the agent could not then see the tool
// lane. That question should never have reached a person.
//
// The answer is in the design already: the lane is reached through a small
// stub that the harness starts, and the stub finds the engine or starts one.
// An engine that comes up late is then no different from one that was always
// there. Until that stub exists there is no lane to miss, so there is nothing
// to warn about either.
