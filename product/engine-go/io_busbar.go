package main

import "strings"

// design: go-io-busbar  implements: req-conformance
// The disk-I/O busbar (q-coverage-ids-physics, owner ruling B). File and disk I/O
// crosses the onion on an I/O busbar like any other input, and a kernel element never
// touches the world directly. The AST pass classes every I/O selector: disk touches
// (file reads and writes) apart from console traffic (argv and stdio). The onion's
// declared "disk" bus is tapped ONLY by blocks whose code actually touches the disk.
// Every other declared bus keeps the union semantics it always had, so the figure
// gains honesty without churn. selftest:io-busbar pins the law. The reflexion diff
// must run clean, forever: a future kernel world-contact fails the battery.

// ioSelClass names an I/O selector's class: disk-read | disk-write | read | write | "".
func ioSelClass(key string) string {
	switch key {
	case "os.ReadFile", "os.Open", "os.ReadDir", "os.Stat", "io.ReadAll":
		return "disk-read"
	case "os.WriteFile", "os.Create", "os.MkdirAll":
		return "disk-write"
	case "os.Args", "os.Stdin":
		return "read"
	case "os.Stdout", "os.Stderr":
		return "write"
	}
	if strings.HasPrefix(key, "fmt.Print") || strings.HasPrefix(key, "fmt.Fprint") {
		return "write"
	}
	return ""
}

// busTapsIn / busTapsOut: the tap decision per declared bus. The disk bus belongs to
// disk-touching blocks alone; any other bus taps on the historical union flag.
func busTapsIn(bus string, read, diskRead bool) bool {
	if bus == "disk" {
		return diskRead
	}
	return read
}

func busTapsOut(bus string, write, diskWrite bool) bool {
	if bus == "disk" {
		return diskWrite
	}
	return write
}

// enddesign
