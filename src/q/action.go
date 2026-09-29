// An action answers an ordered list of requests, and the index runs them.
// A module names a request, and reaches no IO module itself.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import (
	"fmt"
	"reflect"
)

// A request names the IO module that accepts it, its verb and its arguments, and its undo or the reason it takes none. The last request of a list carries the Then that reads the list's answers. [[spec/design_output/model#an-action-lists-requests]]
type Request struct {
	Module string
	Verb   string
	Args   any
	Undo   *Request
	NoUndo string
	Then   func(answers []any) []Request
}

func Action[In any](name string, fn func(In) []Request, opts ...Option) Writer {
	return Main.add(actionOf(name, fn), callerAt(2), opts)
}

func ActionIn[In any](c *Catalog, name string, fn func(In) []Request, opts ...Option) Writer {
	return c.add(actionOf(name, fn), callerAt(2), opts)
}

func actionOf[In any](name string, fn func(In) []Request) *registration {
	act := func(input any) ([]Request, error) {
		one, ok := input.(In)
		if !ok {
			return nil, fmt.Errorf("%s takes a %s, not a %T", name, typeOf[In](), input)
		}
		return fn(one), nil
	}
	return &registration{name: name, kind: action, typ: typeOf[[]Request](), def: []Request{}, act: act, fields: fieldsOf(typeOf[In]()), takes: typeOf[In]()}
}

// The input type an action takes, and the type q.Answers declares, nil where it declares none, so a surface draws its schema. [[spec/tickets/actions-answer-over-http]]
func (s *Store) Types(name string) (in, out reflect.Type, ok bool) {
	one := s.owner(name)
	if one == nil || one.kind != action {
		return nil, nil, false
	}
	return one.takes, one.answers, true
}

// Decodes a JSON body into the input type the action takes, and an empty body into its zero value. [[spec/tickets/actions-answer-over-http]]
func (s *Store) Input(name string, body []byte) (any, error) {
	return nil, fmt.Errorf("%s decodes no input yet", name)
}

// [[spec/design_output/model#an-action-lists-requests]]
func (s *Store) Act(name string, input any) ([]Request, error) {
	one := s.owner(name)
	if one == nil || one.kind != action {
		return nil, fmt.Errorf("%s names no action", name)
	}
	return one.act(input)
}
