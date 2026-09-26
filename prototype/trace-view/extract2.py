# Rows for the trace view, read out of the index: notes, sections, pointers,
# imports between files, and the functions each code file defines and calls.
import sqlite3, re, json, collections, os, posixpath
# the tree is the git root the command runs in
root = __import__('subprocess').check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
S = os.path.dirname(os.path.abspath(__file__))
c = sqlite3.connect(root + '/.se/.runtime/index.db')

def slug(h): return re.sub(r'[^a-z0-9 -]', '', h.lower()).strip().replace(' ', '-')

notes = {}
for kind in ('design_input', 'design_output'):
    for p, body in c.execute("select path, body from note where kind=?", ('[[' + kind + ']]',)):
        notes[p[:-3]] = {'id': p[:-3], 'kind': kind, 'name': p[:-3].split('/')[-1], 'body': body}

refines = collections.defaultdict(set)
for d, n in notes.items():
    if n['kind'] != 'design_output': continue
    t = open(root + '/' + d + '.md').read().split('\n---', 1)[0]
    m = re.search(r'^refines:(.*?)(?=^\w|\Z)', t, re.M | re.S)
    if m:
        for x in re.findall(r'\[\[([^\]#|]+)', m.group(1)): refines[d].add(x.strip())

# sections, with the body line each starts on
secs = collections.OrderedDict(); starts = collections.defaultdict(list)
for d, n in notes.items():
    if n['kind'] != 'design_output': continue
    for i, line in enumerate(n['body'].split('\n'), 1):
        m = re.match(r'^(#{1,3}) (.+)$', line)
        if m:
            k = d + '#' + slug(m.group(2))
            secs[k] = {'id': k, 'note': d, 'title': m.group(2)}
            starts[d].append((i, k))

def section_at(note, line):
    last = None
    for i, k in starts.get(note, []):
        if i <= line: last = k
    return last

# links inside one level: note to note, section to section
dd = collections.Counter(); ss = collections.Counter()
for f, target, to, line in c.execute("select from_path, target, to_path, line from link where to_path is not null and key=''"):
    a, b = f[:-3], to.rsplit('.', 1)[0]
    if a in notes and b in notes and notes[a]['kind'] == notes[b]['kind'] and a != b:
        dd[(a, b)] += 1
    if a in notes and notes[a]['kind'] == 'design_output' and '#' in target:
        src = section_at(a, line); dst = target.split('#')[0] + '#' + target.split('#')[1]
        if src and dst in secs and src != dst: ss[(src, dst)] += 1

files = {}
for path, text in c.execute("select path, text from file where tracked=1 and (path like 'src/%' or path like 'test/%' or path like '.claude/%') and (path like '%.js' or path like '%.mjs' or path like '%.go')"):
    if '/node_modules/' in path or '/fake/' in path and path.startswith('test/'): pass
    kind = 'test' if path.startswith('test/') or path.endswith('_test.go') or path.endswith('.test.js') else 'code'
    files[path] = {'id': path, 'kind': kind, 'text': text}

# pointers from a file to a section
ptr = re.compile(r'\[\[(spec/design_output/[a-z0-9_-]+)#([a-z0-9-]+)\]\]')
f2s = collections.defaultdict(set)
for p, f in files.items():
    for m in ptr.finditer(f['text']):
        k = m.group(1) + '#' + m.group(2)
        if k in secs: f2s[p].add(k)

# imports: relative JS imports, and Go packages by module path
mods = {}
for p, in c.execute("select path from file where path like 'src/%/go.mod'"):
    t = c.execute("select text from file where path=?", (p,)).fetchone()[0]
    m = re.search(r'^module\s+(\S+)', t, re.M)
    if m: mods[m.group(1)] = posixpath.dirname(p)
jsimp = re.compile(r'''(?:import\s[^'"]*?from\s*|import\s*\(\s*|require\s*\(\s*|import\s+)['"](\.{1,2}/[^'"]+)['"]''')
def resolve_js(base, rel):
    p = posixpath.normpath(posixpath.join(posixpath.dirname(base), rel))
    for cand in (p, p + '.js', p + '.mjs', p + '/index.js'):
        if cand in files: return cand
    return None
imports = collections.defaultdict(set)
godirs = collections.defaultdict(list)
for p, f in files.items():
    if p.endswith('.go'): godirs[posixpath.dirname(p)].append(p)
for p, f in files.items():
    if p.endswith('.go'):
        d = posixpath.dirname(p)
        if f['kind'] == 'test':
            for q in godirs[d]:
                if files[q]['kind'] == 'code': imports[p].add(q)
        blocks = re.findall(r'^import\s*\((.*?)\)', f['text'], re.S | re.M) + re.findall(r'^import\s+(?:\w+\s+)?("[^"]+")', f['text'], re.M)
        for imp in re.findall(r'"([\w./-]+)"', '\n'.join(blocks)):
            for mod, md in mods.items():
                if imp == mod or imp.startswith(mod + '/'):
                    pd = posixpath.normpath(md + imp[len(mod):])
                    for q in godirs.get(pd, []):
                        if files[q]['kind'] == 'code': imports[p].add(q)
    else:
        for rel in jsimp.findall(f['text']):
            q = resolve_js(p, rel)
            if q and q != p: imports[p].add(q)

# outside modules each file imports: what it reaches past this tree
jsext = re.compile(r'''(?:import\s[^'"]*?from\s*|import\s*\(\s*|require\s*\(\s*|import\s+)['"]([^'"./][^'"]*)['"]''')
ext = {}
for p, f in files.items():
    if p.endswith('.go'):
        blocks = re.findall(r'^import\s*\((.*?)\)', f['text'], re.S | re.M) + re.findall(r'^import\s+(?:\w+\s+)?("[^"]+")', f['text'], re.M)
        names = [x for x in re.findall(r'"([\w./-]+)"', '\n'.join(blocks)) if not any(x == m or x.startswith(m + '/') for m in mods)]
    else:
        names = jsext.findall(f['text'])
    if names: ext[p] = sorted(set(names))

# functions and calls in code files
jsdef = re.compile(r'^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(|^\s*(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>')
godef = re.compile(r'^func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)\s*[\[(]')
funcs = {}
for p, f in files.items():
    if f['kind'] != 'code': continue
    lines = f['text'].split('\n'); defs = []
    for i, line in enumerate(lines, 1):
        m = (godef if p.endswith('.go') else jsdef).match(line)
        if m: defs.append((i, next(g for g in m.groups() if g)))
    funcs[p] = [{'name': n, 'line': i, 'body': '\n'.join(lines[i:(defs[j + 1][0] - 1 if j + 1 < len(defs) else len(lines))])} for j, (i, n) in enumerate(defs)]
byname = collections.defaultdict(list)
for p, fs in funcs.items():
    for fn in fs: byname[fn['name']].append(p)
call = re.compile(r'\b([A-Za-z_$][\w$]*)\s*\(')
calls = {}
for p, fs in funcs.items():
    reach = {p} | imports.get(p, set())
    out = []
    for fn in fs:
        seen = []
        for name in call.findall(fn['body']):
            if name == fn['name'] or name in ('if', 'for', 'while', 'switch', 'return', 'function', 'catch'): continue
            where = [q for q in byname.get(name, []) if q in reach]
            if where:
                t = [where[0] if p not in where else p, name]
                if t not in seen: seen.append(t)
        out.append({'name': fn['name'], 'line': fn['line'], 'calls': seen})
    calls[p] = out

# lines per file, and how often git changed each one over main's history
import subprocess
loc = {p: f['text'].count('\n') + 1 for p, f in files.items()}
log = subprocess.run(['git', 'log', '--format=', '--name-only', 'origin/main'], cwd=root, capture_output=True, text=True).stdout
changes = collections.Counter(x for x in log.split('\n') if x in files)
# the notes join the city: their lines and their changes, under the note's id
for nid in notes:
    fp = os.path.join(root, nid + '.md')
    if os.path.exists(fp):
        loc[nid] = open(fp, encoding='utf-8').read().count('\n') + 1
        changes[nid] = log.split('\n').count(nid + '.md')
used = set(f2s) | set(imports) | {q for v in imports.values() for q in v}
out = {
  'notes': [{'id': n['id'], 'kind': n['kind'], 'name': n['name']} for n in notes.values()],
  'refines': {k: sorted(v) for k, v in refines.items()},
  'secs': list(secs.values()),
  'files': [{'id': p, 'kind': f['kind']} for p, f in files.items()],
  'f2s': {k: sorted(v) for k, v in f2s.items()},
  'imports': {k: sorted(v) for k, v in imports.items()},
  'dd': [[a, b, n] for (a, b), n in dd.items()],
  'ss': [[a, b, n] for (a, b), n in ss.items()],
  'calls': calls,
  'ext': ext,
  'loc': loc,
  'changes': dict(changes),
}
json.dump(out, open(S + '/tree2.json', 'w'))
tests = [p for p, f in files.items() if f['kind'] == 'test']
print('files', len(files), 'tests', len(tests), 'tests importing code', sum(1 for t in tests if any(files[q]['kind'] == 'code' for q in imports.get(t, []))),
      'code covered by a test', len({q for t in tests for q in imports.get(t, []) if files[q]['kind'] == 'code'}), 'of', len(files) - len(tests),
      'functions', sum(len(v) for v in calls.values()), 'section links', len(ss), 'note links', len(dd))
