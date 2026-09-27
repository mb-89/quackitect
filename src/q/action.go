// An action answers an ordered list of door calls, and the index runs them.
// A module names a call, and addresses no door.
// [[spec/design_output/model#an-action-lists-calls]]
package q

import "fmt"

// A call names its door, its verb and its arguments, and its undo or the reason it takes none. The last call of a list carries the Then that reads the list's answers. [[spec/design_output/model#an-action-lists-calls]]
type Call struct {
	Door   string
	Verb   string
	Args   any
	Undo   *Call
	NoUndo string
	Then   func(answers []any) []Call
}

func Action[In any](name string, fn func(In) []Call, opts ...Option) Writer {
	return Main.add(actionOf(name, fn), callerAt(2), opts)
}

func ActionIn[In any](c *Catalog, name string, fn func(In) []Call, opts ...Option) Writer {
	return c.add(actionOf(name, fn), callerAt(2), opts)
}

func actionOf[In any](name string, fn func(In) []Call) *registration {
	act := func(input any) ([]Call, error) {
		one, ok := input.(In)
		if !ok {
			return nil, fmt.Errorf("%s takes a %s, not a %T", name, typeOf[In](), input)
		}
		return fn(one), nil
	}
	return &registration{name: name, kind: action, typ: typeOf[[]Call](), def: []Call{}, act: act}
}

// [[spec/design_output/model#an-action-lists-calls]]
func (s *Store) Act(name string, input any) ([]Call, error) {
	one := s.owner(name)
	if one == nil || one.kind != action {
		return nil, fmt.Errorf("%s names no action", name)
	}
	return nil, nil
}
