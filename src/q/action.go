// An action answers an ordered list of requests, and the index runs them.
// A module names a request, and reaches no IO module itself.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import (
	"bytes"
	"encoding/json"
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

// The IO module and verb that fold an event into a fold or a guard the store holds, and the arguments a request of it carries. [[spec/tickets/config-answers-keys-and-overrides]]
const (
	StoreModule = "store"
	StoreLand   = "land"
)

// A land: the fold's name, and the event it folds. [[spec/tickets/config-answers-keys-and-overrides]]
type Landing struct {
	Name  string `json:"name"`
	Event any    `json:"event"`
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
			decoded, err := fromMap[In](input)
			if err != nil {
				return nil, fmt.Errorf("%s takes a %s, not a %T", name, typeOf[In](), input)
			}
			one = decoded
		}
		return fn(one), nil
	}
	return &registration{name: name, kind: action, typ: typeOf[[]Request](), def: []Request{}, act: act, fields: fieldsOf(typeOf[In]()), takes: typeOf[In]()}
}

// A caller in the process hands a JSON object as a map, and an action taking a struct reads it as a surface decodes a body. [[spec/tickets/edit-tools-answer-in-go]]
func fromMap[In any](input any) (In, error) {
	var out In
	fields, ok := input.(map[string]any)
	if !ok || typeOf[In]().Kind() != reflect.Struct {
		return out, fmt.Errorf("%T reads as no %s", input, typeOf[In]())
	}
	body, err := json.Marshal(fields)
	if err != nil {
		return out, err
	}
	return out, json.Unmarshal(body, &out)
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
	one := s.owner(name)
	if one == nil || one.kind != action {
		return nil, fmt.Errorf("%s names no action", name)
	}
	into := reflect.New(one.takes)
	if len(bytes.TrimSpace(body)) > 0 {
		if err := json.Unmarshal(body, into.Interface()); err != nil {
			return nil, fmt.Errorf("%s takes a %s: %w", name, one.takes, err)
		}
	}
	return into.Elem().Interface(), nil
}

// [[spec/design_output/model#an-action-lists-requests]]
func (s *Store) Act(name string, input any) ([]Request, error) {
	one := s.owner(name)
	if one == nil || one.kind != action {
		return nil, fmt.Errorf("%s names no action", name)
	}
	return one.act(input)
}
