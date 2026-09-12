// THE INDEX IS A WARM MODEL OF THE TREE, AND NEVER A SECOND TRUTH.
// The files are the truth; this is rebuilt from them and dropped whole where
// it disagrees. SQLite arrives through cgo, because the C build carries FTS5
// and answers faster than a walk over the disk.
module quackitect/index

go 1.24

require (
	github.com/fsnotify/fsnotify v1.10.1
	github.com/mattn/go-sqlite3 v1.14.52
)

require golang.org/x/sys v0.13.0 // indirect
