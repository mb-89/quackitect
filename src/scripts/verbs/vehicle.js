// The vehicle verb: this vehicle, the project it drives, and a vehicle made elsewhere.
// [[spec/design_output/vehicle#what-a-vehicle-needs]]

import { verbMain } from "../verb-run.js";
import { theVehicle } from "../vehicle-verb.js";

export const run = async (words) => theVehicle(words);

await verbMain(import.meta.url, run);
