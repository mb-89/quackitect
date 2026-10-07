// The door's network in memory: a listen answers a port of its own, a dial
// meets the listener on that port over a pipe, and a late port answers every
// post past its time. The door's own owns.yaml holds this file.
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

// The first port the fake network answers. [[spec/tickets/test-walks-move-onto-fakes]]
const firstFakePort = 40000

// The listeners standing, the ports marked late, and the listen whose turn fails. [[spec/tickets/test-walks-move-onto-fakes]]
type memNet struct {
	mu    sync.Mutex
	ports map[int]*memListener
	late  map[int]bool
	next  int
	calls int
	// The listen, counted from one, that answers a taken port; none at zero.
	failsAt int
	// Every listener the network made, in order.
	made []*memListener
}

// A network the door's clients post over until the case ends. [[spec/tickets/test-walks-move-onto-fakes]]
func newMemNet(t *testing.T) *memNet {
	t.Helper()
	n := &memNet{ports: map[int]*memListener{}, late: map[int]bool{}, next: firstFakePort}
	was := doorTransport
	doorTransport = memTransport{from: n, inner: &http.Transport{DialContext: n.dial}}
	t.Cleanup(func() { doorTransport = was })
	return n
}

// [[spec/tickets/test-walks-move-onto-fakes]]
func (n *memNet) listen(network, address string) (net.Listener, error) {
	n.mu.Lock()
	defer n.mu.Unlock()
	n.calls++
	if n.calls == n.failsAt {
		return nil, errors.New("the port stands taken")
	}
	n.next++
	one := &memListener{port: n.next, conns: make(chan net.Conn), closed: make(chan struct{}), from: n}
	n.ports[one.port] = one
	n.made = append(n.made, one)
	return one, nil
}

// A dial meets the listener on the port over a pipe, and a port nobody listens on refuses it. [[spec/tickets/test-walks-move-onto-fakes]]
func (n *memNet) dial(ctx context.Context, network, address string) (net.Conn, error) {
	_, at, err := net.SplitHostPort(address)
	if err != nil {
		return nil, err
	}
	port, _ := strconv.Atoi(at)
	n.mu.Lock()
	one := n.ports[port]
	n.mu.Unlock()
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
	n.mu.Lock()
	defer n.mu.Unlock()
	n.next++
	n.late[n.next] = true
	return n.next
}

// [[spec/tickets/test-walks-move-onto-fakes]]
type memListener struct {
	port   int
	conns  chan net.Conn
	closed chan struct{}
	once   sync.Once
	from   *memNet
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

// The transport over the fake network, which answers a post to a late port with the timeout a busy door meets. [[spec/tickets/test-walks-move-onto-fakes]]
type memTransport struct {
	from  *memNet
	inner *http.Transport
}

func (one memTransport) RoundTrip(r *http.Request) (*http.Response, error) {
	port, _ := strconv.Atoi(r.URL.Port())
	one.from.mu.Lock()
	late := one.from.late[port]
	one.from.mu.Unlock()
	if late {
		return nil, os.ErrDeadlineExceeded
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
