// The bus: a NATS server inside the index on loopback TCP, and the peer a
// placed process dials it with.
// [[spec/design_output/model#the-index-runs-nats]]
package index

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"net"
	"strings"
	"time"

	"github.com/nats-io/nats-server/v2/server"
	"github.com/nats-io/nats.go"
)

// The environment a placed process reads the bus and its token off. [[spec/design_output/model#the-index-runs-nats]]
const (
	BusEnv   = "QUACK_BUS"
	TokenEnv = "QUACK_BUS_TOKEN"
)

// The loopback host, the bytes of a token, the wait for the server to stand, and the largest message, which a seed of every file fits under until values ride in chunks. [[spec/design_output/model#the-index-runs-nats]]
const (
	busHost    = "127.0.0.1"
	tokenBytes = 24
	busReady   = 10 * time.Second
	busPayload = 64 << 20
)

// The verb tokens in front of a subject. [[spec/design_output/model#names-become-subjects]]
const (
	commitVerb = "commit."
	leaseVerb  = "lease."
	runVerb    = "run."
	inVerb     = "in."
)

// The wait a module process gives the index to answer its inputs. [[spec/design_output/model#names-become-subjects]]
const inputsWait = 30 * time.Second

// The body of an ask for the inputs moved since the last answer, where an empty ask wants them whole. [[spec/design_output/model#names-become-subjects]]
const askMoved = "moved"

// [[spec/design_output/model#the-index-runs-nats]]
type Bus struct {
	server *server.Server
	token  string
}

// Runs the server on loopback, on a port the system picks, with no JetStream and no disk. [[spec/design_output/model#the-index-runs-nats]]
func StartBus() (*Bus, error) {
	secret := make([]byte, tokenBytes)
	if _, err := rand.Read(secret); err != nil {
		return nil, err
	}
	token := hex.EncodeToString(secret)
	one, err := server.NewServer(&server.Options{
		Host: busHost, Port: server.RANDOM_PORT, Authorization: token,
		NoLog: true, NoSigs: true, MaxPayload: busPayload,
	})
	if err != nil {
		return nil, err
	}
	go one.Start()
	if !one.ReadyForConnections(busReady) {
		one.Shutdown()
		return nil, errors.New("the bus stands up within no wait")
	}
	return &Bus{server: one, token: token}, nil
}

func (b *Bus) URL() string   { return b.server.ClientURL() }
func (b *Bus) Port() int     { return b.server.Addr().(*net.TCPAddr).Port }
func (b *Bus) Token() string { return b.token }

func (b *Bus) Close() {
	b.server.Shutdown()
	b.server.WaitForShutdown()
}

// A peer on the bus: a placed process, or the index's own side of it. [[spec/design_output/model#names-become-subjects]]
type Peer struct {
	conn *nats.Conn
	done chan struct{}
}

// A peer dials once and stays down once the bus goes, since a new index stands a new bus. [[spec/design_output/model#the-index-runs-nats]]
func Dial(url, token string) (*Peer, error) {
	done := make(chan struct{})
	conn, err := nats.Connect(url, nats.Token(token), nats.NoReconnect(), nats.ClosedHandler(func(*nats.Conn) { close(done) }))
	if err != nil {
		return nil, err
	}
	return &Peer{conn: conn, done: done}, nil
}

// Closes once the peer leaves the bus, by its own close or the bus's. [[spec/design_output/model#the-index-runs-nats]]
func (p *Peer) Done() <-chan struct{} { return p.done }

// Publishes the values an instance commits on commit.<instance>. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Commit(instance string, values map[string]any) error {
	body, err := json.Marshal(values)
	if err != nil {
		return err
	}
	if err := p.conn.Publish(commitVerb+instance, body); err != nil {
		return err
	}
	return p.conn.Flush()
}

// Hands each commit an instance publishes to hand, its values still JSON. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Commits(instance string, hand func(values map[string]json.RawMessage)) (func(), error) {
	sub, err := p.conn.Subscribe(commitVerb+instance, func(said *nats.Msg) {
		var values map[string]json.RawMessage
		if json.Unmarshal(said.Data, &values) == nil {
			hand(values)
		}
	})
	if err != nil {
		return nil, err
	}
	if err := sub.SetPendingLimits(-1, -1); err != nil {
		return nil, err
	}
	return func() { _ = sub.Unsubscribe() }, p.conn.Flush()
}

// Publishes a heartbeat on lease.<part>. [[spec/design_output/model#a-lease]]
func (p *Peer) Beat(part string) error {
	if err := p.conn.Publish(leaseVerb+part, nil); err != nil {
		return err
	}
	return p.conn.Flush()
}

func (p *Peer) Close() { p.conn.Close() }

// Publishes run.<instance>: an input of a placed instance moves. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Run(instance string) error {
	if err := p.conn.Publish(runVerb+instance, nil); err != nil {
		return err
	}
	return p.conn.Flush()
}

// Hands each run.<instance> to hand. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Runs(instance string, hand func()) (func(), error) {
	sub, err := p.conn.Subscribe(runVerb+instance, func(*nats.Msg) { hand() })
	if err != nil {
		return nil, err
	}
	return func() { _ = sub.Unsubscribe() }, p.conn.Flush()
}

// Hands the part of each heartbeat on lease.<part> to hand. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Leases(hand func(part string)) (func(), error) {
	sub, err := p.conn.Subscribe(leaseVerb+">", func(said *nats.Msg) { hand(strings.TrimPrefix(said.Subject, leaseVerb)) })
	if err != nil {
		return nil, err
	}
	return func() { _ = sub.Unsubscribe() }, p.conn.Flush()
}

// Asks in.<instance>, and answers the saved inputs. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Inputs(instance string) ([]byte, error) { return p.asks(instance, nil) }

// Asks in.<instance> for the inputs moved since the last answer. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) Moved(instance string) ([]byte, error) { return p.asks(instance, []byte(askMoved)) }

func (p *Peer) asks(instance string, body []byte) ([]byte, error) {
	said, err := p.conn.Request(inVerb+instance, body, inputsWait)
	if err != nil {
		return nil, err
	}
	return said.Data, nil
}

// Answers each in.<instance> with what saved answers. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) AnswersInputs(instance string, saved func() ([]byte, error)) (func(), error) {
	return p.AnswersMoved(instance, func(bool) ([]byte, error) { return saved() })
}

// Answers each in.<instance> with what saved answers, told whether the ask wants the moved inputs alone. [[spec/design_output/model#names-become-subjects]]
func (p *Peer) AnswersMoved(instance string, saved func(moved bool) ([]byte, error)) (func(), error) {
	sub, err := p.conn.Subscribe(inVerb+instance, func(asked *nats.Msg) {
		body, err := saved(string(asked.Data) == askMoved)
		if err != nil {
			body = []byte("{}")
		}
		_ = asked.Respond(body)
	})
	if err != nil {
		return nil, err
	}
	return func() { _ = sub.Unsubscribe() }, p.conn.Flush()
}
