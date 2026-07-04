---
id: uc-stable-data-dir
type: usecase
refines: [need-qualities]
statement: The engine resolves one data and log home per workspace regardless of invoking shell, path casing, or separator style.
class: review
killer: false
---
## Rationale (not load-bearing)
Found in the i9 retro: PowerShell (C:\) and git-bash (c:\) hash the same workspace to different log homes, scattering sessions and blinding retro log-mining.
