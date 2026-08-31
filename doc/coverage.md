# What is tested, and what is not

**Every story and every case in the first-build set, against the test that
proves it.** A case with no test is named as such, with the reason.

| | |
|---|---|
| Date | 2026-08-30 |
| Run | `RUNME --selftest`, and `go test ./...` in each source folder |

## The stories

| Story | Proved by |
|---|---|
| US-1 install with one script | `--selftest` steps 1 to 3, and `--dry-run` in the installer |
| US-2 start the caged agent from idle | **by hand.** It needs a harness and an editor |
| US-4 the agent speaks the way the engine prescribes | `TestTheVoiceCheckSeesWhatAProgramCanSee`, `TestAWriteThatBreaksAVoiceRuleIsRefused` |
| US-5 watch the cage hold | `TestTheGuardAppendsToTheRunningSession`, `TestTheGuardRefusesAProjectionAndNothingElse`, `TestTheWordPutsEverythingDownAndPicksItUpAgain` |
| US-6 read the log without a mouse | `TestArrivingLinesDoNotMoveAHeldSelection` and the rest in the viewer |

## The first-build cases

| Case | Proved by |
|---|---|
| UC-0 one script installs everything | `--selftest`, and the installer's own tests |
| The bootstrap declares no flags of its own | `TestEveryFlagHandedToTheInstallerExists`, `TestTheHelpNamesEveryFlag` |
| Every command a document points at answers `--help` | `--selftest` step "the project answers --help through RUNME" |
| UC-1 cold start in an empty folder | `TestAnEmptyFolderCanBeDrivenAndTwoCopiesBothResolve` |
| UC-2 two engines on one machine | the same test, and `TestInitClearsTheDriverSoTheChoiceIsAskedAgain` |
| UC-3 a write to a projection | `TestTheGuardRefusesAProjectionAndNothingElse` |
| UC-4 a shell command | **not tested.** Nothing guards it by ruling, and the log is proved elsewhere |
| UC-5 emergency mode | `TestEmergencyModeExpires` |
| UC-6 the engine dies mid-session | **not tested.** It is a heartbeat the editor watches, and the editor is not under test |
| UC-7 compaction, and a config change | `TestReadEvidenceIsResetByCompaction`, `TestAConfigurationChangeResetsTheReadEvidence` |
| UC-29 idle to ready, with Claude | **by hand.** It needs the harness |
| UC-30 idle to ready, with Copilot | **by hand.** It needs the harness |
| UC-31 an original changes, its projection follows | `TestAChangedOriginalIsProjectedAgain`, `TestTheDigestFollowsContentNotTime` |
| UC-32 a document that breaks a voice rule | `TestAWriteThatBreaksAVoiceRuleIsRefused`, `TestCodeIsNotProse`, `TestTheRulesCanBeSwapped`, `TestABrokenVoiceCheckerDoesNotStopAWrite` |
| Private originals do not travel | `TestACopyOfAPrivateOriginalIsRefused` |
| UC-33 a session measured for voice | **not built.** The checker exists. Sampling a session does not |
| UC-34 every call is in the log | `TestTheGuardAppendsToTheRunningSession`, `TestEveryWriteReachesTheFileAndNamesItsWriter` |
| UC-35 Level 0 alone, with no authority | `TestStoppingIsRecordedAndOnlyRefusedWhenAsked`, and the guard tests |
| A person with no panel puts everything down | `TestOnlyAWholeMessageIsAWord`, `TestTheWordPutsEverythingDownAndPicksItUpAgain` |
| UC-36 read a growing log while reading a detail | `TestArrivingLinesDoNotMoveAHeldSelection`, `TestArrivingLinesDoNotRedrawTheDetailPane` |
| UC-37 filter down to one call | `TestFilterShapes`, `TestHalfTypedPatternKeepsTheLastGoodFilter` |

## The story the whole thing is for

`RUNME --selftest` walks it in one command, with no agent and no model:

```
produce a copy
  it carries the method and not the history
  it has its own identity
a project records which copy drives it
  the driver resolves through the register
the copy writes into the project, and not into itself
  the record is in the project
  the guard knows the project's projections
  nothing was written back
the vehicle makes a project
  that project answers --version through its own RUNME
```

The steps that check what did **not** happen are there because separation is
only ever proved by an absence.

## What is left

| Gap | Why it is still open |
|---|---|
| Voice measured over a session | The checker exists. Reading a session record and counting by rule does not |
| The two harness walks | They need a real editor and a real agent. Nothing here can stand in for either |
| The engine dying, as a test | The heartbeat is watched by the editor, which is not under test |
