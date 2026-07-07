---
type: default
phase: [engineering, delivery, commissioning, operation, misuse, maintenance, retirement]
discipline: [process, design, service]
quality: [functionality, reliability, usability, efficiency, maintainability, portability, compatibility, security, safety, regulatory]
connections:
  satisfy: directed jsonl
  verifies: directed jsonl
  derive: directed jsonl
  refines: directed jsonl
  trace: directed jsonl
  allocate: directed jsonl
  refers: directed jsonl
  addresses: directed jsonl
  chosen: directed jsonl
  rejected: directed jsonl
  supersedes: directed jsonl
  record-of: directed jsonl
  source: directed jsonl
  connect: symmetric note
  interface: symmetric note
  conflicts-with: symmetric note
---
Classes every project serves (the always-on set):

- [acquirer](../classes/acquirer.md)
- [user](../classes/user.md)
- [newcomer](../classes/newcomer.md)
- [communicator](../classes/communicator.md)
- [assessor](../classes/assessor.md)
- [project-owner](../classes/project-owner.md)
- [agent](../classes/agent.md)
