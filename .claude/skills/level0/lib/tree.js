// Every rule weighing one file against another. Vale hands a rule one buffer,
// so a rule reading two files lives here, and the command line runs it over the
// whole tree into the problems panel.
// [[spec/design_output/tree#the-rules-over-two-files]]

import { overLong } from "./names.js";
import { isDraft } from "./paths.js";
import { carriesTheName, namesAPerson } from "./private.js";
import {
  EDITOR_EXTENSIONS,
  EDITOR_SETTINGS,
  EXTENSIONS,
  namesTheBinaries,
} from "./servers.js";
import { decide, pool, RULES as STOP } from "./stop.js";
import { BIN, installedTools, TOOLS, WANTED } from "./tools.js";

export const INSTALL = "src/scripts/install.sh";
export const VALE_INI = ".vale.ini";

const STOP_LIB = ".claude/skills/level0/lib/stop.js";
const SOURCE = /^(?:src|\.claude)\/.*\.js$/;
const TEXT = /\.(?:md|markdown|txt|ya?ml|json|js|ts|tsx|go|sh|ps1|ini|mod)$/i;
const DELETES = /\bremove\(|\bunlink|\brm\b|\bprune\b/;
const LOGGED = /log/i;

const LATER = {
  name: "level1.yml",
  text:
    "- id: a-later-level\n  side: stop\n  priority: 20\n  decides: claimed\n" +
    "  asks: Later?\n  says: A later level says so.\n",
};

const BINARIES = {
  vale: ["vale.valeCLI.path", `The editor runs ${BIN}/vale, which ${INSTALL} writes.`],
  valeConfig: ["vale.valeCLI.config", `The editor reads ${VALE_INI} at the root.`],
  managesVale: [
    "vale.valeCLI.installVale",
    `${INSTALL} pins Vale, so the extension installs none of its own.`,
  ],
  biome: ["biome.lsp.bin", `The editor runs ${BIN}/biome, which ${INSTALL} writes.`],
  biomeConfig: [
    "biome.configurationPath",
    "Biome reads spec/config/biome.json, which this tree tracks.",
  ],
};

// [[spec/design_output/tree#the-tree-handed-in]]
export function treeOf(it) {
  const at = (path) => `${it.root}/${path}`;
  let held = null;
  return {
    words: it.words ?? 0,
    node: it.node ?? "",
    box: it.box ?? {},
    read(path) {
      try {
        return it.disk.read(at(path));
      } catch {
        return "";
      }
    },
    exists: (path) => it.disk.exists(at(path)),
    names(folder, end) {
      try {
        return it.disk
          .list(at(folder))
          .filter((one) => one.kind === "file" && one.name.endsWith(end))
          .map((one) => one.name);
      } catch {
        return [];
      }
    },
    paths() {
      if (held) return held;
      held = it.git
        .run(["ls-files"], true)
        .out.split(/\r?\n/)
        .map((one) => one.trim())
        .filter(Boolean)
        .filter((one) => !isDraft(one));
      return held;
    },
  };
}

// [[spec/design_output/editor#what-the-tracked-settings-say]]
export function settingsNameBinaries(tree) {
  const rule = "SettingsNameBinaries";
  const text = tree.read(EDITOR_SETTINGS);
  const said = parsed(text);
  if (!said) return [unread(rule, EDITOR_SETTINGS)];

  const out = [];
  for (const [flag, holds] of Object.entries(namesTheBinaries(said))) {
    if (holds) continue;
    const [key, why] = BINARIES[flag];
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        `${key} names something else. ${why}`,
        lineOf(text, key),
      ),
    );
  }

  const installs = installedTools(tree.read(INSTALL));
  for (const name of ["vale", "biome"]) {
    if (installs.includes(name)) continue;
    out.push(
      fault(
        rule,
        INSTALL,
        `${EDITOR_SETTINGS} runs ${BIN}/${name}, and this script installs no ${name}.`,
      ),
    );
  }
  return out;
}

// [[spec/design_output/editor#what-the-editor-runs]]
export function editorDrawsWriteRules(tree) {
  const rule = "EditorDrawsWriteRules";
  const text = tree.read(EDITOR_SETTINGS);
  const said = parsed(text);
  if (!said) return [unread(rule, EDITOR_SETTINGS)];

  const out = [];
  const where = said["vale.valeCLI.config"] ?? "";
  const ini = where ? tree.read(where) : "";
  if (!ini) {
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        `vale.valeCLI.config names ${where || "nothing"}, and the write door reads ${VALE_INI}.`,
        lineOf(text, "vale.valeCLI.config"),
      ),
    );
    return out;
  }

  const level = /^\s*MinAlertLevel\s*=\s*(\S+)/m.exec(ini)?.[1] ?? "";
  if (said["vale.valeCLI.minAlertLevel"] !== "inherited") {
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        `${where} draws at ${level || "its own level"}. Set vale.valeCLI.minAlertLevel to inherited.`,
        lineOf(text, "vale.valeCLI.minAlertLevel"),
      ),
    );
  }
  if (!/BasedOnStyles.*Spelling/.test(ini) && said["vale.enableSpellcheck"] !== false) {
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        `${where} names no spelling style. Set vale.enableSpellcheck to false.`,
        lineOf(text, "vale.enableSpellcheck"),
      ),
    );
  }
  if (said["vale.valeCLI.lintOnChange"] !== true) {
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        "Set vale.valeCLI.lintOnChange to true, so a rule draws while a person types.",
        lineOf(text, "vale.valeCLI.lintOnChange"),
      ),
    );
  }
  return out;
}

// [[spec/design_output/editor#what-the-tracked-settings-say]]
export function biomeOnWindows(tree) {
  const rule = "BiomeOnWindows";
  const text = tree.read(EDITOR_SETTINGS);
  const said = parsed(text);
  if (!said) return [unread(rule, EDITOR_SETTINGS)];

  const map = said["biome.lsp.bin"];
  if (!map || typeof map !== "object") {
    return [
      fault(
        rule,
        EDITOR_SETTINGS,
        `biome.lsp.bin names one path per platform, under ${BIN}.`,
        lineOf(text, "biome.lsp.bin"),
      ),
    ];
  }

  const out = [];
  for (const [platform, path] of Object.entries(map)) {
    const wants = platform.startsWith("win32") ? `${BIN}/biome.exe` : `${BIN}/biome`;
    if (path === wants) continue;
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        `${platform} runs ${path}, and this tree installs ${wants} there.`,
        lineOf(text, platform),
      ),
    );
  }
  return out;
}

// [[spec/design_output/editor#what-the-tracked-settings-say]]
export function extensionsOnOffer(tree) {
  const rule = "ExtensionsOnOffer";
  const text = tree.read(EDITOR_EXTENSIONS);
  const said = parsed(text);
  if (!said) return [unread(rule, EDITOR_EXTENSIONS)];

  const out = [];
  const offered = Array.isArray(said.recommendations) ? said.recommendations : [];
  const at = lineOf(text, "recommendations");
  for (const one of EXTENSIONS) {
    if (offered.includes(one)) continue;
    out.push(
      fault(rule, EDITOR_EXTENSIONS, `A clone opens without ${one} on offer.`, at),
    );
  }
  for (const one of offered) {
    if (EXTENSIONS.includes(one)) continue;
    out.push(
      fault(rule, EDITOR_EXTENSIONS, `${one} holds no rule this tree reads.`, at),
    );
  }

  const settings = tree.read(EDITOR_SETTINGS);
  for (const [key, value] of Object.entries(parsed(settings) ?? {})) {
    const formatter = value?.["editor.defaultFormatter"];
    if (!formatter || offered.includes(formatter)) continue;
    out.push(
      fault(
        rule,
        EDITOR_SETTINGS,
        `${key} formats through ${formatter}, and ${EDITOR_EXTENSIONS} offers no such extension.`,
        lineOf(settings, formatter),
      ),
    );
  }
  return out;
}

// [[spec/design_output/stop#where-the-rules-live]]
export function stopFolderIsData(tree) {
  const rule = "StopFolderIsData";
  const mine = tree
    .names(STOP, ".yml")
    .map((name) => ({ name, text: tree.read(`${STOP}/${name}`) }));
  const one = pool(mine);

  const out = [];
  for (const name of one.broken) {
    out.push(
      fault(
        rule,
        `${STOP}/${name}`,
        "This file carries no whole rule, so the pool drops it.",
      ),
    );
  }

  const both = pool([...mine, LATER]);
  if (both.rules.length !== one.rules.length + 1) {
    out.push(
      fault(
        rule,
        STOP_LIB,
        "A second file in the folder adds no rule, so the pool reads code.",
      ),
    );
    return out;
  }
  const said = decide(both.rules, { claimed: "a-later-level", ran: () => false });
  if (!said.ends) {
    out.push(
      fault(
        rule,
        STOP_LIB,
        "A rule out of a second file never fires, so the vote reads code.",
      ),
    );
  }
  return out;
}

// [[spec/design_output/log#nothing-here-deletes-a-log]]
export function noLogDeleted(tree) {
  const rule = "NoLogDeleted";
  const out = [];
  for (const path of tree.paths().filter((one) => SOURCE.test(one))) {
    const lines = tree.read(path).split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      if (!DELETES.test(lines[i]) || !LOGGED.test(lines[i])) continue;
      out.push(
        fault(
          rule,
          path,
          "This line reaches a log file. The log is the record of what every door does, so nothing here takes one away.",
          i + 1,
        ),
      );
    }
  }
  return out;
}

// [[spec/design_output/level0#a-name-holds-five-words]]
export function nameHoldsTheWords(tree) {
  const rule = "NameHoldsTheWords";
  const out = [];
  if (!tree.words) return out;
  for (const path of tree.paths()) {
    const part = overLong(path, tree.words);
    if (!part) continue;
    out.push(
      fault(
        rule,
        path,
        `${part} holds more than ${tree.words} words. Rename it shorter.`,
      ),
    );
  }
  return out;
}

// [[spec/design_output/private#the-box-names-the-owner]]
export function nothingPrivateTravels(tree) {
  const rule = "NothingPrivateTravels";
  const box = tree.box ?? {};
  const home = String(box.home ?? "").replace(/[/\\]+$/, "");

  const wanted = [
    ["the user this box runs as", box.user],
    ["the home folder on this box", homeNames(home) ? home : ""],
    ["the git name on this box", box.name],
    ["the git address on this box", box.email],
  ].filter(([, said]) => namesAPerson(said));
  if (!wanted.length) return [];

  const out = [];
  for (const path of tree.paths().filter((one) => TEXT.test(one))) {
    const lines = tree.read(path).split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      for (const [what, said] of wanted) {
        if (!carriesTheName(lines[i], said)) continue;
        out.push(
          fault(
            rule,
            path,
            `This line carries ${what}, and git carries this file everywhere. Say what the thing is, in words a reader outside this box acts on.`,
            i + 1,
          ),
        );
      }
    }
  }
  return out;
}

function homeNames(home) {
  const who = String(home).split(/[/\\]+/).filter(Boolean).pop() ?? "";
  return namesAPerson(who);
}

// [[spec/design_output/tools#what-the-survey-names]]
export function surveyNamesInstalls(tree) {
  const rule = "SurveyNamesInstalls";
  const text = tree.read(INSTALL);
  const installs = installedTools(text);
  if (!installs.length) {
    return [fault(rule, INSTALL, "This script names no tool the survey reads back.")];
  }

  const out = [];
  const wanted = WANTED.map((one) => one.name);
  for (const name of installs) {
    if (wanted.includes(name)) continue;
    out.push(
      fault(
        rule,
        INSTALL,
        `The survey names no ${name}, so every caller guesses its path. Add it to WANTED.`,
        lineOf(text, `${name})`),
      ),
    );
  }
  return out;
}

// [[spec/design_output/tools#what-the-survey-writes]]
export function surveyFindsNode(tree) {
  const rule = "SurveyFindsNode";
  const text = tree.read(TOOLS);
  if (!text) {
    return [
      fault(
        rule,
        INSTALL,
        `${TOOLS} stands nowhere, so every caller guesses a path. Run ./RUNME.sh tools.`,
      ),
    ];
  }

  const said = parsed(text)?.node?.version ?? "";
  if (said === tree.node) return [];
  return [
    fault(
      rule,
      TOOLS,
      `The survey names node ${said || "nothing"}, and node ${tree.node} runs this sweep. Run ./RUNME.sh tools.`,
      lineOf(text, "version"),
    ),
  ];
}

export const RULES = [
  settingsNameBinaries,
  editorDrawsWriteRules,
  biomeOnWindows,
  extensionsOnOffer,
  stopFolderIsData,
  noLogDeleted,
  nameHoldsTheWords,
  nothingPrivateTravels,
  surveyNamesInstalls,
  surveyFindsNode,
];

// [[spec/design_output/tree#what-a-rule-answers]]
export function treeFaults(tree) {
  const out = [];
  for (const rule of RULES) out.push(...rule(tree));
  return out;
}

function fault(rule, file, message, line = 1) {
  return { file, rule, line, column: 1, message, severity: "error" };
}

function unread(rule, where) {
  return fault(
    rule,
    where,
    "This file reads as no JSON, so every rule over it stands unchecked.",
  );
}

function parsed(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function lineOf(text, needle) {
  const lines = String(text).split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) return i + 1;
  }
  return 1;
}
