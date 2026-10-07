// The door's network in memory: a listen answers a port of its own, a dial
// meets the listener on that port over a pipe, and a late port answers every
// post past its time. The cases share one port table, so they run beside each
// other, and a post to a port outside the table reaches the real
// loopback the contract cases stand on. The door's own owns.yaml holds this file.
// [[spec/tickets/test-walks-move-onto-fakes]]
package index

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net"
	"net/http"
	"os"
	"strconv"
	"sync"
	"testing"
)

// The port the fake table counts up from, so every fake port stands below the ports a kernel hands a real listener. [[spec/tickets/test-walks-move-onto-fakes]]
const firstFakePort = 0

// The ports the fake network handed, the listeners standing on them, and the ports marked late. [[spec/tickets/test-walks-move-onto-fakes]]
type memPorts struct {
	mu    sync.Mutex
	ports map[int]*memListener
	late  map[int]bool
	next  int
}

// The one port table every case's network hands its ports from. [[spec/tickets/test-walks-move-onto-fakes]]
var fakePorts = &memPorts{ports: map[int]*memListener{}, late: map[int]bool{}, next: firstFakePort}

// The door's clients post over the fake network for the whole run, and the transport stays put. [[spec/tickets/test-walks-move-onto-fakes]]
func init() {
	doorTransport = memTransport{from: fakePorts, inner: &http.Transport{DialContext: fakePorts.dial}, real: http.DefaultTransport}
}

// A listener on the next port the table hands. [[spec/tickets/test-walks-move-onto-fakes]]
func (table *memPorts) opens() *memListener {
	table.mu.Lock()
	defer table.mu.Unlock()
	table.next++
	one := &memListener{port: table.next, conns: make(chan net.Conn), closed: make(chan struct{}), from: table}
	table.ports[one.port] = one
	return one
}

// Whether the table handed the port, and whether it stands late. [[spec/tickets/test-walks-move-onto-fakes]]
func (table *memPorts) handed(port int) (fake, late bool) {
	table.mu.Lock()
	defer table.mu.Unlock()
	return port > firstFakePort && port <= table.next, table.late[port]
}

// A dial meets the listener on the port over a pipe, and a port nobody listens on refuses it. [[spec/tickets/test-walks-move-onto-fakes]]
func (table *memPorts) dial(ctx context.Context, network, address string) (net.Conn, error) {
	_, at, err := net.SplitHostPort(address)
	if err != nil {
		return nil, err
	}
	port, _ := strconv.Atoi(at)
	table.mu.Lock()
	one := table.ports[port]
	table.mu.Unlock()
	refused := errors.New("nothing listens on " + address)
	if one == nil {
		return nil, refused
	}
	server, client := net.Pipe()
	select {
	case one.conns <- server:
		return client, nil
	case <-one.closed:
	case <-ctx.Done():
	}
	server.Close()
	client.Close()
	return nil, refused
}

// One case's network over the shared table: the listens it counts, and the listen whose turn fails. [[spec/tickets/test-walks-move-onto-fakes]]
type memNet struct {
	mu      sync.Mutex
	calls   int
	failsAt int
	made    []*memListener
}

// A network of the case's own, whose ports the door's clients reach. [[spec/tickets/test-walks-move-onto-fakes]]
func newMemNet(t *testing.T) *memNet {
	t.Helper()
	return &memNet{}
}

// [[spec/tickets/test-walks-move-onto-fakes]]
func (n *memNet) listen(network, address string) (net.Listener, error) {
	n.mu.Lock()
	defer n.mu.Unlock()
	n.calls++
	if n.calls == n.failsAt {
		return nil, errors.New("the port stands taken")
	}
	one := fakePorts.opens()
	n.made = append(n.made, one)
	return one, nil
}

// A door answering each call through the hand, on a port of its own. [[spec/tickets/test-walks-move-onto-fakes]]
func (n *memNet) serves(t *testing.T, hand func(said call) answer) int {
	t.Helper()
	listen, _ := n.listen("tcp", "127.0.0.1:0")
	server := &http.Server{Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var said call
		json.NewDecoder(r.Body).Decode(&said)
		out := hand(said)
		out.ID = said.ID
		writes(w, out)
	})}
	go server.Serve(listen)
	t.Cleanup(func() { server.Close() })
	return listen.(*memListener).port
}

// A port whose door is busy, so every post to it runs past its time. [[spec/tickets/test-walks-move-onto-fakes]]
func (n *memNet) lates() int {
	fakePorts.mu.Lock()
	defer fakePorts.mu.Unlock()
	fakePorts.next++
	fakePorts.late[fakePorts.next] = true
	return fakePorts.next
}

// [[spec/tickets/test-walks-move-onto-fakes]]
type memListener struct {
	port   int
	conns  chan net.Conn
	closed chan struct{}
	once   sync.Once
	from   *memPorts
}

func (one *memListener) Accept() (net.Conn, error) {
	select {
	case conn := <-one.conns:
		return conn, nil
	case <-one.closed:
		return nil, net.ErrClosed
	}
}

func (one *memListener) Close() error {
	one.once.Do(func() {
		close(one.closed)
		one.from.mu.Lock()
		delete(one.from.ports, one.port)
		one.from.mu.Unlock()
	})
	return nil
}

func (one *memListener) Addr() net.Addr {
	return &net.TCPAddr{IP: net.IPv4(127, 0, 0, 1), Port: one.port}
}

// The transport over the fake network, which answers a post to a late port with the timeout a busy door meets, and hands a port outside the table to the real loopback. [[spec/tickets/test-walks-move-onto-fakes]]
type memTransport struct {
	from  *memPorts
	inner *http.Transport
	real  http.RoundTripper
}

func (one memTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	port, _ := strconv.Atoi(r.URL.Port())
	fake, late := one.from.handed(port)
	if late {
		return nil, os.ErrDeadlineExceeded
	}
	if !fake {
		return one.real.RoundTrip(r)
	}
	return one.inner.RoundTrip(r)
}

// What the door answers a request: its status, its headers, and its body read whole. [[spec/tickets/test-walks-move-onto-fakes]]
type reply struct {
	StatusCode int
	Header     http.Header
	Body       []byte
}

// A request to the door over the transport a client posts on, with the headers the case sends, read whole. [[spec/tickets/test-walks-move-onto-fakes]]
func asksDoor(method, url string, headers map[string]string, body io.Reader) (reply, error) {
	said, stream, err := streamsDoor(method, url, headers, body)
	if err != nil {
		return reply{}, err
	}
	defer stream.Close()
	said.Body, err = io.ReadAll(stream)
	return said, err
}

// The same request, its body left open for the case to read as it streams. [[spec/tickets/test-walks-move-onto-fakes]]
func streamsDoor(method, url string, headers map[string]string, body io.Reader) (reply, io.ReadCloser, error) {
	asked, err := http.NewRequest(method, url, body)
	if err != nil {
		return reply{}, nil, err
	}
	for key, value := range headers {
		asked.Header.Set(key, value)
	}
	said, err := (&http.Client{Transport: doorTransport}).Do(asked)
	if err != nil {
		return reply{}, nil, err
	}
	return reply{StatusCode: said.StatusCode, Header: said.Header}, said.Body, nil
}
