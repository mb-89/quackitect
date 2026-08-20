---
minted_in: i9
id: if-bootstrap-to-entrypoint
type: "[[interface]]"
statement: What the first install produced — a toolchain and a scaffolded product — is handed to the path that brings the product up on every open afterwards.
source: el-bootstrap
destination: el-entrypoint
carries:
  - flow-toolchain
  - flow-scaffolded-product
form: file
source_refs:
  - decompose-structure at i9, the element matrix's owed cell
  - req-the-editor-is-the-only-entry-point
  - fn-run-a-governed-walk.bring-the-product-up
---

The crossing between the act that happens ONCE and the act that happens EVERY
TIME. That split is the whole reason this iteration minted a second function.

## What crosses

A MACHINE THAT CAN RUN, AND A FOLDER THAT IS A PROJECT. Nothing else. The
entrypoint does not learn what the installer did beyond those two facts, and it
must not, because it runs on machines the installer touched months ago.

## Why it is a file rather than a call

THE INSTALLER IS LONG GONE BY THE TIME THIS CROSSES. There is nobody to call.
What the install left on disk is the whole message, which is why a half-install
is dangerous enough to have its own preflight.

## What it does NOT carry

NO STATE ABOUT WHICH INSTALL RAN. Once counts machines rather than projects, so a
second project on the same machine crosses this boundary with the same toolchain
and a different folder.
