module quackitect/engine

go 1.27

// THE READER IS IN THIS TREE, so it is required by path rather than fetched.
// The queue filters with the same language the log and the work editor use, and
// one reader is what stops the three drifting apart.
replace quackitect/filter => ../filter

require (
	github.com/fsnotify/fsnotify v1.10.1
	github.com/google/go-cmp v0.7.0
	github.com/mattn/go-sqlite3 v1.14.50
	golang.org/x/sys v0.13.0
	quackitect/filter v0.0.0
)
