// The one writer of frontmatter: each op rewrites the front of a note in one
// form, and leaves the body byte for byte.
// [[spec/tickets/go-writes-the-frontmatter]]
package front

import "errors"

var ErrNoFront = errors.New("the note carries no front")

type Pair struct {
	Key   string
	Value any
}

type Ordered []Pair

func Quote(said string) string                        { return said }
func Set(text, key, value string) (string, error)     { return text, nil }
func Drop(text, key string) (string, error)           { return text, nil }
func Entry(text string, entry Ordered) (string, error) { return text, nil }
func After(text, hash string) (string, error)         { return text, nil }
func Mint(fields Ordered) string                      { return "" }
func Normalise(text string) (string, error)           { return text, nil }
