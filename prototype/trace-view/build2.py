# Builds trace-view.html from the shell of the last page, the extracted rows, the
# coverage report, and the three script parts.
import os, json, re
S = os.path.dirname(os.path.abspath(__file__))
root = __import__('subprocess').check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip() + '/'
old = open(os.path.join(S, 'trace-build.py')).read()
html = old[old.index("html=r'''") + 9: old.rindex("'''")]
head, tail = html[:html.index('<script>')], html[html.index('</script>'):]

lcov = {}
cur = None; lf = lh = 0
if os.path.exists(os.path.join(S, 'lcov.info')):
    for line in open(os.path.join(S, 'lcov.info')):
        line = line.strip()
        if line.startswith('SF:'): cur = line[3:].replace(root, ''); lf = lh = 0
        elif line.startswith('LF:'): lf = int(line[3:])
        elif line.startswith('LH:'): lh = int(line[3:])
        elif line == 'end_of_record' and cur and lf: lcov[cur] = round(100 * lh / lf)

drawv = open(os.path.join(S, 'drawv.js')).read()
drawv = drawv.replace("const lvOf={di:'di',do:'do',sec:'sec',code:'file',test:'file'};", "const lvOf={di:'di',do:'do',sec:'sec',code:'code',test:'test'};")
drawv = drawv.replace("today&&l.id==='test'?'covers lines':''", "today&&l.id==='test'?'covers'+(LC?` · lines ${LINES}%`:''):''")
page = open(os.path.join(S, 'page.js.built' if os.path.exists(os.path.join(S,'page.js.built')) else 'page.js')).read()
if os.path.exists(os.path.join(S,'gocov.json')): lcov.update(json.load(open(os.path.join(S,'gocov.json'))))
page = page.replace('__DATA__', open(os.path.join(S, 'tree2.json')).read()).replace('__LCOV__', json.dumps(lcov) if lcov else 'null').replace('__DRAWV__', drawv)
page += "\nconst LINES=LC?Math.round(items('code').reduce((a,f)=>a+(LC[f.id]??0),0)/items('code').length):null;\n"
nav = open(os.path.join(S, 'nav.js.built' if os.path.exists(os.path.join(S,'nav.js.built')) else 'nav2.js')).read()

head = head.replace('</style>', '''.tile.picked{border:2px solid var(--fill);background:var(--hi)}.diagram .port .box{fill:var(--head);stroke-dasharray:4 3}.city .bld{cursor:pointer}.city .bld:hover polygon{stroke:#fff;stroke-width:1}.city .bld.sel polygon{stroke:#d03b3b;stroke-width:1.6}.sw{display:inline-block;width:11px;height:11px;border-radius:2px;margin:0 3px -1px 6px}.citykey{color:var(--ink2);margin:0 0 6px;font-size:12.5px}.cityname{font-family:system-ui;font-weight:600;fill:var(--ink);stroke:var(--bg);stroke-width:.25em;paint-order:stroke;pointer-events:none}.diagram .tangle{fill:none;stroke:#d03b3b;stroke-dasharray:5 3}.diagram .tl{font:italic 11px system-ui;fill:#d03b3b}.diagram .lvl{font:11px system-ui;fill:var(--ink2)}select{background:var(--bg);color:var(--ink);border:1px solid var(--rule);border-radius:4px;padding:1px 4px}.pan{cursor:grab}.pan.dragging{cursor:grabbing;user-select:none}.topv .cgdraw{max-height:calc(50vh - 150px);overflow:auto}.split.big{grid-template-rows:minmax(0,2fr) minmax(0,1fr)}.split.big .topv .cgdraw{max-height:calc(66vh - 150px)}.ctwrap{overflow:auto;max-height:calc(50vh - 60px)}.topv .ctwrap{max-height:calc(50vh - 130px)}.lt .ls{font-size:11px;color:var(--ink2);overflow:hidden;text-overflow:ellipsis}.lt>div{overflow:hidden;text-overflow:ellipsis}.lth.ct{font-weight:600;color:var(--ink)}.diagram .box{fill:var(--bg);stroke:var(--ink2);stroke-width:1}.diagram .box.root{stroke:var(--fill);stroke-width:2.5}.diagram .cut .box{stroke:#d03b3b;stroke-width:1.6}.diagram .bt{font:600 12px system-ui;fill:var(--ink)}.diagram .bs{font:11px system-ui;fill:var(--ink2)}.diagram [data-node]{cursor:pointer}.diagram [data-node]:hover .box{stroke:var(--fill)}.cgsplit{display:grid;grid-template-columns:250px 1fr;gap:12px;align-items:start}.cglist select{width:100%;margin-bottom:6px}.cgfns{max-height:300px;overflow:auto;border:1px solid var(--rule);border-radius:4px}.cgfn{padding:2px 6px;cursor:pointer;display:flex;gap:6px}.cgfn:hover{background:var(--hi)}.cgfn.sel{background:var(--hi);box-shadow:inset 3px 0 0 var(--fill)}.cgdraw{overflow:auto}.onion .rn{font:italic 15px system-ui;fill:#52514e;pointer-events:none}.onion .ot{font:600 17px system-ui;fill:#0b0b0b;pointer-events:none}.onion .seg{cursor:pointer}.onion .seg:hover{opacity:.8}.onion .seg.cyc{stroke:#d03b3b;stroke-width:2.5}.lab{pointer-events:none}.mxsplit{display:grid;grid-template-rows:minmax(0,3fr) minmax(0,2fr);height:calc(100vh - 140px);gap:8px}.mxtop{overflow:auto;min-height:0}.mxbot{overflow:auto;border-top:1px solid var(--rule);padding-top:6px;min-height:0}.gwrap{overflow:auto}.pick{color:var(--fill)}.mxwrap,.mxtop,.top,.tile{user-select:none}.idx{color:var(--ink2);width:34px;font-size:11.5px}.mxwrap{position:relative;display:inline-block}.hx{position:absolute;background:rgba(42,120,214,.13);pointer-events:none;display:none}
.mxbar{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin:4px 0 10px;font-size:12.5px}.mxbar button,.mxbar select{border:1px solid var(--rule);background:var(--bg);color:var(--ink);border-radius:4px;padding:1px 7px;cursor:pointer}
.act{border:1px solid var(--fill)!important}canvas#mx{display:block}.hint{color:var(--ink2);margin:2px 0 8px}code{font-size:12px}
.tt{position:fixed;pointer-events:none;background:var(--ink);color:var(--bg);padding:4px 7px;border-radius:4px;font-size:12px;display:none;z-index:9}
</style>''', 1)
head = re.sub(r'<nav>.*?</nav>', '''<nav><h1>Trace view</h1>
<p>The overview opens as the V or as columns. A level opens as a tree, as columns, or as its structure matrix, and code files add a call graph.</p>
<p><label><input type="radio" name="m" value="today" checked> main today</label><label><input type="radio" name="m" value="imagined"> imagined values</label></p>
<p>On the V a click opens a level, and a shift-click picks it. One pick adds structure to the switch, two add mapping.</p>
<p>In a matrix a click opens a folded group, a right click folds it again, and a shift-click picks rows and columns to make your own group.</p>
<p>A click on a row selects it for the local trace. ↗ opens the note. ← goes back, as does the mouse's back button.</p>
<p>Tests cover code by the imports they carry, and line coverage comes from the battery's coverage report.</p></nav>''', head, flags=re.S)
tail = tail.replace('</body>', '<div class="tt" id="tt"></div></body>', 1)
# three.js draws the city: the classic build and its orbit controls, inline, so the page stands alone
# the library stays out of git and out of the tree's checks: the build fetches the pinned package
# into the box's private cache where it stands missing, and unpacks the two files it reads
TH = os.path.join(root, '.se/cache/three')
THREE_FILES = ['package/build/three.min.js', 'package/examples/js/controls/OrbitControls.js']
if not os.path.exists(os.path.join(TH, THREE_FILES[0])):
    import subprocess, tarfile
    os.makedirs(TH, exist_ok=True)
    subprocess.run(['npm', 'pack', 'three@0.147.0'], cwd=TH, check=True)
    with tarfile.open(os.path.join(TH, 'three-0.147.0.tgz')) as tf:
        tf.extractall(TH, members=[tf.getmember(p) for p in THREE_FILES])
three = ''.join(open(os.path.join(TH, p)).read() + '\n' for p in THREE_FILES)
head = head.replace('</style>', '.split{grid-template-rows:minmax(0,1fr) 7px minmax(0,1fr);gap:0}.split.big{grid-template-rows:minmax(0,2fr) 7px minmax(0,1fr)}.splitter{cursor:row-resize;position:relative}.splitter::after{content:"";position:absolute;left:0;right:0;top:3px;border-top:1px solid var(--rule)}.splitter:hover::after,.splitter.dragging::after{border-top:3px solid var(--fill);top:2px}.botv{border-top:none!important}.topv{display:flex;flex-direction:column}.topv>.cgdraw,.topv>.ctwrap,.topv>.mxsplit{flex:1 1 auto;min-height:0;max-height:none!important}.topv>*{flex-shrink:0}.topv>.cgdraw,.topv>.ctwrap{flex-shrink:1}\n.city3{position:relative;overflow:hidden;border:1px solid var(--rule);border-radius:4px}.city3 canvas{display:block}.citylabels{position:absolute;inset:0;pointer-events:none}.citylabels .cityname{position:absolute;transform:translate(-50%,-50%);font:600 12.5px system-ui;color:var(--ink);text-shadow:0 0 3px var(--bg),0 0 3px var(--bg),0 0 2px var(--bg);white-space:nowrap}\n</style>', 1)
# the page stands dark, whatever the system asks: every surface, scroll bar and control takes the dark scheme
LIGHT = ':root{--bg:#fcfcfb;--ink:#0b0b0b;--ink2:#52514e;--rule:#e4e3df;--head:#f3f2ef;--hi:#e8f0fb;--fill:#2a78d6;--off:#ecebe7;--refine:#8a8984;--ver:#2a78d6;--val:#eb6834;--src:#1baf7a}'
assert LIGHT in head
head = head.replace(LIGHT, ':root{color-scheme:dark;--bg:#121212;--ink:#f2f2f0;--ink2:#b4b3aa;--rule:#353533;--head:#1e1e1d;--hi:#1c2b40;--fill:#3987e5;--off:#2a2a28;--refine:#8a8984;--ver:#3987e5;--val:#d95926;--src:#199e70}', 1)
head = head.replace('</style>', 'html,body{background:var(--bg);color:var(--ink)}*{scrollbar-color:#4a4a47 var(--bg)}::-webkit-scrollbar{width:11px;height:11px;background:var(--bg)}::-webkit-scrollbar-thumb{background:#4a4a47;border-radius:6px;border:2px solid var(--bg)}::-webkit-scrollbar-corner{background:var(--bg)}input{accent-color:var(--fill)}button{color:var(--ink);background:var(--bg)}.onion .rn{fill:#3a3a38}.onion .ot{fill:#121212}\n</style>', 1)
# grey lines drawn in the scripts take a grey that reads on the dark ground
page = page.replace('#52514e', '#8a8984')
# the scripts travel gzipped in base64, and the page unpacks them on load: the file stays small enough for a preview to read to its end
import gzip, base64
payload = base64.b64encode(gzip.compress((three + '\n;\n' + page + '\n' + nav + '\n').encode('utf-8'), 9)).decode('ascii')
loader = ('<script type="application/octet-stream" id="zjs">' + payload + '</script>\n<script>(async()=>{'
 "const b=Uint8Array.from(atob(document.getElementById('zjs').textContent),c=>c.charCodeAt(0));"
 "const t=await new Response(new Blob([b]).stream().pipeThrough(new DecompressionStream('gzip'))).text();"
 "const s=document.createElement('script');s.textContent=t;document.body.appendChild(s)})()</script>\n")
assert tail.startswith('</script>')
open(os.path.join(S, 'trace-view.html'), 'w').write(head + loader + tail[len('</script>'):])
print('page bytes', os.path.getsize(os.path.join(S, 'trace-view.html')))
print('built', len(lcov), 'files with line coverage')
