// The table op, behind the seam ops.Keep, so an operation outlives the door.
// [[spec/design_output/operations#an-operation-outlives-callers]]
package main

import (
	"database/sql"

	"quackitect/src/ops"
)

type opKeep struct{ db *sql.DB }

func (k opKeep) Save(one ops.Op) error  { return nil }
func (k opKeep) All() ([]ops.Op, error) { return nil, nil }
func (k opKeep) Drop(id string) error   { return nil }
