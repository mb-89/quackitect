// The refused verb's pure half: the moment the days walk back to, the day count
// read as Number reads it, and the warn rows of the log ranked by fires.
// [[spec/design_output/projection#the-second-target]]
package voice

import (
	"errors"
	"fmt"
	"math"
	"math/big"
	"sort"
	"strconv"
	"strings"
	"time"
)

const (
	lastPlainYear = 9999
	hexBase       = 16
	octalBase     = 8
	binaryBase    = 2
	floatBits     = 64
	plainLeast    = 1e-7
	plainPast     = 1e21
)

// The moment the days walk back from now, as toISOString writes it: the day of the month less the days, truncated, as setUTCDate takes it. Past the range a date holds it fails as toISOString does. [[spec/design_output/projection#the-second-target]]
func SinceOf(now time.Time, days float64) (string, error) {
	day := now.UTC().Day()
	shift := math.Trunc(float64(day)-days) - float64(day)
	ms := float64(now.UnixMilli()) + shift*dayMs
	if math.IsNaN(ms) || math.Abs(ms) > lastMs {
		return "", errInvalidTime
	}
	at := time.UnixMilli(int64(ms)).UTC()
	year := fmt.Sprintf("%04d", at.Year())
	if at.Year() < 0 || at.Year() > lastPlainYear {
		year = fmt.Sprintf("%+07d", at.Year())
	}
	return year + at.Format("-01-02T15:04:05.000Z"), nil
}

// The day count a word asks for, read as Number reads it, where it reads finite and past zero; otherwise the default. [[spec/design_output/projection#the-second-target]]
func DaysOf(said string) float64 {
	if n := jsNumber(said); !math.IsInf(n, 0) && !math.IsNaN(n) && n > 0 {
		return n
	}
	return Days
}

// A word as Number reads it: blank as zero, a radix literal, a decimal, or NaN. [[spec/design_output/projection#the-second-target]]
func jsNumber(said string) float64 {
	flat := jsTrim(said)
	if flat == "" {
		return 0
	}
	if found := radix.FindStringSubmatch(flat); found != nil {
		base := map[string]int{"x": hexBase, "o": octalBase, "b": binaryBase}[strings.ToLower(found[1])]
		n, ok := new(big.Int).SetString(found[2], base)
		if !ok {
			return math.NaN()
		}
		f, _ := new(big.Float).SetInt(n).Float64()
		return f
	}
	if !decimal.MatchString(flat) {
		return math.NaN()
	}
	f, err := strconv.ParseFloat(flat, floatBits)
	if err != nil && !errors.Is(err, strconv.ErrRange) {
		return math.NaN()
	}
	return f
}

// A finite number as String writes it: plain below 1e21 and from 1e-7, an exponent otherwise. [[spec/design_output/projection#the-second-target]]
func numberText(n float64) string {
	if n == 0 || (math.Abs(n) >= plainLeast && math.Abs(n) < plainPast) {
		return strconv.FormatFloat(n, 'f', -1, floatBits)
	}
	mant, exp, _ := strings.Cut(strconv.FormatFloat(n, 'e', -1, floatBits), "e")
	sign, digits := exp[:1], strings.TrimLeft(exp[1:], "0")
	return mant + "e" + sign + digits
}

// The warn rows carrying a rule, at or after since where since names a moment. [[spec/design_output/projection#the-second-target]]
func RefusalsIn(rows []Row, since string) []Row {
	out := []Row{}
	for _, one := range rows {
		if one["level"] != "warn" || !truthy(one["rule"]) {
			continue
		}
		if since == "" || unitsCompare(jsString(one["at"]), since) >= 0 {
			out = append(out, one)
		}
	}
	return out
}

// The refusals ranked by fires, keyed by rule leaf and phrase, the phrase falling back to the tool. [[spec/design_output/projection#the-second-target]]
func RankedRefusals(rows []Row) []Refusal {
	out := []Refusal{}
	at := map[[2]string]int{}
	for _, one := range rows {
		rule := LeafOf(jsString(one["rule"]))
		phrase := jsTrim(jsString(one["phrase"]))
		if phrase == "" {
			phrase = jsTrim(jsString(one["tool"]))
		}
		key := [2]string{rule, phrase}
		if i, ok := at[key]; ok {
			out[i].Fires++
			continue
		}
		at[key] = len(out)
		out = append(out, Refusal{rule, phrase, 1})
	}
	sort.SliceStable(out, func(a, b int) bool {
		if out[a].Fires != out[b].Fires {
			return out[a].Fires > out[b].Fires
		}
		if by := localeCompare(out[a].Rule, out[b].Rule); by != 0 {
			return by < 0
		}
		return localeCompare(out[a].Phrase, out[b].Phrase) < 0
	})
	return out
}
