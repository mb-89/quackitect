package main

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
// work, and work that is not a token is work nothing can see.
//
// THE REVIEWER MINTS THAT TOKEN AND THE ENGINE REFUSES WITHOUT IT. This once
// carried MintLessonToken, which nothing called and whose name and comment read
// as the feature, so a reader looking for the behaviour found the function and
// stopped looking. It was not unfinished, it was contradicted: reviewing.md
// says the engine cannot mint it, because which class a finding belongs to and
// whether it goes to the backlog are judgments. It is gone.

// KeepLesson writes the lesson onto the token, with the id of the token the
// reviewer minted for it.
//
// THE REVIEWER MINTS IT AND THE ENGINE REFUSES WITHOUT IT. A lesson is a
// judgment: which class a finding belongs to, whether a second round is a new
// class or the one already written down, and whether it goes to the backlog or
// straight into what is open. The engine can make none of those, and matching
// on the words would be a word list fitted to the cases already seen.
//
// So rejectionIsWhole refuses a rejection that names no token, and this writes
// down the one it named.
func KeepLesson(r Roots, t Token, by string, l Lesson, learned string) (string, error) {
	if l.Empty() {
		return "", nil
	}
	l.Token, l.Round, l.By, l.Learned = t.ID, t.Rounds, by, learned
	if err := appendLesson(r, t, l); err != nil {
		return "", err
	}
	inSession(r, "review", by, t.ID+" lesson: "+l.Class, Yes(),
		map[string]any{"id": t.ID, "class": l.Class, "avoid": l.Avoid,
			"round": t.Rounds, "learned": learned})
	return learned, nil
}

func appendLesson(r Roots, t Token, l Lesson) error {
	live, err := LoadToken(r, t.ID)
	if err != nil {
		return err
	}
	live.Lessons = append(live.Lessons, l)
	return SaveToken(r, live)
}
