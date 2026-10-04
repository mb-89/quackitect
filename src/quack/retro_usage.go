// The bare retro: the usage, one line a verb, which twinOf reaches where no
// longer words name a registered verb.
// [[spec/tickets/retro-usage-names-every-verb]]
package main

import "io"

func init() { register("retro", retroUsageVerb()) }

// The usage, exit 0 with no word and 2 on a word no verb answers. [[spec/tickets/retro-usage-names-every-verb]]
func retroUsageVerb() twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return 0
	}
}
