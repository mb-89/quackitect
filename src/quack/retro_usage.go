// The bare retro: the usage, one line a verb, which twinOf reaches where no
// longer words name a registered verb.
// [[spec/tickets/retro-usage-names-every-verb]]
package main

import "io"

// The usage as retro.js prints it, one line a verb. [[spec/tickets/retro-usage-names-every-verb]]
const retroUsage = `Usage: ./RUNME.sh retro <verb>

  notes            the private notes still open on this box, and 0 when none stands
  audit            the experiments still open, and 0 once each stands decided
  collect <ticket> copies this box into the retro's folder, and writes its manifest; --again merges what arrived since
  new              mints a retro off its route, opens it, and hands out its first leaf
  timeline <retro> the hours holding work, per source, with the idle stretches between
  chapters <retro> checks the cuts, and hands every chapter its lines
  read <retro> <chapter>  every owner prompt, fault and command of the chapter, with its file and line
  matrix <retro>   draws the report: the class fixes first, then the matrix
  effect <retro>   counts the last retro's class patterns over this input
  classes <retro>  counts each class's rate, and refuses a finding with no disposition
  backlog <retro>  every prose criterion the window closes, and 0 once each holds a verdict
  mint <retro>     mints one ticket a class standing open, and opens each draft
  score            the improvements earlier retros mint, and how many stay open
`

func init() { register("retro", retroUsageVerb()) }

// The usage, exit 0 with no word and 2 on a word no verb answers. [[spec/tickets/retro-usage-names-every-verb]]
func retroUsageVerb() twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		_, _ = io.WriteString(out, retroUsage)
		if len(argv) > 1 && argv[1] != "" {
			return exitUsage
		}
		return 0
	}
}
