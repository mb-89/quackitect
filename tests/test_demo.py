"""The demo is also the end-to-end test: real CLI, real hooks, real git, real tests, HTTP owner."""
import importlib.util
import os
import shutil
import subprocess
import tempfile
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class TestDemo(unittest.TestCase):
    def test_demo_runs_to_completion(self):
        spec = importlib.util.spec_from_file_location("run_demo", os.path.join(ROOT, "demo", "run_demo.py"))
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        out = tempfile.mkdtemp(prefix="hx-demo-")
        old = os.environ.get("HX_NOW")
        try:
            res = mod.main(os.path.join(out, "work"), os.path.join(out, "t.md"))
            types = res["by_type"]
            self.assertEqual(types["expire"], 1, "the crashed worker was detected")
            self.assertEqual(types["land"], 4, "three landings plus one conflict")
            self.assertEqual(res["owner_decisions"], 3)
            self.assertEqual(res["rejections"], 2)
            self.assertEqual(res["denials"], 5)
            log = subprocess.run(["git", "log", "--oneline", "--first-parent", "main"],
                                 cwd=os.path.join(out, "work", "origin.git"), capture_output=True, text=True).stdout
            self.assertEqual(len(log.splitlines()), 4)
            with open(os.path.join(out, "t.md")) as f:
                text = f.read()
            for needle in ("HANDOVER: previous holder w-b", "LEASE_LOST", "land T-2 FAILED: merge conflict",
                           "BLOCK (Claude must continue)", "is FROZEN since red@", "G-1 is done."):
                self.assertIn(needle, text)
        finally:
            if old is None:
                os.environ.pop("HX_NOW", None)
            else:
                os.environ["HX_NOW"] = old
            shutil.rmtree(out, ignore_errors=True)


if __name__ == "__main__":
    unittest.main()
