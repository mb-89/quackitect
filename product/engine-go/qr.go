package main

// qr.go — a hand-rolled QR encoder (i0015_mobile_adapter, req-pair-qr). Byte mode,
// ECC level L, versions 1..5 (all SINGLE-BLOCK at L, which keeps the codeword layout
// trivial), fixed mask 0. Zero-dep by law — and by necessity: the encoded payload is
// the pairing CREDENTIAL, so it must never reach an external encoder. The format-info
// bits are COMPUTED (BCH over generator 0x537, XOR 0x5412), never a memorized table.

// design: go-pair-qr  implements: req-pair-qr
// GF(256) arithmetic over the QR polynomial 0x11D drives the Reed-Solomon parity;
// the matrix builder places finders, timing, alignment, the dark module, the two
// format copies, and the zigzag data stream under mask 0. The console render draws
// two modules per character with a quiet zone, the plain link printed beside it.

var qrExp [512]byte
var qrLog [256]int
var qrTablesReady bool

func qrInitTables() {
	if qrTablesReady {
		return
	}
	x := 1
	for i := 0; i < 255; i++ {
		qrExp[i] = byte(x)
		qrLog[x] = i
		x <<= 1
		if x >= 256 {
			x ^= 0x11D
		}
	}
	for i := 255; i < 512; i++ {
		qrExp[i] = qrExp[i-255]
	}
	qrTablesReady = true
}

func qrMul(a, b byte) byte {
	if a == 0 || b == 0 {
		return 0
	}
	return qrExp[qrLog[a]+qrLog[b]]
}

// qrRS returns necc Reed-Solomon parity bytes for data.
func qrRS(data []byte, necc int) []byte {
	qrInitTables()
	gen := []byte{1}
	for i := 0; i < necc; i++ {
		next := make([]byte, len(gen)+1)
		for j, g := range gen {
			next[j] ^= qrMul(g, qrExp[i])
			next[j+1] ^= g
		}
		gen = next
	}
	rem := make([]byte, necc)
	for _, d := range data {
		factor := d ^ rem[0]
		copy(rem, rem[1:])
		rem[necc-1] = 0
		if factor != 0 {
			for j := 0; j < necc; j++ {
				rem[j] ^= qrMul(gen[len(gen)-2-j], factor)
			}
		}
	}
	return rem
}

// single-block capacities at ECC L, versions 1..5
var qrDataCW = []int{19, 34, 55, 80, 108}
var qrEccCW = []int{7, 10, 15, 20, 26}
var qrAlign = []int{0, 18, 22, 26, 30} // the second alignment center per version (v1 none)

// qrMatrix encodes s (byte mode, ECC L, mask 0) and returns the module matrix.
func qrMatrix(s string) [][]bool {
	payload := []byte(s)
	ver := 0
	for v := 0; v < len(qrDataCW); v++ {
		if len(payload) <= qrDataCW[v]-2 { // mode nibble + 8-bit count + terminator fit
			ver = v + 1
			break
		}
	}
	if ver == 0 {
		return nil // too long for v5-L
	}
	n := 17 + 4*ver
	dataCW, eccCW := qrDataCW[ver-1], qrEccCW[ver-1]

	// --- the data bit stream: mode 0100, count(8), bytes, terminator, pads ---
	var bits []bool
	putBits := func(v, cnt int) {
		for i := cnt - 1; i >= 0; i-- {
			bits = append(bits, (v>>i)&1 == 1)
		}
	}
	putBits(0b0100, 4)
	putBits(len(payload), 8)
	for _, b := range payload {
		putBits(int(b), 8)
	}
	// terminator (up to 4 zero bits), then pad to a byte boundary
	for i := 0; i < 4 && len(bits) < dataCW*8; i++ {
		bits = append(bits, false)
	}
	for len(bits)%8 != 0 {
		bits = append(bits, false)
	}
	// pad bytes 0xEC / 0x11 alternating
	for pad := 0; len(bits) < dataCW*8; pad++ {
		if pad%2 == 0 {
			putBits(0xEC, 8)
		} else {
			putBits(0x11, 8)
		}
	}
	cw := make([]byte, dataCW)
	for i := range cw {
		for j := 0; j < 8; j++ {
			if bits[i*8+j] {
				cw[i] |= 1 << (7 - j)
			}
		}
	}
	all := append(append([]byte{}, cw...), qrRS(cw, eccCW)...)

	// --- the matrix: function patterns first ---
	m := make([][]bool, n)
	used := make([][]bool, n) // function-module map (data never lands there)
	for i := range m {
		m[i] = make([]bool, n)
		used[i] = make([]bool, n)
	}
	setF := func(r, c int, v bool) {
		if r >= 0 && r < n && c >= 0 && c < n {
			m[r][c] = v
			used[r][c] = true
		}
	}
	finder := func(r0, c0 int) {
		for dr := -1; dr <= 7; dr++ {
			for dc := -1; dc <= 7; dc++ {
				r, c := r0+dr, c0+dc
				if r < 0 || r >= n || c < 0 || c >= n {
					continue
				}
				edge := dr == 0 || dr == 6 || dc == 0 || dc == 6
				core := dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
				inside := dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6
				setF(r, c, inside && (edge || core))
			}
		}
	}
	finder(0, 0)
	finder(0, n-7)
	finder(n-7, 0)
	for i := 8; i < n-8; i++ { // timing
		setF(6, i, i%2 == 0)
		setF(i, 6, i%2 == 0)
	}
	if a := qrAlign[ver-1]; a > 0 { // one alignment pattern (v2..v5)
		for dr := -2; dr <= 2; dr++ {
			for dc := -2; dc <= 2; dc++ {
				edge := dr == -2 || dr == 2 || dc == -2 || dc == 2
				setF(a+dr, a+dc, edge || (dr == 0 && dc == 0))
			}
		}
	}
	setF(4*ver+9, 8, true) // the dark module
	// reserve the two format-info areas (values written after masking)
	for i := 0; i <= 8; i++ {
		if i != 6 {
			used[8][i] = true
			used[i][8] = true
		}
	}
	for i := 0; i < 8; i++ {
		used[8][n-1-i] = true
		used[n-1-i][8] = true
	}

	// --- zigzag placement under mask 0 ((r+c)%2==0 flips) ---
	bitAt := func(i int) bool {
		if i >= len(all)*8 {
			return false // remainder bits are zero
		}
		return (all[i/8]>>(7-i%8))&1 == 1
	}
	idx := 0
	col := n - 1
	upward := true
	for col > 0 {
		if col == 6 {
			col-- // the timing column is skipped whole
		}
		for step := 0; step < n; step++ {
			r := step
			if upward {
				r = n - 1 - step
			}
			for _, c := range []int{col, col - 1} {
				if used[r][c] {
					continue
				}
				v := bitAt(idx)
				idx++
				if (r+c)%2 == 0 { // mask 0
					v = !v
				}
				m[r][c] = v
			}
		}
		upward = !upward
		col -= 2
	}

	// --- format info: 5 bits (ECC L = 01, mask 000) + BCH(15,5), XOR 0x5412 ---
	format := 0b01000 // L, mask 0
	rem := format << 10
	for i := 14; i >= 10; i-- {
		if rem&(1<<i) != 0 {
			rem ^= 0x537 << (i - 10)
		}
	}
	fbits := ((format << 10) | rem) ^ 0x5412
	getf := func(i int) bool { return (fbits>>(14-i))&1 == 1 }
	// copy 1: around the top-left finder
	fi := 0
	for i := 0; i <= 5; i++ {
		m[8][i] = getf(fi)
		fi++
	}
	m[8][7] = getf(fi)
	fi++
	m[8][8] = getf(fi)
	fi++
	m[7][8] = getf(fi)
	fi++
	for i := 5; i >= 0; i-- {
		m[i][8] = getf(fi)
		fi++
	}
	// copy 2: below the top-right finder and beside the bottom-left one
	fi = 0
	for i := 0; i < 7; i++ {
		m[n-1-i][8] = getf(fi)
		fi++
	}
	for i := 0; i < 8; i++ {
		m[8][n-8+i] = getf(fi)
		fi++
	}
	return m
}

// qrRender draws the matrix for a console: two chars per module, a quiet zone around.
func qrRender(m [][]bool) string {
	if m == nil {
		return ""
	}
	n := len(m)
	quiet := 2
	var b []byte
	row := func(cells func(c int) bool) {
		for c := -quiet; c < n+quiet; c++ {
			dark := c >= 0 && c < n && cells(c)
			if dark {
				b = append(b, []byte("██")...)
			} else {
				b = append(b, []byte("  ")...)
			}
		}
		b = append(b, '\n')
	}
	for q := 0; q < quiet; q++ {
		row(func(int) bool { return false })
	}
	for r := 0; r < n; r++ {
		rr := r
		row(func(c int) bool { return m[rr][c] })
	}
	for q := 0; q < quiet; q++ {
		row(func(int) bool { return false })
	}
	return string(b)
}

// enddesign
