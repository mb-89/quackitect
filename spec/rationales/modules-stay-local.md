---
kind: [[rationale]]
---

# Why

The owner decided this for the model, and the decision is final. A module
declared local ports alone, and spelled no other module's name or path, for a
read neither. A wiring file, read at start, named the instances to load and
bound each port to a name. An agent reads this note before it asks again.

## 1. What it bought

| what the ruling gave | why |
|---|---|
| a module written and tested alone | `qtest` fed its in-ports and read its out-ports by their local names |
| one place holding the layout | the wiring file, and no module, knew which instance fed which |
| two instances of one module type | each instance took its own config under `<instance>/config/` |
| an alternative calculation with no switch in code | another module type took the same name in the wiring, in place of `providers.*` |
| a fault at start, naming the port | the passes refused an in-port with no writer, types apart, or a name with two writers |

## 2. Where it came from

| the earlier work | what it lent |
|---|---|
| flow-based programming, after J. Paul Morrison | named ports, and connections defined outside the components |
| IEC 61499 | function-block networks, and the split of an application from its mapping onto devices |
| ROS 2 static remapping | relative names that a launch file remaps |
| STARS standard names | ports meeting on a standard name, with neither side knowing the other |

The wiring file stood as the application, and `processes.placements` as its
mapping, apart from it.

## 3. What it gave up

A reader of one module no longer saw where its inputs came from. It read the
wiring, or asked `quack why`, which followed the wiring down to the IO modules.

## 4. What would make it wrong

A layout that changed at runtime, so a file read at start held the wrong one.
The index then needed wires that moved while it ran, and the ruling bent there.
