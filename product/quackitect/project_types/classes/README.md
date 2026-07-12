# classes/ — stakeholder ROLE classes, not a project type

These files are the shared register of stakeholder role classes (user, tester,
regulator-certifier, project-owner, agent, ...) that the project TYPES under
`default/` link into their served sets. `classes/` is NOT a selectable project
type - the real types are `default` and its nested subtypes
(`default/software`, `default/cyber_physical`, `default/manufactured_good`).
It lives beside them only so the type files can link relatively; do not list it
as a type. (i0020 cold-run fix: a fresh agent read the directory listing and
offered "classes" as a project type.)
