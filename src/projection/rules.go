// The rules the paragraph schema projects over a sentence and over a table.
// The schema hands the values in, and each rule file carries its head alone.
// A port of paragraph-rules.js.
// [[spec/design_output/projection#a-layer-writes-two-files]] [[spec/tickets/config-verbs-port-to-go]]
package projection

// The rule capping the code spans a sentence holds. [[spec/design_output/projection#a-layer-writes-two-files]]
func codeSpans(layer *Object) string {
	most := numberOf(layer.Get("codeSpans"))
	return scripted("A sentence holds " + most + " code spans.")
}

// The rule refusing a paragraph beside a table that says again what a cell holds. [[spec/design_output/lsp#a-second-copy-draws]]
func restatedTable() string {
	return scripted("A paragraph says again what a cell of the table beside it holds.")
}
