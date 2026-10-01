// The bus: a NATS server inside the index on loopback TCP, and the peer a
// placed process dials it with.
// [[spec/design_output/model#the-index-runs-nats]]
package index

import (
	"encoding/json"
	"errors"
)

// The environment a placed process reads the bus and its token off. [[spec/design_output/model#the-index-runs-nats]]
const (
	BusEnv   = "QUACK_BUS"
	TokenEnv = "QUACK_BUS_TOKEN"
)

// [[spec/design_output/model#the-index-runs-nats]]
type Bus struct {
	url, token string
	port       int
}

// [[spec/design_output/model#the-index-runs-nats]]
func StartBus() (*Bus, error) { return &Bus{}, nil }

func (b *Bus) URL() string   { return b.url }
func (b *Bus) Port() int     { return b.port }
func (b *Bus) Token() string { return b.token }
func (b *Bus) Close()        {}

// A peer on the bus: a placed process, or the index's own side of it. [[spec/design_output/model#names-become-subjects]]
type Peer struct{}

// [[spec/design_output/model#the-index-runs-nats]]
func Dial(url, token string) (*Peer, error) { return nil, errors.New("the bus stands unbuilt") }

// Publishes the values an instance commits on commit.<instance>. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Commit(instance string, values map[string]any) error {
	return errors.New("the bus stands unbuilt")
}

// Hands each commit an instance publishes to hand, its values still JSON. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Commits(instance string, hand func(values map[string]json.RawMessage)) (func(), error) {
	return func() {}, errors.New("the bus stands unbuilt")
}

func (p *Peer) Close() {}
