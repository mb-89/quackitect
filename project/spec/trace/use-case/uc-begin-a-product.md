---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: uc-begin-a-product
type: "[[use-case]]"
statement: Begin a product that does not exist yet, without disturbing the one already running.
actor: stk-engineer-driving-agents
trigger: the person wants to start something no existing product holds
precondition: one product is already installed and running
guarantee: the new product has its own folder and its own machine, and the old one is untouched
refines:
  - sty-start-a-new-product
priority: must
---

## Main scenario

1. The person tells the desk they want to start a new product, and says what it is for.
2. The desk states where a product lives: a product IS a folder, and everything it owns sits in that tree.
3. It scaffolds the new product's folder from the template.
4. It says plainly that the new product opens in its own window, and that this one keeps running.
5. The person opens the new folder.
6. The setup runs short, because the extension is already installed.
7. The new front desk greets them with an empty machine and no backlog.

## Extensions

- 2a. The person expected a picker inside the running product. The desk explains the folder rule rather than inventing one.
- 3a. A folder of that name already exists. The desk stops and says so, rather than writing into it.
- 5a. The person keeps both windows open. Both engines run, each on its own port, each with its own log.
- 7a. They want to reuse method from the first product. That is the vendoring path, not this one.
