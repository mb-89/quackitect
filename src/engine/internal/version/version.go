// Package version carries the build stamp, so a record can say which engine
// wrote it.
package version

// Build is stamped at build time with -X on this symbol. The stampers are
// swap.go in the engine, src/scripts/setup/main.go and util/checks/battery.sh, and
// all three name this package's path.
var Build = "unstamped"
