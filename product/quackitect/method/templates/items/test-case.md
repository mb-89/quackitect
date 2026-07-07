---
template: item-test-case
artifact: node
applies_rigor: [lean, systematic]
applies_type: [default]
---
<!-- design: method-verify-method  implements: req-verify-method :: Method and level are declared FIELDS on test items rendered in the verification matrix's columns; the requirement item's field is named verify_method because the bare verify key is the executed-check referent and must never collide. -->
# test-case â€” one verification or validation check

Lives in its birth iteration. Observed RED before the build (`quack observe-red`).
Id prefix `test-`.

## Fields
- `type` (test): fixed.
- `verifies` (list of req- ids): what it checks.
- `method` (test | analysis | inspection | demonstration): matches the
  requirement's declared verify method.
- `level` (unit | integration | system | acceptance): where it runs. Integration-level
  evidence outweighs paper compliance (the orbit lesson).
- `kind` (verification | validation): thing-right or right-thing.
- `verify` (selftest:name, executed tests): the mechanized referent.
- `acceptance` (rule string): the pass rule, with value and tolerance, fixed at
  WRITE time â€” before any result exists.
- `statement` (one sentence): what passing proves.

## Body
Given / when / then. For physical tests, the record lands in a rec- note.

```
---
id: test-{{slug}}
type: test
verifies: [req-{{slug}}]
method: test
level: system
kind: verification
verify: selftest:{{name}}
acceptance: {{rule-with-value-and-tolerance}}
statement: {{what-passing-proves}}
class: executed
killer: false
---
## Given / when / then
{{gwt}}
```
<!-- enddesign -->
