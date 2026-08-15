---
minted_in: i1
id: uc-install-quackitect
type: "[[use-case]]"
statement: Install the machine on a computer that does not have it, and reach the front desk.
actor: stk-newcomer
trigger: someone decides to run quackitect on a machine where it is not installed
precondition: a computer with an editor and a shell
guarantee: the panel is drawn, the engine answers, and the front desk is waiting for a sentence
refines:
  - sty-ramp-up
priority: must
---

## Main scenario

1. The person obtains the product's folder and opens a shell in it.
2. They run the one setup script in the root.
3. The script installs the editor extension, starts the engine, and opens the workspace on that folder.
4. The editor shows the panel beside the editing area, with the machine drawn on it.
5. The agent boots, is handed everything it owes, and stops at the front desk.
6. The desk greets the person and lists what is walkable right now.

## Extensions

- 2a. The editor is not installed. The script says so and names what to install, rather than failing part-way.
- 3a. The port the engine wants is taken. The engine picks the next one and the panel follows it.
- 3b. The extension is already installed at a different version. The script replaces it and says which version now stands.
- 5a. No agent is available or the person wants none. Boot still completes, the panel is fully usable, and the walk waits for a hand.
