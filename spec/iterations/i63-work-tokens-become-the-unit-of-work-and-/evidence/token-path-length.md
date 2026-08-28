---
form: token-path-length
by: agent
signed_off: 2026-08-26T14:22:00.007Z
authors: agent
files: null
---

# Evidence form / token-path-length

## current_situation

The worst path this design can produce was assembled from real parts: the longest record folder standing on trunk, the heaviest method card, and that card's longest marked heading as the file name.

LONGEST RECORD FOLDER 44 characters. Longest item path 163 relative, 203 absolute on this machine. The classic Windows limit is 260, so 57 characters are left.

IT HOLDS, AND THE MARGIN IS THE ANSWER. Fifty-seven characters is about thirteen of extra folder depth before a name stops fitting.

THE LIMIT MEASURED AGAINST IS 260 rather than the long-path one, because long paths need opting in per machine and a design needing a machine setting fails on a machine nobody configured.

## built

- exp-how-much-path-headroom-a-work-item-has

## follow_up

Nothing must be built. The margin is a thing to watch rather than a thing to fix.

WHAT EATS THE MARGIN, so the build knows what to avoid: a checkout nested deeper than this one, a longer user name in the home path, or a record folder longer than 44 characters. Nothing caps that name today.

TWO WAYS TO REMOVE THE WORRY IF IT EVER NEEDS REMOVING. Cap the record folder name, or name an item file by something shorter than its heading and keep the heading inside the file. Neither is chosen here.

WHY THE HOUR WAS THE RIGHT BOX. It fails silently: a path too long reports a file that will not open, on one person's machine, long after the choice was made. Cheap to answer and expensive to discover is what earns a spike whatever its exposure looks like.

## anything_else

