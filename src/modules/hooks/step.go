// The step a door's effects answer, and the merge of an after into an answer.
// stepOf leaves cage.ts and merged leaves shape.ts for this file.
// [[spec/tickets/level0-hooks-hold-no-rule]]
package hooks

// The step the effects answer: an answer to the call, rows to ask back, named blocks, and afters riding as context. [[spec/tickets/level0-hooks-hold-no-rule]]
type Step struct {
	Answer map[string]any `json:"answer,omitempty"`
	Rows   *string        `json:"rows,omitempty"`
	Blocks []Block        `json:"blocks,omitempty"`
	After  []string       `json:"after,omitempty"`
}

// One named block a prompt context hands on. [[spec/tickets/level0-hooks-hold-no-rule]]
type Block struct {
	Name string `json:"name"`
	Text string `json:"text"`
}

// The step the effects answer, in order: a result answers the call with its text as a deny, a block holds the Stop, rows ask back on the first post alone, and an after rides the answer as context. A call the door passes goes on to the harness. [[spec/design_output/model#the-effects]] [[spec/tickets/level0-tools-leave-the-bridge]]
func StepOf(effects []Effect, event string, asks bool) Step {
	step := Step{}
	for _, one := range effects {
		switch one.Kind {
		case resultKind:
			if one.Text != "" {
				return Step{Answer: map[string]any{"deny": one.Text}}
			}
			answer, _ := one.Result.(map[string]any)
			return Step{Answer: answer}
		case blockKind:
			return Step{Answer: map[string]any{"block": one.Text}}
		// A clear passes the turn, and the conversation clears behind it. [[spec/tickets/clear-answers-off-the-door]]
		case clearKind:
			return Step{Answer: map[string]any{"pass": true, "clear": map[string]any{"prompt": one.Text}}}
		// An event effect answers the rewritten event, the shape the bridge's prompt answer takes. [[spec/tickets/prompt-answers-off-the-door]]
		case eventKind:
			return Step{Answer: map[string]any{"event": one.Result}}
		case rowsKind:
			if asks {
				call := one.Call
				return Step{Rows: &call}
			}
		case afterKind:
			if one.Text == "" {
				continue
			}
			// A named after on a describe answers the field it names, the shape the bridge's describe answer takes. [[spec/tickets/describe-answers-off-the-door]]
			if one.Name != "" && event == describeEvent {
				return Step{Answer: map[string]any{"after": map[string]any{one.Name: one.Text}}}
			}
			// An after on the prompt context rides as a named block, the shape the context read hands on, and a named after on another event opens on its name as a heading. [[spec/tickets/brief-answers-off-the-door]]
			switch {
			case one.Name != "" && event == contextEvent:
				step.Blocks = append(step.Blocks, Block{Name: one.Name, Text: one.Text})
			case one.Name != "":
				step.After = append(step.After, "# "+one.Name+"\n"+one.Text)
			default:
				step.After = append(step.After, one.Text)
			}
		}
	}
	return step
}

// An answer with the adds merged in: a list grows, a text takes the new one below it, and anything else stands replaced. [[spec/design_output/schema#the-verbs-own-their-fields]]
func Merged(said any, adds map[string]any) map[string]any {
	out := map[string]any{}
	if held, ok := said.(map[string]any); ok {
		for key, value := range held {
			out[key] = value
		}
	}
	for key, value := range adds {
		was := out[key]
		grows, isList := value.([]any)
		stands, wasList := was.([]any)
		text, isText := value.(string)
		prior, wasText := was.(string)
		switch {
		case isList && wasList:
			out[key] = append(append([]any{}, stands...), grows...)
		case isText && wasText && prior != "":
			out[key] = prior + "\n\n" + text
		default:
			out[key] = value
		}
	}
	return out
}
