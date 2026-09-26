# Builds trace-view.html with the matrix editor: patches the page and the
# navigation, adds the Go coverage profiles, then runs build2's assembly.
#
# The whole build, from the tree's root, with P=prototype/trace-view:
#   node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=$P/lcov.info
#   for m in src/*/go.mod; do (cd $(dirname $m) && go test -coverprofile=$OLDPWD/$P/cover-$(basename $(dirname $m)).out ./...); done
#   python3 $P/extract2.py && python3 $P/build3.py && python3 $P/build2.py
# The page lands at $P/trace-view.html, and shot19.mjs to shot21.mjs check it in a browser from $P.
import os, re, glob, collections
S = os.path.dirname(os.path.abspath(__file__))
def rd(n): return open(os.path.join(S, n)).read()

page = rd('page.js')
a = page.index('// ---- a matrix on a canvas'); b = page.index('// ---- the call graph')
page = page[:a] + rd('mx.js') + '\n' + page[b:]
# the drawn diagrams take the place of the call tree
a = page.index('// ---- the call graph of one code file'); b = page.index("return h+'</table>'}", a) + len("return h+'</table>'}")
page = page[:a] + rd('diagrams.js') + '\n' + page[b:]
page = page.replace("{id:'do',name:'Design outputs'},{id:'sec',name:'Sections'}", "{id:'do',name:'Design outputs',extra:['block','levels','onion']},{id:'sec',name:'Sections',extra:['block']}")
# the city of the whole tree in city.js takes the place of the code city in views.js, and stands on the overview alone
views = rd('views.js'); a = views.index('function cityView('); b = views.index('// ---- the levelled structure map')
page += '\n' + views[:a] + rd('city.js') + '\n' + views[b:] + '\n'
# the details below show the item the overview selects, where no level is open
assert "function local(){const id=st.at&&st.at.id;" in page
page = page.replace("function local(){const id=st.at&&st.at.id;", "function local(){const id=st.at?st.at.id:st.osel;", 1)
# the call graph takes its file from the editor, and opens on the top files when none is selected
page = page.replace("function callGraph(){CG=CG||cgCalls();const s=st.cg;const files=items('code').filter(n=>(D.calls[n.id]||[]).length);\n const file=st.at.id&&D.calls[st.at.id]?st.at.id:(s.file&&D.calls[s.file]?s.file:files[0].id);",
 "function callGraph(){CG=CG||cgCalls();const s=st.cg;if(!st.at.id||N[st.at.id]?.lv!=='code')return callFiles();\n const file=st.at.id;")
page = re.sub(r"return `<div class=\"mxbar\"><span>file <select id=\"cgfile\">.*?</select></span>\n", "return `<div class=\"mxbar\">", page, count=1, flags=re.S)
assert 'return callFiles()' in page and 'id="cgfile"' not in page.split('function callGraph(){CG=CG||cgCalls();const s=st.cg;if(')[1].split('function cgBind')[0]

nav = rd('nav2.js')
a = nav.index('// the matrix view: every matrix draws'); b = nav.index('// the local trace:')
nav = nav[:a] + nav[b:]
R = [
 ("let st={at:null,view:'v',depth:1,pick:[],mx:{hide:false,size:'all',rp:0,cp:0}}",
  "let st={at:null,view:'v',depth:1,pick:[],mx:{hide:false,size:'all',rp:0,cp:0,grouping:'tree',zoom:true,openRows:new Set(),openCols:new Set(),pickRows:new Set(),pickCols:new Set()}}"),
 ("function viewsHere(){if(!st.at)return ['v','columns'];",
  "function viewsHere(){if(!st.at)return [...(st.pick.length===1?['structure']:st.pick.length===2?['mapping']:[]),'v','columns','city'];"),
 ("st.mx={...st.mx,rp:0,cp:0};",
  "st.mx={...st.mx,rp:0,cp:0,openRows:new Set(),openCols:new Set(),pickRows:new Set(),pickCols:new Set()};"),
 ("v.querySelectorAll('button').forEach(x=>x.onclick=()=>{st.view=x.dataset.v;cols=[];render()});",
  "v.querySelectorAll('button').forEach(x=>x.onclick=()=>{const k=x.dataset.v;if(!st.at&&k==='structure'){const p=st.pick;st.pick=[];return go({lv:p[0]},'structure')}if(!st.at&&k==='mapping'){const p=st.pick;st.pick=[];return go({map:p})}st.view=k;cols=[];render()});"),
 ("const main=!st.at?(st.view==='v'?overviewBar()+drawV():columns())",
  "const main=!st.at?(st.view==='columns'?columns():st.view==='city'?cityView():overviewBar()+drawV())"),
 ("b.innerHTML=st.at&&!st.at.map?`<div class=\"split\">",
  "const mxv=st.at&&(st.at.map||st.view==='structure');b.innerHTML=st.at&&!mxv?`<div class=\"split\">"),
 ("x.onclick=()=>{const l=x.dataset.lv;st.pick=st.pick.includes(l)?st.pick.filter(y=>y!==l):[...st.pick,l].slice(-2);render()};x.ondblclick=()=>{st.pick=[];go({lv:x.dataset.lv})}",
  "x.onclick=e=>{const l=x.dataset.lv;if(!e.shiftKey){st.pick=[];return go({lv:l})}st.pick=st.pick.includes(l)?st.pick.filter(y=>y!==l):[...st.pick,l].slice(-2);render()}"),
 ("if(st.scrollTo){", "if(mxv)mxBind(b);if(st.view==='calls')cgBind(b);if(st.view==='block'||st.view==='onion')dgBind(b);\n if(st.scrollTo){"),
 ("st.view==='calls'?callGraph():tree()", "st.view==='calls'?callGraph():st.view==='block'?(st.dg.path&&st.dg.path.length?blockInside(st.dg.path[st.dg.path.length-1]):blockView(st.at.lv==='sec')):st.view==='onion'?onionView():st.view==='levels'?levelsView():st.view==='city'?cityView():tree()"),
 ("if(mxv)mxBind(b);if(st.view==='calls')", "zoomBind(b);if(st.view==='city')cityBind(b);if(st.view==='levels'){dgBind(b);levelsBind()}if(mxv)mxBind(b);if(st.view==='calls')"),
 # the block diagram's drill-down adds its own breadcrumbs, and each leads back out to its depth
 (" el.innerHTML=`<button class=\"back\"", " if(st.view==='block'&&st.dg.path&&st.dg.path.length&&a&&a.lv){parts=parts.slice(0,2);parts.push({label:'block diagram',act:()=>{st.dg.path=[];render()},menu:()=>[]});st.dg.path.forEach((d,i)=>parts.push({label:N[d].name,act:()=>{st.dg.path=st.dg.path.slice(0,i+1);render()},menu:()=>[]}))}\n el.innerHTML=`<button class=\"back\""),
 ("${k==='v'?'V':k==='calls'?'call graph':k}", "${({v:'V',calls:'call graph',block:'block diagram',levels:'levelled map',city:'city'})[k]||k}"),
 ("let st={at:null,view:'v',depth:1,pick:[],", "let st={at:null,view:'v',depth:1,pick:[],cg:{},dg:{},city:{},"),
]
for old, new in R:
    assert old in nav, 'missing: ' + old[:70]
    nav = nav.replace(old, new, 1)
# the local trace moves to the shared trace columns, so the old one leaves
nav = re.sub(r"// the local trace: the selected item.*?(?=function overviewBar)", "", nav, count=1, flags=re.S)
nav = nav.replace("if(mxv)mxBind(b);", "ctBind(b);if(mxv)mxBind(b);", 1)
# the city takes two thirds of the height, and the local trace the rest
assert '<div class="split"><div class="topv"' in nav
nav = nav.replace('<div class="split"><div class="topv"', '<div class="split${st.view===\'city\'?\' big\':\'\'}"><div class="topv"', 1)
# the overview's city stands on top, and the details of what it selects below
assert "b.innerHTML=st.at&&!mxv?" in nav
nav = nav.replace("b.innerHTML=st.at&&!mxv?", "b.innerHTML=(st.at&&!mxv)||(!st.at&&st.view==='city')?", 1)
# a handle between the two panes moves the split, and the split keeps its place across redraws
assert '<div class="topv" id="topv">${main}</div><div class="botv">' in nav and "zoomBind(b);" in nav
nav = nav.replace('<div class="topv" id="topv">${main}</div><div class="botv">', '<div class="topv" id="topv">${main}</div><div class="splitter" title="drag to resize"></div><div class="botv">', 1)
nav = nav.replace("<div class=\"split${st.view==='city'?' big':''}\">", "<div class=\"split${st.view==='city'?' big':''}\"${st.splitH?` style=\"grid-template-rows:${st.splitH}px 7px minmax(0,1fr)\"`:''}>", 1)
assert 'st.splitH?' in nav
nav = nav.replace("zoomBind(b);", "splitBind(b);zoomBind(b);", 1)
# a redraw keeps every panned view where it stood
nav = re.sub(r"function renderKeep\(\)\{.*?\n", "function renderKeep(){const keep=[...document.querySelectorAll('#topv,.botv,[data-pan]')].map(el=>[el.id||el.className.split(' ')[0]+(el.dataset.pan||''),el.scrollLeft,el.scrollTop]);render();keep.forEach(([k,l,t])=>{const el=[...document.querySelectorAll('#topv,.botv,[data-pan]')].find(x=>(x.id||x.className.split(' ')[0]+(x.dataset.pan||''))===k);if(el){el.scrollLeft=l;el.scrollTop=t}})}\n", nav, count=1, flags=re.S)
# the old matrix switches leave; the editor binds its own
for gone in [r" const hide=document.getElementById\('mxhide'\).*?\n", r" const ordSel=document.getElementById\('mxorder'\).*?\n", r" const size=document.getElementById\('mxsize'\).*?\n", r" b.querySelectorAll\('\[data-p\]'\).*?\n"]:
    nav = re.sub(gone, '', nav, count=1)
# the overview bar says how to pick, and names the picks
nav = re.sub(r"function overviewBar\(\)\{.*?(?=function renderKeep)","function overviewBar(){const p=st.pick;return `<p class=\"sub\">A click opens a level. A shift-click picks it, and a pick adds its views to the switch: structure for one level, mapping for two.${p.length?` Picked: ${p.map(lvName).join(', ')}.`:''}</p>`}\n", nav, count=1, flags=re.S)
open(os.path.join(S, 'page.js.built'), 'w').write(page)
open(os.path.join(S, 'nav.js.built'), 'w').write(nav)

# Go coverage: statements covered per file, from each module's profile
gocov = {}
mods = {}
ROOT = __import__('subprocess').check_output(['git', 'rev-parse', '--show-toplevel'], text=True).strip()
for gm in glob.glob(os.path.join(ROOT, 'src/*/go.mod')):
    m = re.search(r'^module\s+(\S+)', open(gm).read(), re.M)
    if m: mods[m.group(1)] = os.path.relpath(os.path.dirname(gm), ROOT)
tot = collections.Counter(); hit = collections.Counter()
for prof in glob.glob(os.path.join(S, 'cover-*.out')):
    for line in open(prof):
        if line.startswith('mode:'): continue
        m = re.match(r'(\S+?):\d+\.\d+,\d+\.\d+ (\d+) (\d+)', line)
        if not m: continue
        path, n, c = m.group(1), int(m.group(2)), int(m.group(3))
        for mod, d in mods.items():
            if path.startswith(mod + '/'):
                rel = d + path[len(mod):]; tot[rel] += n; hit[rel] += n if c else 0
for k in tot:
    if tot[k]: gocov[k] = round(100 * hit[k] / tot[k])
open(os.path.join(S, 'gocov.json'), 'w').write(__import__('json').dumps(gocov))
print('go files with coverage', len(gocov))
