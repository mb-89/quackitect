#!/usr/bin/env node
// se-mcp — the MCP server (pillar 2: everything the agent does goes through
// here; the console stays for the human).
//
// Usage: node bin/se-mcp.ts [--root <repo root containing ledger/>]
import { resolve } from "node:path";
import { McpServer, runStdio } from "../engine/mcp.ts";
import { coreTools } from "../engine/tools.ts";

const args = process.argv.slice(2);
const flagIdx = args.indexOf("--root");
const root = resolve(flagIdx === -1 ? "." : args[flagIdx + 1]);

const server = new McpServer({ name: "se-mcp", version: "2.0.0-bootstrap" }, coreTools(root));
runStdio(server);
