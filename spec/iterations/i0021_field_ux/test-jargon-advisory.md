---
id: test-jargon-advisory
type: test
statement: Reader-facing fixture prose with a capitalized non-glossary token yields an advisory jargon finding; glossary terms and common-word capitals yield none; the finding never gates the exit code.
class: executed
verify: selftest:jargon-advisory
killer: false
tests_red: exempt - the implementation landed with the test in one slot; no red is observable at attest time (adr-red-unobservable); the slip is noted for the retro
---
