// The files/ topic: every tracked file's hash and text, committed into the
// store off the rows the walk writes, so a module reads a file and no disk.
// [[spec/tickets/files-topic-reads-the-rows]]
package main

import (
	"database/sql"

	"quackitect/src/ops"
	"quackitect/src/q"
	"quackitect/src/tickets"
)

const filesFamily = "files/<path...>"

const filesPrefix = "files/"

// The value under files/<path>: the empty Content stands for a path the tree tracks nowhere. [[spec/tickets/files-topic-reads-the-rows]]
type Content struct {
	Hash string `json:"hash"`
	Text string `json:"text"`
}

// The topics the index commits itself: the files, and the tickets it reads off the note rows. [[spec/tickets/the-tickets-topic-lands]]
func registersTopics(catalog *q.Catalog) writers {
	return writers{
		files:   q.GivenIn(catalog, filesFamily, Content{}, q.Doc("the hash and the text of a tracked file")),
		tickets: tickets.Registers(catalog),
		ops:     ops.Registers(catalog),
	}
}

// The hands the index commits its topics with, one a registration. [[spec/tickets/commits-name-their-writer]]
type writers struct{ files, tickets, ops q.Writer }

// The tracked rows among the paths named, or every tracked row where none is named. [[spec/tickets/files-topic-reads-the-rows]]
func contentsOf(db *sql.DB, paths []string) (map[string]Content, error) {
	rows, err := db.Query(`SELECT path, hash, text FROM file WHERE tracked = 1`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	wanted := map[string]bool{}
	for _, one := range paths {
		wanted[one] = true
	}
	out := map[string]Content{}
	for rows.Next() {
		var path string
		var held Content
		if err := rows.Scan(&path, &held.Hash, &held.Text); err != nil {
			return nil, err
		}
		if len(paths) == 0 || wanted[path] {
			out[path] = held
		}
	}
	return out, rows.Err()
}

// One commit at one revision: each path named takes its row, and a path with no tracked row takes the default. [[spec/tickets/files-topic-reads-the-rows]]
func (one *door) publishes(paths []string) error {
	held, err := contentsOf(one.db, paths)
	if err != nil {
		return err
	}
	values := map[string]any{}
	for _, path := range paths {
		values[filesPrefix+path] = held[path]
	}
	if len(paths) == 0 {
		for path := range one.published {
			values[filesPrefix+path] = Content{}
		}
		for path, content := range held {
			values[filesPrefix+path] = content
		}
		one.published = map[string]bool{}
	}
	for _, path := range paths {
		delete(one.published, path)
	}
	for path := range held {
		one.published[path] = true
	}
	// The note rows carry the private tickets the tracked rows leave out, so tickets/all reads them there. [[spec/tickets/the-tickets-topic-lands]]
	all, err := Tickets(one.db)
	if err != nil {
		return err
	}
	values[tickets.AllName] = all
	_, err = one.store.Commit(one.store.Snapshot().Revision, q.Join(one.writers.files, one.writers.tickets), values)
	return err
}
