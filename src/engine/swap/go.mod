// The guard every long-running binary of this tree takes: a server whose
// binary a rebuild swaps out ends itself, so its caller starts the new one.
// It takes no dependency, so it builds in seconds with no cgo and no network.
module quackitect/swap

go 1.24
