// The rules the paragraph schema projects over a sentence and over a table.
// The schema hands the values in, and this holds the Tengo they run.
// A port of paragraph-rules.js.
// [[spec/design_output/projection#a-layer-writes-two-files]] [[spec/tickets/config-verbs-port-to-go]]
package projection

// The rule capping the code spans a sentence holds. [[spec/design_output/projection#a-layer-writes-two-files]]
func codeSpans(layer *Object) string {
	most := numberOf(layer.Get("codeSpans"))
	lines := prelude([]string{"rows"}, layer.Get("prose"))
	lines = append(lines,
		front,
		"fenced := false",
		"",
		"for row in rows(said) {",
		"  trimmed := text.trim_space(row.said)",
		"  if text.has_prefix(trimmed, \"```\") {",
		"    fenced = !fenced",
		"    continue",
		"  }",
		"  if fenced { continue }",
		"  if text.has_prefix(trimmed, \"|\") { continue }",
		"  if text.has_prefix(trimmed, \"#\") { continue }",
		"  if text.has_prefix(trimmed, \">\") { continue }",
		"",
		"  for part in text.re_split(`[.!?]+(?:\\s|$)`, row.said, -1) {",
		"    seen := text.re_find(\"`[^`]*`\", part, -1)",
		"    if is_undefined(seen) { continue }",
		"    if len(seen) > "+most+" {",
		"      matches = append(matches, {",
		"        begin: row.begin,",
		"        end: row.end,",
		"        message: \"A sentence holds "+most+" code spans, and this one holds \" + string(len(seen)) + \". Carry the rest as a list or a table.\"",
		"      })",
		"    }",
		"  }",
		"}",
	)
	return scripted("A sentence holds "+most+" code spans.", lines)
}

// The rule refusing a paragraph beside a table that says again what a cell holds. [[spec/design_output/lsp#a-second-copy-draws]]
func restatedTable(layer *Object) string {
	lines := prelude([]string{"rows"}, layer.Get("prose"))
	lines = append(lines, front)
	lines = append(lines, tableWords...)
	lines = append(lines, tableRun...)
	lines = append(lines, tableAside...)
	lines = append(lines, tableWalk(numberOf(layer.Get("table")))...)
	return scripted("A paragraph says again what a cell of the table beside it holds.", lines)
}

// The words a line holds, with a code span and a link blanked out. [[spec/design_output/lsp#a-second-copy-draws]]
var tableWords = []string{
	"wordsOf := func(one) {",
	"  clean := text.re_replace(\"`[^`]*`\", one, \" \")",
	"  clean = text.re_replace(`\\[\\[[^\\]]*\\]\\]`, clean, \" \")",
	"  clean = text.re_replace(`[^a-z0-9]+`, text.to_lower(clean), \" \")",
	"  return text.fields(clean)",
	"}",
	"",
}

// Every run of so many words a place holds, each as one key, so two places share a run where a key of one stands in the other, at a cost linear in their words. Vale stops a script past its own cap, and a search over every pair of words passed it on a loaded box. [[spec/design_output/lsp#a-second-copy-draws]] [[spec/tickets/the-parts-start-at-once]]
var tableRun = []string{
	"runs := func(words, many) {",
	"  out := {}",
	"  for i := 0; i + many <= len(words); i++ { out[text.join(words[i:i+many], \" \")] = true }",
	"  return out",
	"}",
	"",
}

// A heading, a row, an item and a quote stand outside the paragraph beside a table. [[spec/design_output/lsp#a-second-copy-draws]]
var tableAside = []string{
	"aside := func(line) {",
	"  said := text.trim_space(line)",
	"  if len(said) == 0 { return true }",
	"  if text.has_prefix(said, \"#\") { return true }",
	"  if text.has_prefix(said, \"|\") { return true }",
	"  if text.has_prefix(said, \"-\") { return true }",
	"  if text.has_prefix(said, \">\") { return true }",
	"  return false",
	"}",
	"",
}

// Each table takes the cells it holds and the lines touching it. [[spec/design_output/lsp#a-second-copy-draws]]
func tableWalk(most string) []string {
	return []string{
		"lines := rows(said)",
		"at := 0",
		"for at < len(lines) {",
		"  if !text.has_prefix(text.trim_space(lines[at].said), \"|\") {",
		"    at = at + 1",
		"    continue",
		"  }",
		"  from := at",
		"  shared := {}",
		"  for at < len(lines) && text.has_prefix(text.trim_space(lines[at].said), \"|\") {",
		"    for cell in text.split(text.trim_space(lines[at].said), \"|\") {",
		"      one := text.trim_space(cell)",
		"      if len(one) > 0 && !text.re_match(`^[-: ]+$`, one) {",
		"        for key, _ in runs(wordsOf(one), " + most + ") { shared[key] = true }",
		"      }",
		"    }",
		"    at = at + 1",
		"  }",
		"",
		"  near := []",
		"  up := from - 1",
		"  for up >= 0 && len(text.trim_space(lines[up].said)) == 0 { up = up - 1 }",
		"  for up >= 0 && !aside(lines[up].said) {",
		"    near = append(near, lines[up])",
		"    up = up - 1",
		"  }",
		"  down := at",
		"  for down < len(lines) && len(text.trim_space(lines[down].said)) == 0 { down = down + 1 }",
		"  for down < len(lines) && !aside(lines[down].said) {",
		"    near = append(near, lines[down])",
		"    down = down + 1",
		"  }",
		"",
		"  for row in near {",
		"    for key, _ in runs(wordsOf(row.said), " + most + ") {",
		"      if shared[key] {",
		"        matches = append(matches, {",
		"          begin: row.begin,",
		"          end: row.end,",
		"          message: \"This line says again what a cell of the table beside it holds. Cut it, and let the table carry it.\"",
		"        })",
		"        break",
		"      }",
		"    }",
		"  }",
		"}",
	}
}
