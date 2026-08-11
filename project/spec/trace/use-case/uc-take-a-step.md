---
id: uc-take-a-step
type: "[[use-case]]"
statement: Do one step of the walk and record what it produced.
actor: stk-engineer-driving-agents
trigger: the walk stands on a state whose work is not done
precondition: everything the state demands be read has been read
guarantee: the state's evidence form is filled and checked, and the walk may move on
refines:
  - sty-walk-it-by-hand
  - sty-the-agent-proves-it-read
priority: must
---

## Main scenario

1. Whoever is driving asks the machine what to do.
2. The machine answers with the state's guidance, the tools legal here, and the form it owes.
3. The work is done using only those tools.
4. The form is filled, field by field.
5. The submit checks the fields' shapes and stamps the claim.
6. The walk may move to the next state.

## Extensions

- 2a. Something is owed as reading. The machine hands over one document and asks for proof before the work opens.
- 3a. A tool outside the legal set is reached for. The refusal names the clause, what was expected, and the exact call to make instead.
- 4a. A field takes node references. A line naming nothing is refused, and the type's template is one click away.
- 4b. A field declares coverage over another type. Both directions are checked, and an orphan on either side keeps the state unmet.
- 5a. A required field is empty. The submit names which, and nothing is stamped.
- 6a. The next state's entry conditions do not hold. The walk stops here and names what is missing.
