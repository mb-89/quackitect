// The command line in process: every verb the binary answers short of the
// index's own run, over the doors a caller hands it.
// [[spec/tickets/test-walks-move-onto-fakes]]
package main

import "fmt"

// Runs the words past the binary's name over the box doors, and answers the exit code, and false where the words name the index's own run. [[spec/tickets/test-walks-move-onto-fakes]]
func runWith(d boxDoors, argv []string) (int, bool) {
	ends := func(err error) (int, bool) {
		if err != nil {
			fmt.Fprintln(d.errs, err)
			return 1, true
		}
		return 0, true
	}
	one := len(argv) == 1
	switch {
	case len(argv) == 0:
		return 0, false
	case one && argv[0] == "lsp":
		return ends(lspVerb(d.input, d.out))
	// [[spec/tickets/the-doors-process-stands]]
	case one && argv[0] == ioVerb:
		return ends(ioMain())
	// [[spec/tickets/the-system-places-modules]]
	case len(argv) > 1 && argv[0] == moduleVerb:
		return ends(moduleMain(d, argv[1:]))
	case len(argv) >= verbArgs && argv[0] == "verb":
		return verbRoad(argv[verbArgs:], d.out, d.errs), true
	case one && argv[0] == "config":
		return ends(configs(d, "."))
	case argv[0] == "schema":
		return ends(schemas(d, ".", len(argv) == schemaArgs-1 && argv[1] == "--write"))
	case one && argv[0] == "guidance":
		return ends(guidances(d, "."))
	case one && argv[0] == "log":
		return ends(logs(d, "."))
	// [[spec/tickets/the-lsp-server-leaves]]
	case one && argv[0] == "sweep":
		return ends(sweeps(d.out, askIndex))
	case one && argv[0] == "prose":
		return ends(proses(d, "."))
	case len(argv) == dumpArgs-1 && argv[0] == "dump":
		return ends(dumps(argv[1]))
	case cliVerbs[argv[0]]:
		return routes(d.out, d.errs, reachV1, argv), true
	}
	return 0, false
}
