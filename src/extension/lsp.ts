import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";
import { lspArgs } from "./engineargs";

// Starts the engine's language server and keeps it running for the session.
// The server is the engine under its lsp verb, so there is one binary to build
// and one place that knows what a schema means.

let client: LanguageClient | undefined;

export function startLanguageServer(exe: string, work: string): void {
  if (client) {
    return;
  }
  // No transport is named, so the client adds no flag of its own and the
  // argument list is the one lspArgs built. Stdio is what it does either way.
  const server: ServerOptions = {
    command: exe,
    args: lspArgs(work),
  };
  // Markdown only: a note is a markdown file, and the server leaves alone any
  // document whose frontmatter names no kind.
  const options: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "markdown" }],
    outputChannelName: "quackitect",
  };
  client = new LanguageClient("quackitect", "quackitect", server, options);
  void client.start();
}

export async function stopLanguageServer(): Promise<void> {
  const running = client;
  client = undefined;
  if (running) {
    await running.stop();
  }
}
