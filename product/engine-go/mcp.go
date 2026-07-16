package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
	"sort"
	"strings"
	"sync"
	"time"
)

// design: go-mcp-server  implements: req-mcp-server.1, req-mcp-server.2, req-mcp-server.4, req-mcp-server.5, req-mcp-server.6
// The MCP transport is hand-rolled and zero-dependency, over stdio (adr-mcp-transport). It uses newline-delimited JSON-RPC 2.0 over stdin/stdout, with three methods: initialize, tools/list, tools/call. The protocol version is PINNED. ALL diagnostics go to stderr, so stdout stays pure framing. The tool surface is GENERATED from the command surface: one core, thin faces. So a read-only command (status, why, notes) and a ledger command (next, start, bless) each become a tool. Its call dispatches to the real command and answers with its structured result, read fresh from the workspace at call time. A failed tool call is a RESULT with isError set, never a broken transport. Only a parse failure or an unknown method is a JSON-RPC error. A newer staged build supersedes the running server: the loop exits before answering a later call from stale code.
const mcpProtocolVersion = "2025-06-18"

// mcpRequest keeps ID as raw JSON to tell a notification (id ABSENT) from a request
// (id present as number/string/null, echoed verbatim).
type mcpRequest struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id,omitempty"`
	Method  string          `json:"method"`
	Params  json.RawMessage `json:"params,omitempty"`
}

type mcpResponse struct {
	JSONRPC string          `json:"jsonrpc"`
	ID      json.RawMessage `json:"id"`
	Result  interface{}     `json:"result,omitempty"`
	Error   *mcpRPCError    `json:"error,omitempty"`
}

type mcpRPCError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// mcpToolSpec is one tool's METADATA — the face. The command it fronts and whether that command
// advances the ledger are all the dispatch needs; the invocation lives in the session's handler.
type mcpToolSpec struct {
	Name        string                 `json:"name"`
	Description string                 `json:"description"`
	InputSchema map[string]interface{} `json:"inputSchema"`
	ledger      bool                   // a ledger-advancing command: gated by the per-session attest choke
}

func mcpObjSchema(props map[string]interface{}, required ...string) map[string]interface{} {
	s := map[string]interface{}{"type": "object", "properties": props}
	if len(required) > 0 {
		s["required"] = required
	}
	return s
}

func mcpStr(desc string) map[string]interface{} {
	return map[string]interface{}{"type": "string", "description": desc}
}

func mcpBool(desc string) map[string]interface{} {
	return map[string]interface{}{"type": "boolean", "description": desc}
}

// mcpTools is the surface, generated once. Ledger classification MIRRORS the CLI channel
// (attestGatedCmds) so an MCP session obeys the same attest rules as the command line.
func mcpTools() []mcpToolSpec {
	return []mcpToolSpec{
		{
			Name:        "status",
			Description: "The gate board: exceptions by default, or why one id is suspect.",
			InputSchema: mcpObjSchema(map[string]interface{}{"id": mcpStr("optional check id to explain")}),
		},
		{
			Name:        "why",
			Description: "What input changed for a check.",
			InputSchema: mcpObjSchema(map[string]interface{}{"id": mcpStr("the check id")}, "id"),
		},
		{
			Name:        "notes",
			Description: "Open inbox notes; all adds backlog and archive.",
			InputSchema: mcpObjSchema(map[string]interface{}{"all": mcpBool("include backlog and archive")}),
		},
		{
			Name:        "note",
			Description: "Capture an idea into the note inbox.",
			InputSchema: mcpObjSchema(map[string]interface{}{"text": mcpStr("the note text")}, "text"),
		},
		{
			Name:        "next",
			Description: "The next ready check to walk.",
			InputSchema: mcpObjSchema(map[string]interface{}{"prefer": mcpStr("optional version id to prefer")}),
			ledger:      true,
		},
		{
			Name:        "start",
			Description: "Activate a version, or register a future one with plan.",
			InputSchema: mcpObjSchema(map[string]interface{}{
				"id":   mcpStr("the version id (i_NNNN_name)"),
				"plan": mcpBool("register a future version instead of activating"),
			}, "id"),
			ledger: true,
		},
		{
			Name:        "bless",
			Description: "Record an adjudication for a check (or all suspect gates).",
			InputSchema: mcpObjSchema(map[string]interface{}{
				"target": mcpStr("the check id, or --all for the suspect wave"),
				"by":     mcpStr("the actor: user or agent"),
			}, "target"),
			ledger: true,
		},
		{
			Name:        "attest",
			Description: "Attest this session with an earned session key; unlocks ledger tools for the connection.",
			InputSchema: mcpObjSchema(map[string]interface{}{"key": mcpStr("the earned session key")}, "key"),
		},
		{
			Name:        "query",
			Description: "Read-only rows from the loaded graph: nodes by field, edge.* for edges, note.* for notes.",
			InputSchema: mcpObjSchema(map[string]interface{}{
				"expr": mcpStr("the pinned Bases-subset expression, e.g. type == \"requirement\" && state == \"SUSPECT\"")}, "expr"),
		},
		{
			Name:        "observe-red",
			Description: "Run a test and record it FAILING at its current hash; a pass is refused. refresh re-attests an amended, still-failing test.",
			InputSchema: mcpObjSchema(map[string]interface{}{
				"test":    mcpStr("the test node id"),
				"refresh": mcpBool("re-attest an amended, still-failing test"),
			}, "test"),
			ledger: true,
		},
		{
			Name:        "ship",
			Description: "Package product/ into the data home with fresh book and report; runs immediately after the M8 bless (owner law).",
			InputSchema: mcpObjSchema(map[string]interface{}{}),
			ledger:      true,
		},
	}
}

func mcpToolNames() []string {
	ts := mcpTools()
	names := make([]string, len(ts))
	for i, t := range ts {
		names[i] = t.Name
	}
	sort.Strings(names)
	return names
}

func mcpToolByName(name string) (mcpToolSpec, bool) {
	for _, t := range mcpTools() {
		if t.Name == name {
			return t, true
		}
	}
	return mcpToolSpec{}, false
}

// mcpRun executes one command handler exit-aware: a quackExit inside becomes an isError
// result carrying the handler's output, never a dead transport (go-mcp-errors).
func mcpRun(fn func()) map[string]interface{} {
	out, code := mcpCaptureExit(fn)
	return mcpTextResult(code > 0, out)
}

// mcpTextResult is one tools/call result: a single text content item plus the isError flag.
func mcpTextResult(isError bool, text string) map[string]interface{} {
	return map[string]interface{}{
		"content": []map[string]interface{}{{"type": "text", "text": text}},
		"isError": isError,
	}
}

// mcpLog routes a diagnostic line to stderr — stdout carries pure framing only.
func mcpLog(args ...interface{}) {
	fmt.Fprint(os.Stderr, "[mcp] ")
	fmt.Fprintln(os.Stderr, args...)
}

// cmdMCP runs the stdio MCP surface. The default face is the SUPERVISOR: a thin parent that
// proxies stdio to a swappable child engine (adr-mcp-supervisor). --child serves directly.
func cmdMCP(args []string) {
	mcpServing = true // exits become recoverable errors (go-mcp-errors)
	if hasFlag(args, "--child") {
		mcpChildMode = true
		mcpLog("child up; protocol", mcpProtocolVersion)
		newMCPSession().serve(os.Stdin, os.Stdout)
		mcpLog("child stdin closed; exiting clean")
		return
	}
	mcpLog("supervisor up; protocol", mcpProtocolVersion)
	supervise()
	mcpLog("stdin closed; exiting clean")
}

// design: go-mcp-supervisor  implements: req-mcp-reload
// The parent never exits and never swaps itself. It proxies newline framing to a child engine spawned from the CURRENT binary path. When a newer build stages, it drains open replies, respawns the child from the staged binary, replays the client's initialize, and emits list_changed. This is the sequence model-reload-sequence draws. A child that dies on its own is respawned the same way.
var mcpChildMode bool

type supState struct {
	mu         sync.Mutex
	inFlight   int
	swapWanted bool
	initLine   []byte
	child      *exec.Cmd
	childIn    io.WriteCloser
	childBorn  int64
	out        *bufio.Writer
	seq        supSequence
}

func supSpawnArgs() []string {
	exe, err := os.Executable()
	if err != nil {
		exe = "quack"
	}
	return append([]string{exe, "mcp", "--child"}, os.Args[2:]...)
}

func (st *supState) spawn(replayInit bool) error {
	a := supSpawnArgs()
	c := exec.Command(a[0], a[1:]...)
	c.Stderr = os.Stderr
	in, err := c.StdinPipe()
	if err != nil {
		return err
	}
	outPipe, err := c.StdoutPipe()
	if err != nil {
		return err
	}
	if err := c.Start(); err != nil {
		return err
	}
	st.child, st.childIn = c, in
	st.childBorn = mcpBornStamp()
	sc := bufio.NewScanner(outPipe)
	sc.Buffer(make([]byte, 0, 1<<20), 8<<20)
	if replayInit && st.initLine != nil {
		in.Write(append(st.initLine, '\n'))
		if sc.Scan() {
			mcpLog("supervisor: child re-initialized")
		}
	}
	go st.pump(sc, c)
	return nil
}

// pump forwards one child's stdout to the client and tracks reply drainage. It ends
// with its child; a dead child with no swap pending is respawned by the next request.
func (st *supState) pump(sc *bufio.Scanner, c *exec.Cmd) {
	for sc.Scan() {
		line := append([]byte{}, sc.Bytes()...)
		var f struct {
			ID json.RawMessage `json:"id,omitempty"`
		}
		json.Unmarshal(line, &f)
		st.mu.Lock()
		if st.child == c { // a superseded pump never writes
			st.out.Write(append(line, '\n'))
			st.out.Flush()
			if len(f.ID) > 0 && st.inFlight > 0 {
				st.inFlight--
			}
		}
		st.mu.Unlock()
	}
}

// swapIfReady performs the drain-spawn-notify sequence when a swap is wanted and no
// reply is open. Callers hold no lock.
func (st *supState) swapIfReady() {
	st.mu.Lock()
	ready := supSwapReady(st.inFlight, st.swapWanted)
	if ready {
		st.swapWanted = false
	}
	st.mu.Unlock()
	if !ready {
		return
	}
	st.seq.record("drain")
	mcpLog("supervisor: drained; swapping the child")
	if st.childIn != nil {
		st.childIn.Close()
	}
	if st.child != nil && st.child.Process != nil {
		st.child.Process.Kill()
		st.child.Wait()
	}
	if err := st.spawn(true); err != nil {
		mcpLog("supervisor: respawn failed:", err)
		return
	}
	st.seq.record("spawn")
	st.mu.Lock()
	st.out.WriteString(supNotifyFrame() + "\n")
	st.out.Flush()
	st.mu.Unlock()
	st.seq.record("notify")
	mcpLog("supervisor: list_changed emitted")
}

func supervise() {
	st := &supState{out: bufio.NewWriter(os.Stdout)}
	if err := st.spawn(false); err != nil {
		mcpLog("supervisor: cannot spawn the child engine:", err)
		return
	}
	// the stamp watcher: an idle session still swaps and notifies
	go func() {
		for {
			time.Sleep(500 * time.Millisecond)
			st.mu.Lock()
			stale := mcpSuperseded(st.childBorn)
			if stale {
				st.swapWanted = true
			}
			st.mu.Unlock()
			if stale {
				st.swapIfReady()
			}
		}
	}()
	in := bufio.NewScanner(os.Stdin)
	in.Buffer(make([]byte, 0, 1<<20), 8<<20)
	for in.Scan() {
		line := append([]byte{}, in.Bytes()...)
		var f struct {
			ID     json.RawMessage `json:"id,omitempty"`
			Method string          `json:"method"`
		}
		json.Unmarshal(line, &f)
		if f.Method == "initialize" {
			st.initLine = append([]byte{}, line...)
		}
		// a stale child never answers a fresh request: swap first, then forward
		st.mu.Lock()
		if mcpSuperseded(st.childBorn) {
			st.swapWanted = true
		}
		dead := st.child == nil || st.child.ProcessState != nil
		st.mu.Unlock()
		deadline := time.Now().Add(supDrainTimeout())
		for time.Now().Before(deadline) {
			st.mu.Lock()
			wanted := st.swapWanted
			st.mu.Unlock()
			if !wanted {
				break
			}
			st.swapIfReady()
			time.Sleep(20 * time.Millisecond)
		}
		if dead {
			st.mu.Lock()
			st.swapWanted = true
			st.mu.Unlock()
			st.swapIfReady()
		}
		st.mu.Lock()
		if len(f.ID) > 0 {
			st.inFlight++
		}
		if st.childIn != nil {
			st.childIn.Write(append(line, '\n'))
		}
		st.mu.Unlock()
	}
}

// enddesign

// serve is the read/dispatch/flush loop: one JSON object per line, a reply per request, silence
// per notification, a clean return on EOF (req-mcp-server.4). Before each line it re-checks the
// build stamp; a staged newer build supersedes this process, which stops answering (req-mcp-server.5).
func (s *mcpSession) serve(r io.Reader, w io.Writer) {
	born := mcpBornStamp()
	br := bufio.NewReader(r)
	bw := bufio.NewWriter(w)
	defer bw.Flush()
	for {
		line, err := br.ReadBytes('\n')
		if len(line) > 0 {
			if mcpSuperseded(born) {
				mcpLog("a newer engine build is staged; the superseded server will not answer — exiting")
				return
			}
			s.handleLine(line, bw)
			bw.Flush()
		}
		if err != nil {
			if err != io.EOF {
				mcpLog("read error:", err)
			}
			return
		}
	}
}

// handleLine parses and routes one line. A notification (no id) is accepted silently; a request is
// answered by echoing its id verbatim.
func (s *mcpSession) handleLine(line []byte, w *bufio.Writer) {
	var req mcpRequest
	if err := json.Unmarshal(line, &req); err != nil {
		mcpWriteResp(w, mcpResponse{JSONRPC: "2.0", ID: json.RawMessage("null"),
			Error: &mcpRPCError{Code: -32700, Message: "parse error"}})
		return
	}
	isNotification := len(req.ID) == 0
	switch req.Method {
	case "initialize":
		mcpReply(w, req, map[string]interface{}{
			"protocolVersion": mcpProtocolVersion,
			"capabilities":    map[string]interface{}{"tools": map[string]interface{}{}},
			"serverInfo":      map[string]interface{}{"name": brand() + "-mcp", "version": version},
		})
	case "notifications/initialized", "notifications/cancelled":
		return // a notification is never answered
	case "ping":
		if !isNotification {
			mcpReply(w, req, map[string]interface{}{})
		}
	case "tools/list":
		mcpReply(w, req, map[string]interface{}{"tools": mcpTools()})
	case "tools/call":
		s.handleToolCall(w, req)
	default:
		if isNotification {
			return
		}
		mcpWriteResp(w, mcpResponse{JSONRPC: "2.0", ID: req.ID,
			Error: &mcpRPCError{Code: -32601, Message: "method not found: " + req.Method}})
	}
}

func mcpReply(w *bufio.Writer, req mcpRequest, result interface{}) {
	mcpWriteResp(w, mcpResponse{JSONRPC: "2.0", ID: req.ID, Result: result})
}

func mcpWriteResp(w *bufio.Writer, r mcpResponse) {
	b, err := json.Marshal(r)
	if err != nil {
		mcpLog("marshal error:", err)
		return
	}
	w.Write(b)
	w.WriteByte('\n') // newline-delimited framing
}

// mcpBornStamp reads the committed source stamp the running server was built from.
func mcpBornStamp() int64 {
	s, _ := readStampUnix(stampFile(EngineSrc()))
	return s
}

// mcpSuperseded reports whether a newer engine build has been staged since the server started —
// a newer committed source stamp, or a parked .staged binary waiting to swap in.
func mcpSuperseded(born int64) bool {
	if cur, ok := readStampUnix(stampFile(EngineSrc())); ok && cur > born {
		return true
	}
	if exe, err := os.Executable(); err == nil {
		if st, e := os.Stat(exe + ".staged"); e == nil && !st.IsDir() {
			return true
		}
	}
	return false
}

// mcpCapture runs a command shell and returns what it printed to stdout. It redirects os.Stdout to
// a temp FILE (not a pipe: a command that spawns a detached child would keep a pipe open and block
// the read); the MCP writer holds the ORIGINAL stdout handle, so framing is untouched.
func mcpCapture(fn func()) string {
	out, _ := mcpCaptureExit(fn)
	return out
}

// mcpCaptureExit additionally reports a handler's exit code: quackExit under a serving MCP
// session panics (go-mcp-errors) and lands here as a code instead of killing the transport.
// stderr is captured too, so a refusal's text reaches the tool result.
func mcpCaptureExit(fn func()) (string, int) {
	old, oldErr := os.Stdout, os.Stderr
	tmp, err := os.CreateTemp("", "quack-mcp-*.out")
	if err != nil {
		fn()
		return "", -1
	}
	defer os.Remove(tmp.Name())
	os.Stdout, os.Stderr = tmp, tmp
	code := -1
	func() {
		defer func() {
			if r := recover(); r != nil {
				if ep, ok := r.(quackExitPanic); ok {
					code = ep.code
				}
			}
		}()
		fn()
	}()
	os.Stdout, os.Stderr = old, oldErr
	tmp.Sync()
	tmp.Seek(0, 0)
	b, _ := io.ReadAll(tmp)
	tmp.Close()
	return strings.TrimRight(string(b), "\n"), code
}

// enddesign

// design: go-mcp-session  implements: req-mcp-server.3
// The per-session attest choke (adr-mcp-attest) treats the server process as the session. Read-only tools always run. The FIRST ledger-advancing tool call on an unattested session does not run. It returns the attest CHALLENGE as a tool result, not a transport error, the same challenge the command line derives from the live contract. The `attest` tool, given the earned session key, flips an IN-MEMORY flag. Nothing is written at rest. Thereafter ledger tools run with no key per call. The flag dies with the process, so a build swap ends the session and costs one re-attest.
type mcpSession struct {
	attested bool
	nonce    string // this session's challenge nonce, minted once at connect
}

func newMCPSession() *mcpSession {
	return &mcpSession{nonce: attestRandom(12, "b64")}
}

// handleToolCall dispatches one tools/call: it reads the arguments, applies the ledger choke, and
// runs the fronted command fresh against the workspace (req-mcp-server.2). An unknown tool or a bad
// argument is an isError RESULT — never a broken transport (req-mcp-server.6).
func (s *mcpSession) handleToolCall(w *bufio.Writer, req mcpRequest) {
	var p struct {
		Name      string                 `json:"name"`
		Arguments map[string]interface{} `json:"arguments"`
	}
	if len(req.Params) > 0 {
		_ = json.Unmarshal(req.Params, &p)
	}
	spec, ok := mcpToolByName(p.Name)
	if !ok {
		mcpReply(w, req, mcpTextResult(true, fmt.Sprintf(
			"unknown tool %q; available: %s", p.Name, strings.Join(mcpToolNames(), ", "))))
		return
	}
	if p.Name == "attest" {
		mcpReply(w, req, s.attestTool(argStr(p.Arguments, "key")))
		return
	}
	// the choke: an unattested session cannot advance the ledger — it gets the challenge, not the run
	if spec.ledger && !s.attested {
		mcpReply(w, req, s.attestChallengeResult(p.Name))
		return
	}
	mcpReply(w, req, s.runToolCommand(p.Name, p.Arguments))
}

// attestChallengeResult refuses a ledger call and hands back the contract-derived challenge, so the
// caller can earn a key and attest. It is a normal result, not an error.
func (s *mcpSession) attestChallengeResult(tool string) map[string]interface{} {
	ch, err := attestChallenge(s.nonce)
	if err != nil {
		return mcpTextResult(true, "attest required, but the contract challenge is unreadable: "+err.Error())
	}
	return mcpTextResult(false, fmt.Sprintf(
		"ledger tool %q is refused: this session is not attested. %s Read the contract, earn a session "+
			"key, then call the `attest` tool with it. Ledger tools then run for the rest of this connection.",
		tool, ch))
}

// attestTool flips the in-memory flag when handed a valid session key. It REUSES the CLI attest
// machinery (attestKeyValid + one budget spend); the MCP session forks nothing.
func (s *mcpSession) attestTool(key string) map[string]interface{} {
	if s.attested {
		return mcpTextResult(false, "this session is already attested.")
	}
	if !attestKeyValid(key) {
		return mcpTextResult(true, "attest: no valid session key — earn one via the contract ritual, then retry.")
	}
	attestConsume(key)
	s.attested = true
	return mcpTextResult(false, "session attested: ledger tools are now live for this connection.")
}

// runToolCommand invokes the real command behind a tool and captures its structured result. The
// ledger faces call inward to the walk and the adjudication surface; the read-only faces to the
// board and capture lanes. Arguments are pre-validated so a bad call is an isError result, never an
// exit that would break the transport.
func (s *mcpSession) runToolCommand(name string, args map[string]interface{}) map[string]interface{} {
	switch name {
	case "status":
		var a []string
		if id := argStr(args, "id"); id != "" {
			a = []string{id}
		}
		return mcpRun(func() { cmdStatus(a) })
	case "why":
		id := argStr(args, "id")
		if id == "" {
			return mcpTextResult(true, "why: 'id' (string) is required")
		}
		return mcpRun(func() { cmdWhy([]string{id}) })
	case "notes":
		var a []string
		if argBool(args, "all") {
			a = []string{"--all"}
		}
		return mcpRun(func() { cmdNotes(a) })
	case "note":
		text := argStr(args, "text")
		if strings.TrimSpace(text) == "" {
			return mcpTextResult(true, "note: 'text' (string) is required")
		}
		return mcpRun(func() { cmdNote([]string{text}) })
	case "next":
		var a []string
		if pref := argStr(args, "prefer"); pref != "" {
			a = []string{pref}
		}
		return mcpRun(func() { cmdNext(a) })
	case "start":
		id := argStr(args, "id")
		if id == "" {
			return mcpTextResult(true, "start: 'id' (string) is required")
		}
		a := []string{id}
		if argBool(args, "plan") {
			a = append(a, "--plan")
		}
		return mcpRun(func() { cmdStart(a) })
	case "bless":
		target := argStr(args, "target")
		if target == "" {
			return mcpTextResult(true, "bless: 'target' (string) is required")
		}
		a := []string{}
		if by := argStr(args, "by"); by != "" {
			a = append(a, "--by", by)
		}
		a = append(a, target)
		return mcpRun(func() { cmdBless(a) })
	case "query":
		expr := argStr(args, "expr")
		if strings.TrimSpace(expr) == "" {
			return mcpTextResult(true, "query: 'expr' (string) is required")
		}
		return mcpRun(func() { cmdQuery([]string{expr}) })
	case "observe-red":
		test := argStr(args, "test")
		if test == "" {
			return mcpTextResult(true, "observe-red: 'test' (string) is required")
		}
		a := []string{test}
		if argBool(args, "refresh") {
			a = append(a, "--refresh")
		}
		return mcpRun(func() { cmdObserveRed(a) })
	case "ship":
		return mcpRun(func() { cmdShip(nil) })
	default:
		return mcpTextResult(true, "tool not dispatchable: "+name)
	}
}

// enddesign

func argStr(m map[string]interface{}, key string) string {
	if m == nil {
		return ""
	}
	if v, ok := m[key].(string); ok {
		return v
	}
	return ""
}

func argBool(m map[string]interface{}, key string) bool {
	if m == nil {
		return false
	}
	b, _ := m[key].(bool)
	return b
}
