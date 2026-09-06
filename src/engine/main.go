package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"os"
	"os/signal"
	"path/filepath"
	"quackitect/engine/internal/replaced"
	saidbefore "quackitect/engine/internal/said"
	"quackitect/engine/internal/sessionlog"
	"quackitect/engine/internal/version"
	"strings"
	"sync"
	"syscall"
	"time"
)

// Level 0. It starts, it records, and it says it is alive. Nothing above it
// exists yet, so there is no authority to ask and every permission question
// answers permitted.
func main() {
	// THE ENGINE'S CONTEXT ENDS WITH THE ENGINE, and everything long-lived
	// takes it, so letting go once lets go of all of it. This is the one place
	// a context begins, which is why it is the one place context.Background is,
	// and it is made first so the client, the probe and the loop all take it.
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	// The guard runs as its own process, started by the harness. It reads one
	// event and answers, so it is handled before any flag is parsed.
	if len(os.Args) > 1 && os.Args[1] == "hook" {
		runHook(ctx, os.Args[2:])
		return
	}
	// THE LANGUAGE SERVER IS A PROCESS THE EDITOR STARTS, and it speaks to the
	// editor for as long as the window is open.
	if len(os.Args) > 1 && os.Args[1] == "lsp" {
		runLSP(os.Args[2:])
		return
	}
	// EVERY OTHER VERB RUNS IN THE ENGINE THAT LIVES, and this process is
	// its client: it sends the verb and prints what came back.
	if len(os.Args) > 1 {
		if _, ok := run[os.Args[1]]; ok {
			os.Exit(callTheEngine(ctx, os.Args[1], os.Args[2:]))
		}
	}
	flag.Usage = func() {
		out := flag.CommandLine.Output()
		fmt.Fprintln(out, "se - the engine and the guard. It records a session in the folder being")
		fmt.Fprintln(out, "worked on, writes the projections, and answers the harness.")
		fmt.Fprintln(out, "")
		fmt.Fprintln(out, "  se --work <folder>   record a session there")
		fmt.Fprintln(out, "  se hook              the guard. Reads one event on stdin")
		fmt.Fprintln(out, "  se work --help       mint a work token")
		fmt.Fprintln(out, "  se pull --help       ask the engine what to do next")
		fmt.Fprintln(out, "  se stop --help       name why you are stopping")
		fmt.Fprintln(out, "  se query --help      draw a view over the work")
		fmt.Fprintln(out, "  se view --help       change how a view looks")
		fmt.Fprintln(out, "  se lint --help       name what breaks a rule")
		fmt.Fprintln(out, "  se hold --help       stop the agent, or let it go on")
		fmt.Fprintln(out, "  se --said \"...\"      put what the person said in the record, word for word")
		fmt.Fprintln(out, "  se --answer \"...\"    put your answer to them in the record")
		fmt.Fprintln(out, "")
		flag.PrintDefaults()
	}
	help := flag.Bool("help", false, "print this and exit")
	helpShort := flag.Bool("h", false, "print this and exit")
	work := flag.String("work", "", "the folder being worked on (default: this one)")
	method := flag.String("method", "", "the method root (default: the folder above this program)")
	beat := flag.Duration("heartbeat", 5*time.Second, "how often to say it is alive")
	once := flag.Bool("once", false, "write a start record and exit")
	where := flag.Bool("where", false, "print the log path and exit")
	rotate := flag.Bool("rotate", false, "set the current log aside and exit, writing nothing")
	link := flag.Bool("link", false, "give every built program both its names as one file, and exit")
	stopFlag := flag.Bool("stop", false, "ask the engine running over this folder to stop, and exit")
	swapFlag := flag.Bool("swap", false, "ask the engine running over this folder to build the next one and hand over to it")
	built := flag.Bool("built", false, "with swap: hand over to the program already in .bin rather than building one")
	pingFlag := flag.Bool("ping", false, "print what the engine running over this folder says about itself, and exit")
	project := flag.Bool("project", false, "write the projections from guidance and exit")
	emergency := flag.String("emergency", "", "arm or disarm emergency mode: on, off, or status")
	bind := flag.String("bind", "", "how much of the engine speaks to the agent: bound, unbound, god, or status")
	ask := flag.String("ask", "", "ask the agent what is happening, and refuse it everything until it says: on, off, or status")
	reason := flag.String("reason", "", "why emergency mode is being armed")
	minutes := flag.Int("minutes", 30, "how long emergency mode lasts, at most 240")
	settings := flag.Bool("config", false, "print every parameter, its value, and where the value came from")
	tree := flag.Bool("tree", false, "print the parameter tree as declared")
	doing := flag.Bool("doing", false, "print what each actor is doing, and the hold, as JSON")
	burndown := flag.String("burndown", "", "print the burn down for one UTC day, or today with the word today")
	set := flag.String("set", "", "change one parameter: name=value")
	said := flag.String("said", "", "put what the person said in the record, word for word, and exit")
	answer := flag.String("answer", "", "put your answer to them in the record, and exit")
	// WHO IS SPEAKING. An obligation to answer belongs to one agent, because
	// several run here at once and a message given to one is not owed by all.
	// NO DEFAULT, ON PURPOSE. This verb cannot know who is calling it. The stub
	// runs it with no actor for every agent, so a default named one agent and
	// every other agent's answer discharged that one's obligation, and every
	// other agent's message landed on it.
	actor := flag.String("actor", "", "with said or answer: who is speaking")
	showVersion := flag.Bool("version", false, "print which build this is and exit")
	selftest := flag.Bool("selftest", false, "produce a copy, drive a project with it, and check what came out")
	keep := flag.Bool("keep", false, "with selftest: leave the temporary trees behind")
	produce := flag.String("produce", "", "make a copy of the method in this folder")
	whoDrives := flag.Bool("driver", false, "say which copy drives this folder")
	attach := flag.Bool("attach", false, "record that this copy drives this folder")
	initAs := flag.String("init", "", "make this folder a project or a vehicle")
	register := flag.Bool("register", false, "put this copy in the register and print its identity")
	copies := flag.Bool("copies", false, "list the copies on this machine, and which drives this folder")
	hostFlag := flag.Bool("host", false, "say where this box is, cloud or desk, and which variable said so")
	diagnose := flag.Bool("diagnose", false, "write a diagnosis of this box under .se/scratchpad, and print it")
	parseFlags()
	if *help || *helpShort {
		flag.CommandLine.SetOutput(os.Stdout)
		flag.Usage()
		return
	}

	if *showVersion {
		// Every project answers this, whatever it is written in.
		fmt.Printf("quackitect engine %s\n", version.Build)
		return
	}

	// THE ERROR IS READ BEFORE THE ROOTS ARE USED. It was checked after the
	// method was written over, so a FindRoots that failed was worked from.
	roots, err := FindRoots(*work, *method)
	if err != nil {
		fail(err)
	}
	dir := roots.Private("log")

	// The current log has one name, so a window can be opened on it before
	// the engine has written anything.
	if *where {
		fmt.Println(filepath.Join(dir, sessionlog.Current))
		return
	}

	// Setting the current log aside without starting. The editor calls this
	// when a window opens, so a log window opened before any engine shows
	// this session rather than the last one.
	// ONE FILE UNDER BOTH NAMES, ASKED FOR BY THE BUILD. Installing does this
	// too, and a build by hand is the thing that took it away.
	if *link {
		done, err := LinkEveryProgram(roots.Method)
		if err != nil {
			fail(err)
		}
		answerJSON(map[string]any{"linked": done})
		return
	}

	// ASK THE ENGINE OVER THIS FOLDER TO STOP. A person does, when they are
	// done with the tree. Replacing it with a newer build is a swap and not a
	// stop, because a stop severs whatever was in flight.
	if *stopFlag {
		if _, _, ok := askModel(roots, "stop", nil); !ok {
			fail(fmt.Errorf("no engine is running over %s", roots.Work))
		}
		fmt.Println("stopping")
		return
	}

	// HOW MUCH OF THIS ENGINE IS SPEAKING TO THE AGENT. The panel's button
	// presses this, and a person at a prompt can press it too. See unbound.go.
	if *bind != "" {
		if *bind == "status" {
			answerJSON(LoadBinding(roots))
			return
		}
		to := TheBinding(*bind)
		switch to {
		case Bound, Unbound, God:
		default:
			fail(fmt.Errorf("--bind takes bound, unbound, god or status, and not %q", *bind))
		}
		was := LoadBinding(roots)
		now, err := SetBinding(roots, to, "the owner")
		if err != nil {
			fail(err)
		}
		noteInLog(dir, "engine", "binding", "the engine is now "+string(now.At)+
			", and was "+string(was.At), sessionlog.Yes(), map[string]any{"at": now.At, "was": was.At})
		answerJSON(now)
		return
	}

	// ASK THE AGENT WHAT IS HAPPENING. Every call is refused until it answers.
	if *ask != "" {
		if *ask == "status" {
			answerJSON(LoadAsked(roots))
			return
		}
		now, err := SetAsked(roots, *ask == "on", "the owner")
		if err != nil {
			fail(err)
		}
		answerJSON(now)
		return
	}

	// ASK THE ENGINE TO REPLACE ITSELF. This is the one door to a new engine
	// over a tree that has one running: the engine builds, checks the new
	// program answers, waits for the calls in flight and hands over, keeping
	// the log session. Building over .bin by hand is refused and told this.
	if *swapFlag {
		said, err := askForASwap(roots, "asked for on the command line", *built)
		if err != nil {
			fail(err)
		}
		answerJSON(said)
		return
	}

	// ASK THE ENGINE HOW IT IS. The answer carries ready, once the first
	// scan is done, and watching, the daemon's own self-check of the tree's
	// watcher. The battery waits for the first at start and reads the
	// second as a check, so nothing in it waits on the operating system.
	if *pingFlag {
		raw, _, ok := askModel(roots, "ping", nil)
		if !ok {
			fail(fmt.Errorf("no engine is running over %s", roots.Work))
		}
		fmt.Println(string(raw))
		return
	}

	// WHERE THIS BOX IS, off util/cage/hosts.json. See host.go.
	if *hostFlag {
		answerJSON(TheHost(roots.Method))
		return
	}

	// A DIAGNOSIS OF THIS BOX, MEASURED. See host.go.
	if *diagnose {
		os.Exit(Diagnose(roots))
	}

	if *rotate {
		if err := sessionlog.RetireCurrent(dir); err != nil {
			fail(err)
		}
		fmt.Println(filepath.Join(dir, sessionlog.Current))
		return
	}

	// The projections are what other tools read. They are written from
	// guidance, and a changed original writes them again.
	if *project {
		written, err := Project(roots)
		if err != nil {
			fail(err)
		}
		for _, w := range written {
			fmt.Println(w)
		}
		return
	}

	// WHAT THE PERSON SAID, WORD FOR WORD.
	//
	// The harness fires an event for a message that starts a turn and none for
	// one written into a turn that is already running. Nothing on disk holds
	// those words, so whatever heard them is the only thing that can record
	// them.
	//
	// IT IS THEIR SENTENCE AND NOT A SUMMARY OF IT. A person reading the log
	// for what they said and finding an agent's reading of it has been told
	// what they meant by the thing they were checking.
	//
	// THERE IS NO SECOND KIND OF NOTE. A note is a work token in the backlog,
	// and se work --note mints one. This records a prompt, which is a different
	// thing with a different word.
	if *said != "" {
		// ONE PROMPT, ONE RECORD. The engine copies the same messages off the
		// transcript, so this refuses a repeat rather than asking the caller to
		// check. Then always record is a rule with no condition on it.
		if saidbefore.Already(SessionLog(roots), *said) {
			fmt.Println("already recorded")
			return
		}
		noteInLog(dir, "user", "prompt", *said, nil, nil)
		if err := TheyAskedIfNamed(roots, *actor, *said); err != nil {
			fail(err)
		}
		fmt.Println("recorded")
		return
	}

	// YOUR ANSWER TO THEM, IN THE RECORD BESIDE THEIR PROMPT.
	//
	// One prompt, one answer, and the person reads it where they are already
	// looking. Two things follow.
	//
	// A HARNESS SOMETIMES EATS AN ANSWER and a line in a file does not, so the
	// answer arrives whether or not the turn delivered it.
	//
	// AND THE AGENT DOES NOT HAVE TO STOP TO BE HEARD. Answering was the one
	// thing that needed the turn to end, so it was ending turns that had work
	// left in them.
	if *answer != "" {
		noteInLog(dir, "agent", "answer", *answer, nil, nil)
		if err := TheyWereAnsweredIfNamed(roots, *actor); err != nil {
			fail(err)
		}
		// AND THE PERSON'S OWN PRESS, WHICH NAMES NO AGENT. See ThePersonWasAnswered.
		if err := ThePersonWasAnswered(roots); err != nil {
			fail(err)
		}
		fmt.Println("recorded")
		return
	}

	// THE BURN DOWN, for the work editor's bar. Four numbers a day, computed
	// here, because a number the editor derives is a number nothing checks.
	if *burndown != "" {
		day := *burndown
		if day == "today" {
			day = TheDay(time.Now())
		}
		out, _ := json.MarshalIndent(TheBurndown(roots, day), "", "  ")
		fmt.Println(string(out))
		return
	}

	// WHAT EACH ACTOR IS DOING, for the panel header. It is read off the
	// record, so the panel draws a fact rather than something an agent said.
	if *doing {
		out, _ := json.MarshalIndent(WhatIsHappening(roots), "", "  ")
		fmt.Println(string(out))
		return
	}

	if *tree {
		t, err := LoadTree(roots.Method)
		if err != nil {
			fail(err)
		}
		out, _ := json.MarshalIndent(t, "", "  ")
		fmt.Println(string(out))
		return
	}

	// One folder becomes a project, or a vehicle, which is a project that
	// carries the method as well.
	// The register maps an identity to a place. One writer, one format.
	// Which copies exist, and which one drives this folder. The editor asks
	// this before it decides whose engine to run.
	if *copies {
		type row struct {
			ID     string `json:"id"`
			Root   string `json:"method_root"`
			Built  bool   `json:"built"`
			Drives bool   `json:"drives_this"`
		}
		p, recorded := LoadDriven(roots)
		var out []row
		for _, dir := range registerDirs() {
			for _, e := range readRegister(filepath.Join(dir, "registry.json")) {
				exe := filepath.Join(e.MethodRoot, ".bin", exeName("se"))
				_, err := os.Stat(exe)
				out = append(out, row{e.ID, e.MethodRoot, err == nil, recorded && e.ID == p.Driver})
			}
		}
		b, _ := json.MarshalIndent(map[string]any{
			"driver": p.Driver, "recorded": recorded, "copies": out}, "", "  ")
		fmt.Println(string(b))
		return
	}

	if *register {
		id, err := RegisterCopy(roots.Method, "0.1.0")
		if err != nil {
			fail(err)
		}
		fmt.Println(id)
		return
	}

	if *initAs != "" {
		kind := Kind(*initAs)
		if kind != AProject && kind != AVehicle {
			fail(fmt.Errorf("init takes project or vehicle"))
		}
		if kind == AVehicle && roots.Work != roots.Method {
			if err := ProduceInto(roots.Method, roots.Work); err != nil {
				fail(err)
			}
			if _, err := RegisterCopy(roots.Work, "0.1.0"); err != nil {
				fmt.Fprintf(os.Stderr, "  it was made and could not be registered: %v\n", err)
			}
			roots.Method = roots.Work
		}
		made, err := Seed(roots, kind)
		if err != nil {
			fail(err)
		}
		id, _ := CopyID(roots.Method)
		fmt.Printf("this folder is a %s\n", kind)
		for _, m := range made {
			rel, _ := filepath.Rel(roots.Work, m)
			fmt.Println("  made " + rel)
		}
		fmt.Printf("  driven by %s\n  run: %s --version\n", id, runmeCall())
		return
	}

	if *selftest {
		os.Exit(SelfTest(roots, *keep))
	}

	if *produce != "" {
		dest, err := filepath.Abs(*produce)
		if err != nil {
			fail(err)
		}
		if err := Produce(roots.Method, dest); err != nil {
			fail(err)
		}
		id, err := RegisterCopy(dest, "0.1.0")
		if err != nil {
			fmt.Fprintf(os.Stderr, "  the copy was made and could not be registered: %v\n", err)
		}
		fmt.Printf("copy made at %s\n  identity %s\n  it builds its own programs: run its install script there.\n", dest, id)
		return
	}

	if *attach {
		p, err := Attach(roots)
		if err != nil {
			fail(err)
		}
		fmt.Printf("this folder is driven by %s\n", p.Driver)
		return
	}

	if *whoDrives {
		path, known, recorded := FindDriver(roots)
		switch {
		case !recorded:
			fmt.Println("no copy is recorded as driving this folder")
		case known:
			fmt.Printf("driven by %s\n", path)
		default:
			p, _ := LoadDriven(roots)
			fmt.Printf("driven by %s, which is not on this machine\n", p.Driver)
		}
		return
	}

	if *settings {
		v, err := LoadValues(roots)
		if err != nil {
			fail(err)
		}
		out, _ := json.MarshalIndent(map[string]any{
			"value": v.Value, "from": v.From, "emergency": LoadEmergency(roots)}, "", "  ")
		fmt.Println(string(out))
		return
	}

	// One parameter changes here and nowhere else. The engine validates,
	// because the panel is a view and a view that validates is a second set
	// of rules.
	if *set != "" {
		key, want, ok := strings.Cut(*set, "=")
		if !ok {
			fail(fmt.Errorf("set takes name=value"))
		}
		got, err := SetValue(roots, key, want)
		if err != nil {
			noteInLog(dir, "engine", "refusal", err.Error(), sessionlog.No(), map[string]any{"parameter": key})
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		noteInLog(dir, "engine", "config", fmt.Sprintf("%s is now %v", key, got), sessionlog.Yes(),
			map[string]any{"parameter": key, "value": got})
		out, _ := json.Marshal(map[string]any{key: got})
		fmt.Println(string(out))
		return
	}

	// Emergency mode is armed by a person, at a terminal or through a button.
	// Everything about it is in the record.
	if *emergency != "" {
		switch *emergency {
		case "on":
			who := os.Getenv("USERNAME")
			if who == "" {
				who = os.Getenv("USER")
			}
			e, err := ArmEmergency(roots, who, *reason, *minutes)
			if err != nil {
				fail(err)
			}
			noteInLog(dir, "engine", "emergency", "emergency mode armed: "+e.Describe(), sessionlog.No(),
				map[string]any{"by": e.By, "reason": e.Reason, "until": e.Until})
			fmt.Println(e.Describe())
		case "off":
			if err := DisarmEmergency(roots); err != nil {
				fail(err)
			}
			noteInLog(dir, "engine", "emergency", "emergency mode disarmed", sessionlog.Yes(), nil)
			fmt.Println("emergency mode is off")
		case "status":
			e := LoadEmergency(roots)
			if e.Armed {
				fmt.Println(e.Describe())
			} else {
				fmt.Println("emergency mode is off")
			}
		default:
			fail(fmt.Errorf("emergency takes on, off or status"))
		}
		return
	}

	// ONE ENGINE, AND THE ENGINE IS WHAT SAYS SO.
	if line, yes := AlreadyHere(roots); yes {
		fmt.Println(line)
		return
	}
	// AND THE TREE IS TAKEN BEFORE ANYTHING ELSE IS. engine.json is written
	// late, after the log, the projections and the tool probe, so two starts a
	// second apart both passed the line above and both ran. The lock is the
	// kernel's and lives as long as this process does. See onetree.go.
	if held, err := HoldTheTree(roots); err != nil {
		fail(err)
	} else if !held {
		line, _ := json.Marshal(map[string]any{
			"ready": false, "already_up": true,
			"method_root": roots.Method, "work_root": roots.Work,
			"says": "an engine is already up over this tree, so this one leaves it alone",
		})
		fmt.Println(string(line))
		return
	}
	defer LetGoOfTheTree()

	log, err := sessionlog.Open(dir)
	if err != nil {
		fail(err)
	}
	defer log.Close()

	// A folder becomes a project the first time it is driven. Nothing has to
	// be declared: the marker is written, and it says which copy did it.
	if _, ok := LoadDriven(roots); !ok {
		if p, err := Attach(roots); err == nil {
			log.Write("engine", "attach", "engine", "this folder is now driven by this copy", sessionlog.Yes(),
				map[string]any{"driver": p.Driver})
		}
	}

	if written, err := Project(roots); err != nil {
		log.Write("engine", "error", "engine", "the projections could not be written", sessionlog.No(),
			map[string]any{"reason": err.Error()})
	} else if len(written) > 0 {
		log.Write("engine", "project", "engine", "projections written from guidance", sessionlog.Yes(),
			map[string]any{"files": written})
	}

	// What the machine has, asked once per boot. It goes in a file the pull
	// reads, and not in the record: a person watching the log did not ask what
	// this machine has, and a line they did not ask for is a line in the way.
	ProbeTools(ctx, roots, log.Session())

	startRecord := map[string]any{
		"method_root": roots.Method,
		"work_root":   roots.Work,
		"log":         log.Path(),
		"pid":         os.Getpid(),
	}
	// A build that was never stamped says nothing, so it is left out rather
	// than written as the word a variable holds when nobody set it.
	if version.Build != "unstamped" {
		startRecord["build"] = version.Build
	}
	log.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), startRecord)

	// A BATTERY THAT RAN OUTSIDE THE ENGINE IS REPORTED HERE. It is started
	// detached, because it replaces the engine that started it, so the process
	// that would have waited for its answer is gone by the time there is one.
	// This start is the first moment anything can put it in the record.
	RecordFinishedBattery(roots, log)

	// AND WORK LEFT BEHIND BY A HAND THAT IS GONE. A token held by an agent this
	// run no longer has is work the queue counts as in hand and gives to nobody,
	// and the panel draws a row for the holder, so the dead look busy. See
	// goneputsdown.go.
	if back := SweepWorkHeldByTheGone(roots); len(back) > 0 {
		log.Write("engine", "start", "engine",
			"work held by agents that are gone went back to the queue", sessionlog.Yes(),
			map[string]any{"put_down": back})
	}

	// AND WHAT A KILLED WRITE LEFT BEHIND. A swap ends the old engine while a
	// heartbeat's write is in flight, so a temp file is orphaned under .se with
	// nothing owning it.
	if swept := SweepOrphanedWrites(roots, time.Minute); swept > 0 {
		log.Write("engine", "start", "engine", "temporary files no write finished were swept", sessionlog.Yes(),
			map[string]any{"swept": swept})
	}

	// AND THE PROGRAMS THIS TREE USED TO SHIP. One that will not delete is one
	// a process is still running from, and it stays until that process ends.
	if swept := replaced.SweepWhatWasReplaced(roots.Method); swept > 0 {
		log.Write("engine", "start", "engine", "programs nothing is running any more were swept", sessionlog.Yes(),
			map[string]any{"swept": swept, "from": replaced.WasDir(roots.Method)})
	}

	// TWO NAMES, ONE FILE. Installing links them, so the cage and RUNME call
	// the same program. A build run by hand replaces one name and leaves the
	// other pointing at what was there before, and then the guards run one
	// build while a person reads another.
	//
	// It cannot be fixed from here, because the fix is to install. Saying so
	// in the record is what turns a silent difference into a visible one.
	for _, name := range theProgramNames(roots.Method) {
		if a, b, split := twoNames(roots.Method, name); split {
			log.Write("engine", "error", "engine",
				name+" is two different files, so the cage and RUNME run different builds", sessionlog.No(),
				map[string]any{"one": a, "other": b, "fix": "install again"})
		}
	}

	// The extension needs to know where to point the viewer, and a person
	// running this by hand needs the same fact. One line of JSON on standard
	// output serves both.
	ready, _ := json.Marshal(map[string]any{
		"ready": true, "log": log.Path(), "session": log.Session(),
		"method_root": roots.Method, "work_root": roots.Work,
	})
	fmt.Println(string(ready))

	// AND IT SAYS SO ON DISK, for whoever did not start it. A window that
	// reloads has no parent any more, and without this it cannot tell a live
	// engine from none.
	here := Running{PID: os.Getpid(), Log: log.Path(), Session: log.Session(),
		Started: time.Now().UTC().Format(time.RFC3339), Build: version.Build, Run: runIdentity()}
	SayRunning(roots, here)
	defer StopSaying(roots)

	if *once {
		return
	}

	// Liveness is a heartbeat in the record. A dead engine is one that stopped
	// writing them, which a reader can see without asking anything.
	reproject := watchGuidance(roots.Method)
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)
	cfg := LoadConfig(roots)
	if cfg.HeartbeatSeconds > 0 && *beat == 5*time.Second {
		*beat = time.Duration(cfg.HeartbeatSeconds) * time.Second
	}
	// THE RESIDENT ENGINE KEEPS THE INDEX. It is the one process that lives
	// as long as the session, so it is the one that can watch the tree, and
	// it takes the context main made at the top.
	stopIndexer, socket, asked := StartIndexer(ctx, roots, log, *beat)
	// LETTING GO HAPPENS ONCE, whether the engine is ending or handing over.
	// A swap has to release the socket and the port before the successor
	// looks at them, and the deferred call still runs on the way out.
	var letGo sync.Once
	hooks := (io.Closer)(nil)
	release := func() {
		letGo.Do(func() {
			stopIndexer()
			if hooks != nil {
				hooks.Close()
			}
		})
	}
	defer release()
	// THE GUARD'S DOOR. Every per-call event the cage names comes here over
	// HTTP, and the port is the one the cage was projected with.
	//
	// AND THE START SAYS WHICH IT IS, in one line, on the record and on the way
	// out. A session with no guard on it looks exactly like a session nothing
	// refused, and one of those ran for a whole day. See guardsaysso.go.
	ln, saying, live := holdTheDoor(roots)
	if live {
		go serveHooks(ctx, ln, roots, log)
		hooks = ln
		here.Hooks = hooksURL(roots)
	}
	SayTheDoor(log, live, saying)
	guarded, _ := json.Marshal(map[string]any{"guarded": live, "hooks": hooksURL(roots), "says": saying})
	fmt.Println(string(guarded))
	// THE ADDRESSES ARE PUBLISHED WHERE A CLIENT ALREADY LOOKS, beside the
	// pid and the beat, so finding the model is reading one file.
	here.Socket = socket
	SayRunning(roots, here)
	// AND THE OTHER BOXES' CLAIMS, ON A CLOCK OF THEIR OWN.
	//
	// A fetch is a second over the network and a pull may not wait on one, so
	// the engine does the fetching and a pull reads what is already here. It is
	// the ENGINE'S and not the indexer's: started from there it ran in every
	// test tree that opens an index, spawning git processes under a parallel
	// suite, and three index tests went red under the load while passing alone.
	// THE WATCHER STOPS WITH THE CONTEXT. The claim layer reads one, so it is
	// handed this one directly and the engine still owns the goroutine.
	go WatchForClaims(ctx, roots, log)

	ticker := time.NewTicker(*beat)
	defer ticker.Stop()
	started := time.Now()
	var beats int
	var saidStale bool
	for {
		select {
		case <-reproject:
			// A changed original re-projects on its own. That is the whole
			// reason to call it a projection rather than a copy.
			// A folder becomes a project the first time it is driven. Nothing has to
			// be declared: the marker is written, and it says which copy did it.
			if _, ok := LoadDriven(roots); !ok {
				if p, err := Attach(roots); err == nil {
					log.Write("engine", "attach", "engine", "this folder is now driven by this copy", sessionlog.Yes(),
						map[string]any{"driver": p.Driver})
				}
			}

			if written, err := Project(roots); err != nil {
				log.Write("engine", "error", "engine", "the projections could not be written", sessionlog.No(),
					map[string]any{"reason": err.Error()})
			} else if len(written) > 0 {
				log.Write("engine", "project", "engine", "guidance changed, projections written again", sessionlog.Yes(),
					map[string]any{"files": written})
			}
		case <-ticker.C:
			// The heartbeat is NOT a record. It says nothing happened, and a
			// log full of nothing happened is a log nobody reads. It goes to
			// standard output, where whoever started the engine is listening.
			beats++
			here.Beat = time.Now().UTC().Format(time.RFC3339)
			SayRunning(roots, here)

			// AND A HAND THAT ENDED WHILE THIS ENGINE WAS UP. The sweep above
			// runs on a start, and an engine that stays up all day never
			// reaches another one. So a hold behind an agent that ended sat
			// there until somebody pulled and was sent to look, and answering
			// that look cost the walker its pull. See goneputsdown.go.
			if back := SweepOnTheBeat(roots, beats); len(back) > 0 {
				log.Write("engine", "work", "engine",
					"work held by agents that are gone went back to the queue", sessionlog.Yes(),
					map[string]any{"put_down": back})
			}

			// AN ENGINE OUTLIVES THE BUILD IT CAME FROM. Installing replaces
			// the program on disk and leaves this process running the code it
			// started with, and this process is the one writing the
			// projections. So a rule changed in the source goes on being
			// written the old way, by an engine nobody thought to restart.
			//
			// It cannot restart itself, because whoever started it decides
			// that. Saying it once is what turns it into something a person
			// can see.
			if !saidStale && rebuiltSince(roots.Method, started) {
				saidStale = true
				log.Write("engine", "error", "engine",
					"this engine is older than the program on disk, so it writes what its own build knew", sessionlog.No(),
					map[string]any{"build": version.Build, "fix": "stop it and start it again"})
			}
			beat, _ := json.Marshal(map[string]any{
				"beat": beats, "uptime_s": int(time.Since(started).Seconds()),
			})
			fmt.Println(string(beat))
		case <-stop:
			log.Write("engine", "stop", "engine", "engine stopped, asked to", sessionlog.Yes(),
				map[string]any{"uptime_s": int(time.Since(started).Seconds())})
			return
		case <-asked.Stop:
			// A CLIENT ASKED IT TO STOP, over the socket. A person does, when
			// they are done with the tree for the day.
			log.Write("engine", "stop", "engine", "engine stopped, asked to over the socket", sessionlog.Yes(),
				map[string]any{"uptime_s": int(time.Since(started).Seconds())})
			return
		case plan := <-asked.Swap:
			// THE HANDOVER. The new program is already built and has answered
			// for itself, so what is left is the part only this loop can do:
			// let the calls in flight finish, put the new one in place, and
			// start it on the session this one has been writing.
			left := drainCalls(swapDrainBudget)
			log.Write("engine", "swap", "engine", "engine swapped, and the successor continues this session", sessionlog.Yes(),
				map[string]any{"from": version.Build, "to": plan.Build, "why": plan.Why,
					"cut": left, "uptime_s": int(time.Since(started).Seconds())})
			if err := putInPlace(roots, plan.Next); err != nil {
				// A SWAP THAT CANNOT LAND LEAVES THE ENGINE RUNNING. Nothing
				// has been replaced at this point, so carrying on is the whole
				// of the recovery.
				log.Write("engine", "error", "engine", "the swap did not land, so this engine carries on", sessionlog.No(),
					map[string]any{"reason": err.Error(), "build": version.Build})
				continue
			}
			// THE LISTENERS GO BEFORE THE SUCCESSOR STARTS. It binds the same
			// socket and the same port, and refuses to be a second engine, so
			// this one has to have let go of all three before the other looks.
			release()
			StopSaying(roots)
			// AND WHAT THIS ENGINE IS ABOUT TO ORPHAN. A heartbeat's write in
			// flight when the process ends leaves a temp file nothing owns, and
			// the engine handing over is the one party that knows it is ending.
			SweepOrphanedWrites(roots, 0)
			if err := handOver(ctx, roots, log.Session()); err != nil {
				log.Write("engine", "error", "engine",
					"the next engine is in place and did not start, so this tree has no engine", sessionlog.No(),
					map[string]any{"reason": err.Error(), "fix": "start it: se --work " + roots.Work})
			}
			return
		}
	}
}

// A one-line record from a command that is not the engine's own run. It
// appends to the session that is going, and does nothing when none is.
// THE RECORD DOES NOT DEPEND ON AN ENGINE RUNNING.
//
// MEASURED 2026-08-31: the window rotated the log on a reload with no engine
// up, and every note written after that went nowhere. What the person said was
// lost in the one situation where they were watching for it.
//
// So a note joins the session that is running, and starts one when there is
// none. A line written into a fresh file is a line somebody can read.
func noteInLog(dir, src, kind, msg string, ok *bool, data map[string]any) {
	l, err := sessionlog.OpenExisting(dir)
	if err != nil {
		if l, err = sessionlog.Open(dir); err != nil {
			return
		}
	}
	defer l.Close()
	l.Write(src, kind, "owner", msg, ok, data)
}

func fail(err error) {
	fmt.Fprintln(os.Stderr, "engine:", err)
	os.Exit(1)
}

// failUnread is how the engine says it did not read the call at all, which is a
// different answer from disagreeing with what the call said.
func failUnread(err error) {
	fmt.Fprintln(os.Stderr, "engine:", err)
	os.Exit(Unread)
}
