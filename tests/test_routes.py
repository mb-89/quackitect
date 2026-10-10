import unittest

from harness.routes import parse
from tests.helpers import ROUTES


class RouteTests(unittest.TestCase):
    def test_routes_load(self):
        self.assertEqual(set(ROUTES) >= {"default", "mvp", "trivial"}, True)
        self.assertEqual(ROUTES["default"].names(), ["draft", "design", "test", "implement", "review", "accept", "retro"])
        self.assertEqual(ROUTES["mvp"].first().name, "test")

    def test_unknown_target_refused(self):
        with self.assertRaises(ValueError):
            parse('name="x"\n[[step]]\nname="a"\nowner="agent"\ngate="mechanical"\nrequires=[]\non_pass="nowhere"\non_fail="hold"\n')

    def test_human_step_takes_human_gate(self):
        with self.assertRaises(ValueError):
            parse('name="x"\n[[step]]\nname="a"\nowner="human"\ngate="mechanical"\nrequires=[]\non_pass="done"\non_fail="hold"\n')


if __name__ == "__main__":
    unittest.main()
