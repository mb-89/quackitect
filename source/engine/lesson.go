package main

import (
	"fmt"
	"strings"
)

// WHERE A LESSON GOES.
//
// A finding teaches one token. A lesson names the class of mistake and teaches
// everything after it. One token took five rounds because every round fixed the
// instance the reviewer named and left the class standing.
//
// SMALL ENOUGH TO DO NOW, IT GOES INTO THE WORK BEING REJECTED. The worker is
// about to touch that token anyway, so a lesson it can apply there costs a line
// and is applied while the mistake is fresh.
//
// BIGGER THAN THAT, IT IS ITS OWN TOKEN. A lesson that needs its own work is
// work, and work that is not a token is work nothing can see. The reviewer says
// which by naming a token or leaving the name off.

// KeepLesson records a lesson on the token being rejected, and mints one when
// the reviewer asked for its own.
func KeepLesson(r Roots, t Token, by string, l Lesson) error {
	if l.Empty() {
		return nil
	}
	l.Token, l.Round, l.By = t.ID, t.Rounds, by
	if err := appendLesson(r, t, l); err != nil {
		return err
	}
	if strings.TrimSpace(l.Token) == "" {
		return nil
	}
	inSession(r, "review", by, t.ID+" lesson: "+l.Class, Yes(),
		map[string]any{"id": t.ID, "class": l.Class, "avoid": l.Avoid, "round": t.Rounds})
	return nil
}

// A LESSON IS PART OF THE TOKEN'S RECORD, beside the finding it came with, so
// somebody reading why a round happened finds what it taught in the same place.
func appendLesson(r Roots, t Token, l Lesson) error {
	live, err := LoadToken(r, t.ID)
	if err != nil {
		return err
	}
	live.Lessons = append(live.Lessons, l)
	return SaveToken(r, live)
}

// MintLessonToken makes a lesson its own backlogged work, for one too big to
// apply inside the token that taught it.
func MintLessonToken(r Roots, l Lesson, title, by string) (Token, error) {
	if l.Empty() {
		return Token{}, fmt.Errorf("a lesson names a class of mistake and what to do instead")
	}
	detail := l.Class + "\n\n" + l.Avoid
	if l.Token != "" {
		detail += "\n\nLearned from " + l.Token + ", round " + fmt.Sprint(l.Round) + "."
	}
	return Mint(r, Token{Title: title, Detail: detail, Assignee: "main",
		Scope: SingleStep, Status: Backlogged, MintedBy: by})
}
