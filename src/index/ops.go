// The table op, behind the seam ops.Keep, so an operation outlives the door.
// [[spec/design_output/model#an-operation-outlives-callers]]
package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"quackitect/src/ops"
)

type opKeep struct{ db *sql.DB }

func (k opKeep) Save(one ops.Op) error {
	body, err := json.Marshal(one)
	if err != nil {
		return err
	}
	_, err = k.db.Exec(`INSERT INTO op (id, body) VALUES (?, ?)
		 ON CONFLICT (id) DO UPDATE SET body = excluded.body`, one.ID, string(body))
	return err
}

func (k opKeep) All() ([]ops.Op, error) {
	rows, err := k.db.Query(`SELECT body FROM op ORDER BY id`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []ops.Op{}
	for rows.Next() {
		var body string
		if err := rows.Scan(&body); err != nil {
			return nil, err
		}
		var one ops.Op
		if err := json.Unmarshal([]byte(body), &one); err != nil {
			return nil, err
		}
		out = append(out, one)
	}
	return out, rows.Err()
}

func (k opKeep) Drop(id string) error {
	_, err := k.db.Exec(`DELETE FROM op WHERE id = ?`, id)
	return err
}

// The door opens the book on its database, pushes each move under ops/<id>, and fails every operation in flight. [[spec/design_output/model#an-operation-outlives-callers]]
func (one *door) opensBook() error {
	book, err := ops.New(time.Now, opKeep{one.db}, ops.SettingsOf(one.root))
	if err != nil {
		return err
	}
	one.hears(book)
	return book.Restart()
}

// The door pushes each move of the book under ops/<id>. [[spec/design_output/model#the-states]]
func (one *door) hears(book *ops.Book) {
	book.OnMove(func(moved ops.Op) {
		one.store.Commit(one.store.Snapshot().Revision, one.writers.ops, map[string]any{ops.Name(moved.ID): moved})
	})
	one.book = book
}

// An operation past its window leaves the book, the table and the store together. [[spec/design_output/model#what-stays-how-long]]
func (one *door) sweepsOps() {
	if one.book == nil {
		return
	}
	var names []string
	for _, id := range one.book.Sweep() {
		names = append(names, ops.Name(id))
	}
	if len(names) == 0 {
		return
	}
	if _, err := one.store.Drop(one.store.Snapshot().Revision, one.writers.ops, names...); err != nil {
		fmt.Fprintln(stderr, "the ops sweep did not drop:", err)
	}
}
