// The tools the lsp IO module runs beside the check module's sweep: Vale over
// the prose, Biome over the code, and the code faults, each row under its own
// source, the way the lint runs them.
// [[spec/tickets/lsp-module-draws-the-tools]]
package lsp

// A tool run: the folder, the input, the binary and its words. The door runs one, and a case hands in its own. [[spec/tickets/lsp-module-draws-the-tools]]
type Runner func(dir, input, name string, argv ...string) (string, error)

// The tools a run takes, where the box holds them, and the ceilings the code faults read. [[spec/tickets/lsp-module-draws-the-tools]]
type Tools struct {
	Root   string
	Vale   string
	Biome  string
	Node   string
	Config string
	// The tense reader's module as a file address, or nothing where the tree holds none. [[spec/tickets/lsp-module-draws-the-tools]]
	Tense    string
	Function int
	File     int
	Run      Runner
}

// Every file carrying a row after one whole run of the tools, each as a publish. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) SweepTools() [][]byte {
	return nil
}

// Waits until every run of the tools a change asked for lands. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) Settle() {}

// Hands the server the writer a publish off a run of the tools goes to. [[spec/tickets/lsp-module-draws-the-tools]]
func (s *Server) Pushes(push func(bodies ...[]byte)) {}
