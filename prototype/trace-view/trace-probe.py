# Prototype: the lower half of a trace, as a query over .se/.runtime/index.db.
# Run from the repo root after ./RUNME.sh index standing.
import sqlite3, re, collections
c = sqlite3.connect('.se/.runtime/index.db')
def slug(h): return re.sub(r'[^a-z0-9 -]', '', h.lower()).strip().replace(' ', '-')
heads = {}
for path, body in c.execute("select path, body from note where kind='[[design_output]]'"):
    for m in re.finditer(r'^(#{1,3}) (.+)$', body, re.M):
        heads[(path[:-3], slug(m.group(2)))] = 0
code, test = collections.Counter(), collections.Counter()
pat = re.compile(r'\[\[(spec/design_output/[a-z0-9_-]+)#([a-z0-9-]+)\]\]')
for path, text in c.execute("select path, text from file where path like 'src/%' or path like 'test/%' or path like '.claude/%'"):
    for m in pat.finditer(text):
        (test if path.startswith('test/') else code)[(m.group(1), m.group(2))] += 1
print('headings', len(heads), 'with code', sum(1 for k in heads if code[k]), 'with test', sum(1 for k in heads if test[k]))
per = collections.defaultdict(lambda: [0, 0, 0])
for k in heads:
    per[k[0]][0] += 1; per[k[0]][1] += bool(code[k]); per[k[0]][2] += bool(test[k])
print('note  headings  with-code  with-test')
for p, (a, b, t) in sorted(per.items()): print(p.split('/')[-1], a, b, t)
print('edges between note kinds, as the link table holds them:')
for row in c.execute("""select n1.kind, n2.kind, l.key, count(*) from link l
  join note n1 on n1.path = l.from_path left join note n2 on n2.path = l.to_path
  group by 1, 2, 3 order by 4 desc"""): print(row)
