// The frontmatter answers to its own schema, so a rule over prose blanks it and
// keeps the fields the paragraph schema names. A line carrying no key of its
// own rides the key above it, so a value running over several lines holds
// together. Blanking keeps each line's length, so a match still names its place.
// [[spec/tickets/voice-rules-skip-the-record]]

export function frontless(prose) {
  const keys = (prose ?? []).map((one) => `"${one}"`).join(", ");
  return [
    `prose := [${keys}]`,
    "",
    "frontless := func(said) {",
    '  lines := text.split(said, "\\n")',
    '  if len(lines) < 2 || text.trim_space(lines[0]) != "---" { return said }',
    "  out := []",
    "  inside := true",
    "  keep := false",
    "  for at, line in lines {",
    "    if at == 0 {",
    "      out = append(out, line)",
    "      continue",
    "    }",
    '    if inside && text.trim_space(line) == "---" {',
    "      inside = false",
    "      out = append(out, line)",
    "      continue",
    "    }",
    "    if !inside {",
    "      out = append(out, line)",
    "      continue",
    "    }",
    "    found := text.re_find(`^[ \\t]*-?[ \\t]*([A-Za-z_][A-Za-z0-9_]*):`, line, 1)",
    "    if !is_undefined(found) {",
    "      keep = false",
    "      for one in prose {",
    "        if one == found[0][1].text { keep = true }",
    "      }",
    "    }",
    "    if keep {",
    "      out = append(out, line)",
    "    } else {",
    '      out = append(out, text.repeat(" ", len(line)))',
    "    }",
    "  }",
    '  return text.join(out, "\\n")',
    "}",
  ];
}
