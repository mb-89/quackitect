package main

// dsm.go — DSM (Design Structure Matrix) clustering and layering over the
// engine's own design-region coupling graph. `quack cluster <model-id>` reads the
// real region-to-region call graph (deriveDesignFlow), groups the regions into
// modules by coupling, orders the modules into layers, reports the residual cyclic
// couplings (tears), and compares the result to the model's declared bands.
//
// The method nodes (spec/methods/meth-dsm*.md) ground the vocabulary; the digest
// (Structural Complexity Management, Lindemann/Maurer/Braun) supplies the operations:
// clustering, partitioning, tearing, degree-of-connectivity.

import (
	"fmt"
	"os"
	"sort"
	"strings"
)

// design: go-dsm-cluster  implements: req-dsm-cluster
// The DSM pipeline is stdlib-only and fully DETERMINISTIC, no RNG. It computes a symmetric coupling weight over the design regions, then an IGTA-style bid/cost hill-climb with fixed restarts for the clustering. Then it runs Tarjan SCC plus weakest-edge tearing plus Kahn layering over the cluster digraph for the ordering. The same code runs the real engine graph and the selftest's small known fixtures. It is reproducible by construction, so a fixture assertion is a real regression guard.

// dsmPowCC is the cluster-cost size exponent; dsmPowBid the bid + inter-cluster
// exponent. Both default to 1 (documented in meth-dsm-clustering / the digest).
const (
	dsmPowCC  = 1
	dsmPowBid = 1
)

// ipow raises an integer base to a small non-negative integer power — exact and
// deterministic (no float pow), keeping the cost an integer.
func ipow(base int64, exp int) int64 {
	r := int64(1)
	for i := 0; i < exp; i++ {
		r *= base
	}
	return r
}

// wedge is one symmetric coupling: nodes i<j with weight w = |i->j| + |j->i|.
type wedge struct {
	i, j int
	w    int
}

// nbr is a weighted neighbour in the adjacency list.
type nbr struct {
	to int
	w  int
}

// dsmTear is one torn cluster-level directed edge (from -> to, display indices),
// broken to make the cluster digraph acyclic.
type dsmTear struct {
	From, To int
	Weight   int
}

// dsmResult is the full proposal.
type dsmResult struct {
	Ids       []string       // coupled region ids, sorted
	NodeCount int            // len(Ids)
	EdgeCount int            // directed couplings among the node set
	Clusters  [][]string     // members per cluster, display order (layer asc, then min id)
	Layer     []int          // layer number per display cluster
	ClusterOf map[string]int // region id -> display cluster index
	Tears     []dsmTear      // residual cyclic couplings (cluster edges torn)
	TotalCost int64          // the clustering objective value
	DoC       float64        // degree of connectivity: edges / N(N-1)
}

// dsmAnalyze runs the whole pipeline on a directed region call graph.
// consumes[A] = the design ids A calls into (the DSM; direction dropped for
// clustering, restored for layering). Pure — no I/O, no globals — so the selftest
// drives it on fixtures.
func dsmAnalyze(consumes map[string][]string) dsmResult {
	// node set: every id that appears as a caller or a callee.
	set := map[string]bool{}
	for src, dsts := range consumes {
		set[src] = true
		for _, d := range dsts {
			set[d] = true
		}
	}
	ids := make([]string, 0, len(set))
	for id := range set {
		ids = append(ids, id)
	}
	sort.Strings(ids)
	n := len(ids)
	idx := make(map[string]int, n)
	for i, id := range ids {
		idx[id] = i
	}

	// directed adjacency (dirOut[i][j] means region i calls region j).
	dirOut := make([]map[int]bool, n)
	for i := range dirOut {
		dirOut[i] = map[int]bool{}
	}
	edgeCount := 0
	for src, dsts := range consumes {
		si := idx[src]
		for _, d := range dsts {
			di, ok := idx[d]
			if !ok || di == si {
				continue
			}
			if !dirOut[si][di] {
				dirOut[si][di] = true
				edgeCount++
			}
		}
	}

	// symmetric weight w(i,j) = |i->j| + |j->i|, plus the adjacency for bids.
	var edges []wedge
	adj := make([][]nbr, n)
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			w := 0
			if dirOut[i][j] {
				w++
			}
			if dirOut[j][i] {
				w++
			}
			if w == 0 {
				continue
			}
			edges = append(edges, wedge{i, j, w})
			adj[i] = append(adj[i], nbr{j, w})
			adj[j] = append(adj[j], nbr{i, w})
		}
	}

	res := dsmResult{Ids: ids, NodeCount: n, EdgeCount: edgeCount, ClusterOf: map[string]int{}}
	if n > 1 {
		res.DoC = float64(edgeCount) / float64(n*(n-1))
	}

	// --- clustering: fixed restarts, keep the lowest-cost assignment ---
	cl := igtaCluster(n, edges, adj)
	res.TotalCost = dsmCost(cl, edges, n)

	// --- layering: cluster digraph, Tarjan SCC, tear, Kahn ---
	cw := map[[2]int]int{} // directed cluster edge weight (region-edge count)
	for i := 0; i < n; i++ {
		for j := range dirOut[i] {
			ci, cj := cl[i], cl[j]
			if ci != cj {
				cw[[2]int{ci, cj}]++
			}
		}
	}
	labels := distinctSortedInts(cl)
	torn := tearCycles(labels, cw) // mutates cw: removes the torn edges
	layerOf := kahnLayers(labels, cw)

	// --- display ordering: clusters by (layer asc, min member id) ---
	members := map[int][]string{}
	for i, id := range ids {
		members[cl[i]] = append(members[cl[i]], id)
	}
	for _, m := range members {
		sort.Strings(m)
	}
	ordered := make([]int, len(labels))
	copy(ordered, labels)
	sort.Slice(ordered, func(a, b int) bool {
		la, lb := layerOf[ordered[a]], layerOf[ordered[b]]
		if la != lb {
			return la < lb
		}
		return members[ordered[a]][0] < members[ordered[b]][0]
	})
	display := map[int]int{} // label -> display index
	for di, lab := range ordered {
		display[lab] = di
		res.Clusters = append(res.Clusters, members[lab])
		res.Layer = append(res.Layer, layerOf[lab])
		for _, id := range members[lab] {
			res.ClusterOf[id] = di
		}
	}
	for _, t := range torn {
		res.Tears = append(res.Tears, dsmTear{From: display[t.From], To: display[t.To], Weight: t.Weight})
	}
	sort.Slice(res.Tears, func(a, b int) bool {
		if res.Tears[a].From != res.Tears[b].From {
			return res.Tears[a].From < res.Tears[b].From
		}
		return res.Tears[a].To < res.Tears[b].To
	})
	return res
}

// dsmCost is the clustering objective:
//
//	TotalCost = Σ_cluster ( intra_w × size^dsmPowCC ) + inter_w × N^dsmPowBid
//
// Lower is better: dense small clusters are cheap, cross-cluster coupling is dear.
func dsmCost(cl []int, edges []wedge, n int) int64 {
	intra := map[int]int64{}
	var inter int64
	for _, e := range edges {
		if cl[e.i] == cl[e.j] {
			intra[cl[e.i]] += int64(e.w)
		} else {
			inter += int64(e.w)
		}
	}
	size := map[int]int64{}
	for _, c := range cl {
		size[c]++
	}
	var cost int64
	for c, ia := range intra {
		cost += ia * ipow(size[c], dsmPowCC)
	}
	cost += inter * ipow(int64(n), dsmPowBid)
	return cost
}

// igtaCluster runs the deterministic hill-climb from three fixed restarts and
// keeps the lowest-cost assignment. The restarts are id-sorted (ascending),
// reverse-sorted, and degree-descending — no RNG, so the result is reproducible.
func igtaCluster(n int, edges []wedge, adj [][]nbr) []int {
	if n == 0 {
		return nil
	}
	asc := make([]int, n)
	for i := range asc {
		asc[i] = i
	}
	desc := make([]int, n)
	for i := range desc {
		desc[i] = n - 1 - i
	}
	byDeg := make([]int, n)
	copy(byDeg, asc)
	sort.Slice(byDeg, func(a, b int) bool {
		if len(adj[byDeg[a]]) != len(adj[byDeg[b]]) {
			return len(adj[byDeg[a]]) > len(adj[byDeg[b]])
		}
		return byDeg[a] < byDeg[b]
	})

	var best []int
	var bestCost int64
	for _, order := range [][]int{asc, desc, byDeg} {
		cl := runIGTA(order, edges, adj, n)
		c := dsmCost(cl, edges, n)
		if best == nil || c < bestCost {
			best, bestCost = cl, c
		}
	}
	return best
}

// runIGTA runs bid/cost passes in the given fixed node order until a pass makes no
// move. Every element starts as its own singleton; a move is kept only if it
// strictly lowers the total cost.
func runIGTA(order []int, edges []wedge, adj [][]nbr, n int) []int {
	cl := make([]int, n)
	for i := range cl {
		cl[i] = i // singletons
	}
	next := n // next fresh cluster label
	for pass := 0; pass < 4*n+8; pass++ {
		moved := false
		for _, i := range order {
			sumTo := map[int]int64{}
			for _, e := range adj[i] {
				sumTo[cl[e.to]] += int64(e.w)
			}
			size := map[int]int{}
			for _, c := range cl {
				size[c]++
			}
			cur := cl[i]
			bestLabel := cur
			bestBid := bidOf(sumTo[cur], size[cur])
			for _, k := range sortedKeysI64(sumTo) {
				if k == cur {
					continue
				}
				b := bidOf(sumTo[k], size[k])
				if b > bestBid || (b == bestBid && k < bestLabel) {
					bestBid, bestLabel = b, k
				}
			}
			// the split escape hatch: a fresh singleton bids 0, so it is only ever
			// chosen when no neighbour cluster bids positive — kept for faithfulness
			// to the IGTA candidate set (digest / meth-dsm-clustering).
			if size[cur] > 1 && 0.0 > bestBid {
				bestLabel = next
			}
			if bestLabel == cur {
				continue
			}
			old := dsmCost(cl, edges, n)
			save := cl[i]
			cl[i] = bestLabel
			if dsmCost(cl, edges, n) < old {
				moved = true
				if bestLabel == next {
					next++
				}
			} else {
				cl[i] = save
			}
		}
		if !moved {
			break
		}
	}
	return cl
}

// bidOf = Σ_{j in cluster} w(i,j) / size^dsmPowBid; an empty cluster bids 0.
func bidOf(sum int64, size int) float64 {
	if size <= 0 {
		return 0
	}
	return float64(sum) / float64(ipow(int64(size), dsmPowBid))
}

// tearCycles finds cluster cycles (Tarjan SCC) and tears the single weakest
// directed cross-edge inside each multi-cluster SCC until the cluster digraph is
// acyclic. It mutates cw (removes torn edges) and returns the tears.
func tearCycles(labels []int, cw map[[2]int]int) []dsmTear {
	var tears []dsmTear
	for {
		sccs := tarjanSCC(labels, cw)
		var big []int
		for _, comp := range sccs {
			if len(comp) > 1 {
				if big == nil || comp[0] < big[0] {
					big = comp
				}
			}
		}
		if big == nil {
			break // acyclic
		}
		inSCC := map[int]bool{}
		for _, c := range big {
			inSCC[c] = true
		}
		// weakest edge internal to the SCC (lowest weight; tiebreak by from,to).
		weakest := [2]int{-1, -1}
		weakestW := 0
		for _, e := range sortedEdgeKeys(cw) {
			if !inSCC[e[0]] || !inSCC[e[1]] {
				continue
			}
			w := cw[e]
			if weakest[0] < 0 || w < weakestW {
				weakest, weakestW = e, w
			}
		}
		if weakest[0] < 0 {
			break // no internal edge (should not happen for a real SCC>1)
		}
		delete(cw, weakest)
		tears = append(tears, dsmTear{From: weakest[0], To: weakest[1], Weight: weakestW})
	}
	return tears
}

// tarjanSCC returns the strongly connected components of the cluster digraph,
// each a sorted label slice, in a deterministic order (by min label).
func tarjanSCC(labels []int, cw map[[2]int]int) [][]int {
	succ := map[int][]int{}
	for _, e := range sortedEdgeKeys(cw) {
		succ[e[0]] = append(succ[e[0]], e[1])
	}
	index := map[int]int{}
	low := map[int]int{}
	onStack := map[int]bool{}
	var stack []int
	idxCtr := 0
	var comps [][]int
	var strong func(v int)
	strong = func(v int) {
		index[v] = idxCtr
		low[v] = idxCtr
		idxCtr++
		stack = append(stack, v)
		onStack[v] = true
		for _, w := range succ[v] {
			if _, seen := index[w]; !seen {
				strong(w)
				if low[w] < low[v] {
					low[v] = low[w]
				}
			} else if onStack[w] {
				if index[w] < low[v] {
					low[v] = index[w]
				}
			}
		}
		if low[v] == index[v] {
			var comp []int
			for {
				w := stack[len(stack)-1]
				stack = stack[:len(stack)-1]
				onStack[w] = false
				comp = append(comp, w)
				if w == v {
					break
				}
			}
			sort.Ints(comp)
			comps = append(comps, comp)
		}
	}
	for _, v := range labels {
		if _, seen := index[v]; !seen {
			strong(v)
		}
	}
	sort.Slice(comps, func(a, b int) bool { return comps[a][0] < comps[b][0] })
	return comps
}

// kahnLayers assigns a layer number to each cluster over the (acyclic) cluster
// digraph: layer 0 = no incoming cluster edge; otherwise max(pred layer)+1
// (longest-path layering), processed in Kahn topological order.
func kahnLayers(labels []int, cw map[[2]int]int) map[int]int {
	succ := map[int][]int{}
	indeg := map[int]int{}
	for _, l := range labels {
		indeg[l] = 0
	}
	for _, e := range sortedEdgeKeys(cw) {
		succ[e[0]] = append(succ[e[0]], e[1])
		indeg[e[1]]++
	}
	layer := map[int]int{}
	var queue []int
	for _, l := range labels {
		if indeg[l] == 0 {
			queue = append(queue, l)
		}
	}
	sort.Ints(queue)
	for len(queue) > 0 {
		c := queue[0]
		queue = queue[1:]
		for _, d := range succ[c] {
			if layer[c]+1 > layer[d] {
				layer[d] = layer[c] + 1
			}
			indeg[d]--
			if indeg[d] == 0 {
				queue = append(queue, d)
				sort.Ints(queue)
			}
		}
	}
	return layer
}

// --- small deterministic helpers ---

func distinctSortedInts(cl []int) []int {
	seen := map[int]bool{}
	var out []int
	for _, c := range cl {
		if !seen[c] {
			seen[c] = true
			out = append(out, c)
		}
	}
	sort.Ints(out)
	return out
}

func sortedKeysI64(m map[int]int64) []int {
	out := make([]int, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Ints(out)
	return out
}

func sortedEdgeKeys(cw map[[2]int]int) [][2]int {
	out := make([][2]int, 0, len(cw))
	for e := range cw {
		out = append(out, e)
	}
	sort.Slice(out, func(a, b int) bool {
		if out[a][0] != out[b][0] {
			return out[a][0] < out[b][0]
		}
		return out[a][1] < out[b][1]
	})
	return out
}

// cmdClusterModel implements `quack cluster <model-id> [--out <file>]`: read the
// design-region coupling from deriveDesignFlow, run the DSM pipeline, and print the
// proposal compared to the model's declared bands.
func cmdClusterModel(args []string) {
	modelID := ""
	for _, a := range args {
		if !strings.HasPrefix(a, "-") {
			modelID = a
			break
		}
	}
	if modelID == "" {
		fmt.Fprintln(os.Stderr, "usage: quack cluster <model-id> [--out <file>]")
		quackExit(2)
		return
	}
	nodes := LoadAll()
	mn, ok := nodes[modelID]
	if !ok || mn.Type != "model" {
		fmt.Fprintln(os.Stderr, "cluster: not a model:", modelID)
		quackExit(2)
		return
	}
	raw, err := os.ReadFile(mn.Path)
	if err != nil {
		fmt.Fprintln(os.Stderr, "cluster:", err)
		quackExit(1)
		return
	}
	declared, _ := extractModelGraph(string(raw))
	consumes, _, _ := deriveDesignFlow()
	res := dsmAnalyze(consumes)
	report := formatClusterReport(modelID, res, declared)

	if out := flagVal(args, "--out"); out != "" {
		if err := os.WriteFile(out, []byte(report), 0o644); err != nil {
			fmt.Fprintln(os.Stderr, "cluster:", err)
			quackExit(1)
			return
		}
		fmt.Println("cluster ->", out)
		return
	}
	fmt.Print(report)
}

// formatClusterReport renders the proposal as text: clusters, layering, tears, and
// the agreement/disagreement against the model's declared bands.
func formatClusterReport(modelID string, res dsmResult, declared modelGraph) string {
	var b strings.Builder
	name := func(di int) string { return fmt.Sprintf("C%d", di+1) }
	bandOf := func(id string) string {
		if e, ok := declared.Elems[id]; ok && e.Layer != "" {
			return e.Layer
		}
		return "(unallocated)"
	}

	fmt.Fprintf(&b, "DSM cluster proposal — %s\n", modelID)
	fmt.Fprintf(&b, "==================================================\n")
	fmt.Fprintf(&b, "Input: %d coupled design regions, %d directed couplings (deriveDesignFlow).\n", res.NodeCount, res.EdgeCount)
	fmt.Fprintf(&b, "Cost function: TotalCost = Σ(intra_w × size^%d) + inter_w × N^%d = %d.\n", dsmPowCC, dsmPowBid, res.TotalCost)
	fmt.Fprintf(&b, "Determinism: id-sorted bid/cost passes + 3 fixed restarts (asc, desc, degree); no RNG.\n")
	fmt.Fprintf(&b, "Degree of connectivity: %.4f (edges / N·(N-1)).\n", res.DoC)
	if res.DoC >= 0.5 {
		fmt.Fprintf(&b, "  WARNING: near-complete graph — everything couples to everything; clustering is\n")
		fmt.Fprintf(&b, "  weak signal here (the model is likely too abstract). See the digest's sanity check.\n")
	} else {
		fmt.Fprintf(&b, "  (sparse — clustering is meaningful.)\n")
	}

	// (a) clusters
	fmt.Fprintf(&b, "\n(a) Clusters (%d):\n", len(res.Clusters))
	for di, mem := range res.Clusters {
		// band histogram + majority
		hist := map[string]int{}
		for _, id := range mem {
			hist[bandOf(id)]++
		}
		fmt.Fprintf(&b, "  %s  [layer %d, %d regions]  bands: %s\n", name(di), res.Layer[di], len(mem), histString(hist))
		fmt.Fprintf(&b, "      %s\n", strings.Join(mem, ", "))
	}

	// (b) layering
	fmt.Fprintf(&b, "\n(b) Layering (cluster order, layer 0 = no incoming cluster edge):\n")
	maxLayer := 0
	for _, l := range res.Layer {
		if l > maxLayer {
			maxLayer = l
		}
	}
	for ly := 0; ly <= maxLayer; ly++ {
		var here []string
		for di := range res.Clusters {
			if res.Layer[di] == ly {
				here = append(here, name(di))
			}
		}
		if len(here) > 0 {
			fmt.Fprintf(&b, "  layer %d: %s\n", ly, strings.Join(here, ", "))
		}
	}

	// (c) tears
	fmt.Fprintf(&b, "\n(c) Tears (residual cyclic couplings, weakest cross-edge torn per cluster cycle): %d\n", len(res.Tears))
	if len(res.Tears) == 0 {
		fmt.Fprintf(&b, "  none — the cluster digraph is acyclic.\n")
	}
	for _, t := range res.Tears {
		fmt.Fprintf(&b, "  %s -> %s  (weight %d region edge(s))\n", name(t.From), name(t.To), t.Weight)
	}

	// (d) comparison to declared bands
	fmt.Fprintf(&b, "\n(d) vs the model's CURRENT bands/themes:\n")
	fmt.Fprintf(&b, "  Declared band order: %s\n", strings.Join(declared.Layers, " > "))

	// mixed clusters (a cluster spanning >1 declared band = a disagreement)
	var mixed []string
	pureBy := map[string][]int{} // band -> display clusters that are pure that band
	for di, mem := range res.Clusters {
		bands := map[string]bool{}
		for _, id := range mem {
			bands[bandOf(id)] = true
		}
		if len(bands) > 1 {
			mixed = append(mixed, name(di))
		} else {
			for bnd := range bands {
				pureBy[bnd] = append(pureBy[bnd], di)
			}
		}
	}
	// bands split across multiple clusters = a disagreement
	bandClusters := map[string]map[int]bool{}
	for di, mem := range res.Clusters {
		for _, id := range mem {
			bnd := bandOf(id)
			if bandClusters[bnd] == nil {
				bandClusters[bnd] = map[int]bool{}
			}
			bandClusters[bnd][di] = true
		}
	}
	var splitBands []string
	for _, bnd := range sortedStrKeys3(bandClusters) {
		if len(bandClusters[bnd]) > 1 {
			splitBands = append(splitBands, fmt.Sprintf("%s (in %d clusters)", bnd, len(bandClusters[bnd])))
		}
	}

	// pairwise agreement: of region pairs the algorithm co-clusters, how many share a band.
	coCluster, coBoth := 0, 0
	for a := 0; a < len(res.Ids); a++ {
		for c := a + 1; c < len(res.Ids); c++ {
			ia, ic := res.Ids[a], res.Ids[c]
			if res.ClusterOf[ia] == res.ClusterOf[ic] {
				coCluster++
				if bandOf(ia) == bandOf(ic) {
					coBoth++
				}
			}
		}
	}
	agree := 0.0
	if coCluster > 0 {
		agree = float64(coBoth) / float64(coCluster)
	}
	fmt.Fprintf(&b, "  Pairwise agreement: %.1f%% of co-clustered region pairs also share a declared band.\n", agree*100)

	fmt.Fprintf(&b, "  Agreements:\n")
	agreed := false
	for _, bnd := range sortedStrKeys2(pureBy) {
		if len(bandClusters[bnd]) == 1 { // band lives in exactly one cluster AND that cluster is pure
			fmt.Fprintf(&b, "    - band %q maps cleanly to one cluster (%s).\n", bnd, name(pureBy[bnd][0]))
			agreed = true
		}
	}
	if !agreed {
		fmt.Fprintf(&b, "    - (none: no declared band maps one-to-one onto a computed cluster.)\n")
	}
	fmt.Fprintf(&b, "  Disagreements:\n")
	if len(mixed) == 0 && len(splitBands) == 0 {
		fmt.Fprintf(&b, "    - (none.)\n")
	}
	if len(mixed) > 0 {
		fmt.Fprintf(&b, "    - mixed clusters (couple regions the bands separate): %s\n", strings.Join(mixed, ", "))
	}
	if len(splitBands) > 0 {
		fmt.Fprintf(&b, "    - split bands (one band spread across clusters): %s\n", strings.Join(splitBands, "; "))
	}
	return b.String()
}

func histString(hist map[string]int) string {
	var parts []string
	for _, k := range sortedStrKeys(hist) {
		parts = append(parts, fmt.Sprintf("%s×%d", k, hist[k]))
	}
	return strings.Join(parts, ", ")
}

func sortedStrKeys(m map[string]int) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func sortedStrKeys2(m map[string][]int) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

func sortedStrKeys3(m map[string]map[int]bool) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	sort.Strings(out)
	return out
}

// enddesign
