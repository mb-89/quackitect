import json, os, sys
root = "/home/user/quackitect/test"
lines = {}
for d in ("level0", "contract"):
    for n in sorted(os.listdir(f"{root}/{d}")):
        if n.endswith(".js"):
            with open(f"{root}/{d}/{n}") as fh:
                lines[f"{d}/{n}"] = sum(1 for _ in fh)

G = {}  # group -> list of short names (level0 unless prefixed c:)
def add(group, names):
    for n in names.split():
        f = ("contract/" + n[2:]) if n.startswith("c:") else ("level0/" + n)
        if not f.endswith(".js"): f += ".test.js" if not n.endswith(".js") else ""
        G.setdefault(group, []).append(f)

add("D1", """agent answer-door answer-origin answer-read apply-door ask-door bash-bless bash-commit bash-desk
 bash-engine bash-ticket brief-cases cloud-ask code-door command-cases commit-guards-cases config-door context-handover
 grace-asks grace handover-door note-answer plan plan-queue prose review-cases review-door search-door session-layer
 stop-binding stop-door stop-helper stop-hold style-top tools-door trunk-door vale-rows wait write write-bless named
 pulled canary-debt hand-tools binding findings c:write-door-cases""")
add("D2", """answer apply bash bash-test-run controls magic names size shell-values verb-line stop paragraph projection
 projection-builtin vocabulary voice verbs plugin-check servers guidance ticket warnings log-serve schema schema-route
 schema-slots schema-sweep schema-notes.js graph status grid c:candidate-check c:cli-mint-callers c:one-reading
 c:one-config c:vale-paths c:biome c:awake c:wire""")
add("D3", """ticket-fill ticket-todo ticket-edit ticket-drift ticket-route ticket-verb ticket-new ticket-yours ask-lint
 bless-desk process pull pull-accept pull-bare pull-bless pull-cap pull-chapter pull-cleanup pull-ephemeral
 pull-escalate pull-fail-verdict pull-fails pull-fields pull-findings pull-format pull-gate pull-hand pull-hand-desk
 pull-hand-front pull-leaves pull-outline pull-person pull-push pull-spawn pull-stale pull-steps pull-todo
 pull-unbound pull-writes pull-writes-view person-step verdict-guard test-verb go-modules go-tests go-source
 check-server serve serve-port viewer trust browser battery cli-read lint-sweep budget one-reader topic-readers roots
 retro-notes-pull ready holds-leave queue queue-cloud unblock review work-answer work-answer-cloud work-marked
 work-fix work-open work-rows work-done work-merge-cloud work-cloud-marker work-list work-usage brand guidance-tags
 spawn-answer pull-doors.js pull-schema.js ticket-doors.js semicolon-vale.js c:pull-payload""")
add("D4", """config-golden.js guidance-golden.js guidance-golden log-golden.js log-golden queue-golden.js check-twins.js
 check-twins drawn-twin.js c:bridge-server-leaves c:cli-leaves c:log-read-leaves c:no-old-server
 c:no-road-names-server c:node-road c:twins-left c:dead-entries c:cli-check-doors c:lint-twins c:topic-keys
 c:runme-road c:cli-read""")
add("M1", """work work-group work-held work-chain work-gate work-switch work-orphan work-desk work-sync work-stands
 work-doors.js pull-kept pull-when pull-children branch-needs hand""")
add("M2", """c:schema c:ticket c:schema-bless c:process c:guidance-tags c:guidance-rules c:question-grades
 c:handover-words c:retro-route c:stop-rules c:tree c:folders c:vocabulary""")
add("M3", """c:cli-verbs c:verb-programs copilot-setup""")
add("M4", """sidebar-writes sidebar-v1 lens-v1 lens-actions start-constants""")
add("R1", """folders trunk layer log tools paths private index cloud-desk landed guidance-hand vehicle probe-cold hooks
 cage outside-hand stand save-fills c:install c:vehicle c:tree-extension""")
add("R2", """v1-index.js drawing-edit c:drawing-page c:ruled.js c:paragraph c:shape c:vale-fix c:outside-in-doors c:vale""")
add("R3", """sidebar""")

assigned = {}
for g, fs in G.items():
    for f in fs:
        if f not in lines: print("MISSING", f, file=sys.stderr); continue
        if f in assigned: print("DUP", f, assigned[f], g, file=sys.stderr)
        assigned[f] = g
for f in lines:
    if f not in assigned: assigned[f] = "K"
json.dump({"lines": lines, "assigned": assigned}, open(sys.argv[1], "w"))
from collections import Counter
c = Counter(); s = Counter()
for f, g in assigned.items(): c[g] += 1; s[g] += lines[f]
for g in sorted(c): print(g, c[g], s[g])
print("total", len(lines), sum(lines.values()))
