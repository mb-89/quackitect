"""Paired statistics for the benchmark, standard library only.

Every comparison pairs arms on the same task. With several seeds, a task's value is the mean
over its seeds, and the task is the unit of resampling (cluster bootstrap).
"""
import math
import random


def mean(xs):
    return sum(xs) / len(xs) if xs else float("nan")


def median(xs):
    s = sorted(xs)
    n = len(s)
    if not n:
        return float("nan")
    return s[n // 2] if n % 2 else (s[n // 2 - 1] + s[n // 2]) / 2


def sd(xs):
    if len(xs) < 2:
        return float("nan")
    m = mean(xs)
    return math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))


def bootstrap_ci(diffs, stat=mean, reps=10000, alpha=0.05, seed=1):
    """Percentile CI of stat over tasks, resampling tasks with replacement."""
    if not diffs:
        return (float("nan"), float("nan"))
    rng = random.Random(seed)
    n = len(diffs)
    vals = sorted(stat([diffs[rng.randrange(n)] for _ in range(n)]) for _ in range(reps))
    lo = vals[int(alpha / 2 * reps)]
    hi = vals[min(reps - 1, int((1 - alpha / 2) * reps))]
    return lo, hi


def sign_flip_p(diffs, reps=20000, seed=2):
    """Two-sided paired permutation test of mean(diff) = 0 (random sign flips per task)."""
    d = [x for x in diffs if x == x]
    if not d:
        return float("nan")
    obs = abs(mean(d))
    if obs == 0:
        return 1.0
    rng = random.Random(seed)
    n = len(d)
    if n <= 16:  # exact
        hits = 0
        for mask in range(1 << n):
            s = sum(x if (mask >> i) & 1 else -x for i, x in enumerate(d))
            if abs(s / n) >= obs - 1e-12:
                hits += 1
        return hits / (1 << n)
    hits = sum(1 for _ in range(reps) if abs(mean([x if rng.random() < 0.5 else -x for x in d])) >= obs - 1e-12)
    return (hits + 1) / (reps + 1)


def binom_two_sided(k, n):
    """Exact two-sided binomial p at p=0.5 (McNemar's exact test on discordant pairs)."""
    if n == 0:
        return 1.0
    k = min(k, n - k)
    tail = sum(math.comb(n, i) for i in range(0, k + 1)) / 2 ** n
    return min(1.0, 2 * tail)


def mcnemar(pairs):
    """pairs: list of (a_pass, b_pass) booleans. -> (b_only, a_only, p)"""
    a_only = sum(1 for a, b in pairs if a and not b)
    b_only = sum(1 for a, b in pairs if b and not a)
    return b_only, a_only, binom_two_sided(b_only, a_only + b_only)


Z = {0.05: 1.959964, 0.8: 0.841621, 0.9: 1.281552}


def mde_paired_binary(n, p_discordant, alpha=0.05, power=0.8):
    """Smallest difference in pass rate a McNemar test detects with n paired tasks
    (Connor 1987 approximation), given the share of discordant pairs."""
    if n <= 0 or p_discordant <= 0:
        return float("nan")
    za, zb = Z[alpha], Z[power]
    # solve n = (za*sqrt(pd) + zb*sqrt(pd - d^2))^2 / d^2 for d by bisection
    lo, hi = 1e-4, min(1.0, math.sqrt(p_discordant)) - 1e-6
    for _ in range(100):
        d = (lo + hi) / 2
        need = (za * math.sqrt(p_discordant) + zb * math.sqrt(max(p_discordant - d * d, 0))) ** 2 / (d * d)
        if need > n:
            lo = d
        else:
            hi = d
    return hi


def n_for_paired_binary(delta, p_discordant, alpha=0.05, power=0.8):
    za, zb = Z[alpha], Z[power]
    if delta <= 0 or p_discordant < delta * delta:
        return float("nan")
    return math.ceil((za * math.sqrt(p_discordant) + zb * math.sqrt(p_discordant - delta * delta)) ** 2 / delta ** 2)


def mde_paired_continuous(n, sd_diff, alpha=0.05, power=0.8):
    """Smallest mean paired difference (e.g. of log cost) a paired test detects with n tasks."""
    if n <= 1 or sd_diff != sd_diff:
        return float("nan")
    return (Z[alpha] + Z[power]) * sd_diff / math.sqrt(n)
