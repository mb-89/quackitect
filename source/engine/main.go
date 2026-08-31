package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"
)

// Level 0. It starts, it records, and it says it is alive. Nothing above it
// exists yet, so there is no authority to ask and every permission question
// answers permitted.
func main() {
	// The guard runs as its own process, started by the harness. It reads one
	// event and answers, so it is handled before any flag is parsed.
	if len(os.Args) > 1 && os.Args[1] == "hook" {
		runHook(os.Args[2:])
		return
	}
	// Level 1's two verbs. They speak JSON on standard input and output, for
	// the same reason the guard does: a program calls them, not a person.
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "work":
			runWork(os.Args[2:])
			return
		case "pull":
			runPull(os.Args[2:])
			return
		case "stop":
			runStop(os.Args[2:])
			return
		case "query":
			runQuery(os.Args[2:])
			return
		case "view":
			runView(os.Args[2:])
			return
		case "lint":
			runLint(os.Args[2:])
			return
		case "hold":
			runHold(os.Args[2:])
			return
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
	project := flag.Bool("project", false, "write the projections from guidance and exit")
	emergency := flag.String("emergency", "", "arm or disarm emergency mode: on, off, or status")
	reason := flag.String("reason", "", "why emergency mode is being armed")
	minutes := flag.Int("minutes", 30, "how long emergency mode lasts, at most 240")
	settings := flag.Bool("config", false, "print every parameter, its value, and where the value came from")
	tree := flag.Bool("tree", false, "print the parameter tree as declared")
	set := flag.String("set", "", "change one parameter: name=value")
	said := flag.String("said", "", "put what the person said in the record, word for word, and exit")
	answer := flag.String("answer", "", "put your answer to them in the record, and exit")
	version := flag.Bool("version", false, "print which build this is and exit")
	selftest := flag.Bool("selftest", false, "produce a copy, drive a project with it, and check what came out")
	keep := flag.Bool("keep", false, "with selftest: leave the temporary trees behind")
	produce := flag.String("produce", "", "make a copy of the method in this folder")
	whoDrives := flag.Bool("driver", false, "say which copy drives this folder")
	attach := flag.Bool("attach", false, "record that this copy drives this folder")
	initAs := flag.String("init", "", "make this folder a project or a vehicle")
	register := flag.Bool("register", false, "put this copy in the register and print its identity")
	copies := flag.Bool("copies", false, "list the copies on this machine, and which drives this folder")
	flag.Parse()
	if *help || *helpShort {
		flag.CommandLine.SetOutput(os.Stdout)
		flag.Usage()
		return
	}

	if *version {
		// Every project answers this, whatever it is written in.
		fmt.Printf("quackitect engine %s\n", Build)
		return
	}

	roots, err := FindRoots(*work)
	if *method != "" {
		abs, err := filepath.Abs(*method)
		if err != nil {
			fail(err)
		}
		roots.Method = abs
	}
	if err != nil {
		fail(err)
	}
	dir := roots.Private("log")

	// The current log has one name, so a window can be opened on it before
	// the engine has written anything.
	if *where {
		fmt.Println(filepath.Join(dir, Current))
		return
	}

	// Setting the current log aside without starting. The editor calls this
	// when a window opens, so a log window opened before any engine shows
	// this session rather than the last one.
	if *rotate {
		if err := RetireCurrent(dir); err != nil {
			fail(err)
		}
		fmt.Println(filepath.Join(dir, Current))
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
		noteInLog(dir, "user", "prompt", *said, nil, nil)
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
		fmt.Println("recorded")
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
			noteInLog(dir, "engine", "refusal", err.Error(), No(), map[string]any{"parameter": key})
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
		noteInLog(dir, "engine", "config", fmt.Sprintf("%s is now %v", key, got), Yes(),
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
			noteInLog(dir, "engine", "emergency", "emergency mode armed: "+e.Describe(), No(),
				map[string]any{"by": e.By, "reason": e.Reason, "until": e.Until})
			fmt.Println(e.Describe())
		case "off":
			if err := DisarmEmergency(roots); err != nil {
				fail(err)
			}
			noteInLog(dir, "engine", "emergency", "emergency mode disarmed", Yes(), nil)
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

	log, err := OpenLog(dir)
	if err != nil {
		fail(err)
	}
	defer log.Close()

	// A folder becomes a project the first time it is driven. Nothing has to
	// be declared: the marker is written, and it says which copy did it.
	if _, ok := LoadDriven(roots); !ok {
		if p, err := Attach(roots); err == nil {
			log.Write("engine", "attach", "engine", "this folder is now driven by this copy", Yes(),
				map[string]any{"driver": p.Driver})
		}
	}

	if written, err := Project(roots); err != nil {
		log.Write("engine", "error", "engine", "the projections could not be written", No(),
			map[string]any{"reason": err.Error()})
	} else if len(written) > 0 {
		log.Write("engine", "project", "engine", "projections written from guidance", Yes(),
			map[string]any{"files": written})
	}

	// What the machine has, asked once per boot. It goes in a file the pull
	// reads, and not in the record: a person watching the log did not ask what
	// this machine has, and a line they did not ask for is a line in the way.
	ProbeTools(roots, log.Session())

	startRecord := map[string]any{
		"method_root": roots.Method,
		"work_root":   roots.Work,
		"log":         log.Path(),
		"pid":         os.Getpid(),
	}
	// A build that was never stamped says nothing, so it is left out rather
	// than written as the word a variable holds when nobody set it.
	if Build != "unstamped" {
		startRecord["build"] = Build
	}
	log.Write("engine", "start", "engine", "engine started", Yes(), startRecord)

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
		Started: time.Now().UTC().Format(time.RFC3339), Build: Build}
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
	ticker := time.NewTicker(*beat)
	defer ticker.Stop()
	started := time.Now()
	var beats int
	for {
		select {
		case <-reproject:
			// A changed original re-projects on its own. That is the whole
			// reason to call it a projection rather than a copy.
			// A folder becomes a project the first time it is driven. Nothing has to
			// be declared: the marker is written, and it says which copy did it.
			if _, ok := LoadDriven(roots); !ok {
				if p, err := Attach(roots); err == nil {
					log.Write("engine", "attach", "engine", "this folder is now driven by this copy", Yes(),
						map[string]any{"driver": p.Driver})
				}
			}

			if written, err := Project(roots); err != nil {
				log.Write("engine", "error", "engine", "the projections could not be written", No(),
					map[string]any{"reason": err.Error()})
			} else if len(written) > 0 {
				log.Write("engine", "project", "engine", "guidance changed, projections written again", Yes(),
					map[string]any{"files": written})
			}
		case <-ticker.C:
			// The heartbeat is NOT a record. It says nothing happened, and a
			// log full of nothing happened is a log nobody reads. It goes to
			// standard output, where whoever started the engine is listening.
			beats++
			here.Beat = time.Now().UTC().Format(time.RFC3339)
			SayRunning(roots, here)
			beat, _ := json.Marshal(map[string]any{
				"beat": beats, "uptime_s": int(time.Since(started).Seconds()),
			})
			fmt.Println(string(beat))
		case <-stop:
			log.Write("engine", "stop", "engine", "engine stopped, asked to", Yes(),
				map[string]any{"uptime_s": int(time.Since(started).Seconds())})
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
	l, err := OpenExistingLog(dir)
	if err != nil {
		if l, err = OpenLog(dir); err != nil {
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
