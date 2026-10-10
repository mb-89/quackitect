import csv


class Inventory:
    def __init__(self):
        self.items = {}
        self.history = []

    @staticmethod
    def _qty(q):
        if type(q) is not int or q <= 0:
            raise ValueError(f"bad quantity {q!r}")

    def add(self, sku, qty, name=None):
        self._qty(qty)
        k = sku.upper()
        if k not in self.items:
            if not name:
                raise ValueError("first add needs a name")
            self.items[k] = [name, 0]
        elif name is not None and name != self.items[k][0]:
            raise ValueError("name differs")
        self.items[k][1] += qty
        self.history.append(("add", k, qty))

    def remove(self, sku, qty):
        self._qty(qty)
        k = sku.upper()
        if k not in self.items:
            raise KeyError(k)
        if qty > self.items[k][1]:
            raise ValueError("not enough stock")
        self.items[k][1] -= qty
        self.history.append(("remove", k, qty))

    def stock(self, sku):
        return self.items[sku.upper()][1]

    def report(self):
        return [f"{k}\t{n}\t{q}" for k, (n, q) in sorted(self.items.items())]

    def low(self, threshold):
        return sorted(k for k, (_, q) in self.items.items() if q < threshold)

    def save(self, path):
        with open(path, "w", newline="") as f:
            w = csv.writer(f)
            w.writerow(["sku", "name", "qty"])
            for k, (n, q) in sorted(self.items.items()):
                w.writerow([k, n, q])

    @classmethod
    def load(cls, path):
        inv = cls()
        with open(path, newline="") as f:
            for row in csv.DictReader(f):
                inv.items[row["sku"]] = [row["name"], int(row["qty"])]
        return inv
