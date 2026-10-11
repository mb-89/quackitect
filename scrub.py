#!/usr/bin/env python3
"""Refuse to publish a file that carries a secret: run before every push of this folder.

  python3 scrub.py [folder]

It reads the values of the environment's account, organisation, session and token variables
(never printing them) and the git config's user email, and scans every file of the folder,
gzip members included, for each of them and for e-mail-shaped strings outside an allow list.
Exit 1 and the file names on a hit.
"""
import gzip
import os
import re
import subprocess
import sys

SECRET_VARS = ("CLAUDE_CODE_ACCOUNT_UUID", "CLAUDE_CODE_ORGANIZATION_UUID", "CLAUDE_CODE_USER_EMAIL",
               "GH_TOKEN", "GITHUB_TOKEN", "CLAUDE_CODE_MESSAGING_TOKEN", "AWS_SECRET_ACCESS_KEY",
               "AWS_ACCESS_KEY_ID", "CLOUDSDK_AUTH_ACCESS_TOKEN", "CLAUDE_CODE_REMOTE_SESSION_ID",
               "CLAUDE_CODE_SESSION_ID", "CLAUDE_CODE_CONTAINER_ID")
EMAIL = re.compile(rb"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
ALLOWED_EMAIL_DOMAINS = (b"example.invalid", b"example.com", b"users.noreply.github.com")
NOT_EMAIL = (b"git@github.com",)  # an SSH remote, not an address


def needles():
    out = []
    for v in SECRET_VARS:
        x = os.environ.get(v, "")
        if len(x) >= 8:
            out.append((v, x.encode()))
    tf = os.environ.get("CLAUDE_SESSION_INGRESS_TOKEN_FILE")
    if tf and os.path.exists(tf):
        x = open(tf, "rb").read().strip()
        if len(x) >= 8:
            out.append(("ingress token", x))
    em = subprocess.run(["git", "config", "--global", "user.email"], capture_output=True).stdout.strip()
    if em:
        out.append(("git email", em))
    return out


def blobs(path):
    data = open(path, "rb").read()
    yield data
    if path.endswith(".gz"):
        try:
            yield gzip.decompress(data)
        except OSError:
            pass


def redact(root):
    """Replace every e-mail-shaped string outside the allow list with <email>, and every value of
    the secret variables with <redacted:NAME>, in place, in plain and gzip files alike (agents copy
    commit trailers into transcripts, and the repository's own tests print the box's session id)."""
    ns = needles()

    def sub(data):
        for name, x in ns:
            data = data.replace(x, b"<redacted:" + name.replace(" ", "-").encode() + b">")
        return email_sub(data)

    def email_sub(data):
        def one(m):
            dom = m.group(0).split(b"@", 1)[1].lower()
            keep = m.group(0) in NOT_EMAIL or any(dom.endswith(a) for a in ALLOWED_EMAIL_DOMAINS)
            return m.group(0) if keep else b"<email>"
        return EMAIL.sub(one, data)
    n = 0
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in (".git", "__pycache__")]
        for f in fn:
            p = os.path.join(dp, f)
            raw = open(p, "rb").read()
            if p.endswith(".gz"):
                try:
                    data = gzip.decompress(raw)
                except OSError:
                    continue
                new = sub(data)
                if new != data:
                    open(p, "wb").write(gzip.compress(new))
                    n += 1
            elif b"\0" not in raw[:4096]:
                new = sub(raw)
                if new != raw:
                    open(p, "wb").write(new)
                    n += 1
    print(f"redacted e-mail addresses and secret values in {n} files")


def main():
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    root = args[0] if args else os.path.dirname(os.path.abspath(__file__))
    if "--fix" in sys.argv:
        redact(root)
    ns = needles()
    hits = []
    for dp, dn, fn in os.walk(root):
        dn[:] = [d for d in dn if d not in (".git", "__pycache__")]
        for f in fn:
            p = os.path.join(dp, f)
            for data in blobs(p):
                for name, x in ns:
                    if x in data:
                        hits.append((p, name))
                for m in EMAIL.findall(data):
                    dom = m.split(b"@", 1)[1].lower()
                    if m not in NOT_EMAIL and not any(dom.endswith(a) for a in ALLOWED_EMAIL_DOMAINS):
                        hits.append((p, "e-mail address " + m.decode(errors="replace")[:3] + "..."))
    for p, what in sorted(set(hits)):
        print(f"HIT {what}: {os.path.relpath(p, root)}")
    print(f"{len(set(hits))} hits over {root}")
    sys.exit(1 if hits else 0)


if __name__ == "__main__":
    main()
