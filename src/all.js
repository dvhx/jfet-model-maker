// Include all sources
// linter: ngspicejs-lint
"use strict";

// suppress errors (we are simulating random junk, it will be crashing all the time)
Internal.ngspice_process_log.hide_errors = true;

// main config file
globalThis.config = file_read_json('config.json');

// src
globalThis.load_data = include('src/load_data.js');
globalThis.load_all_data = include('src/load_all_data.js');
globalThis.check_ctrl_c = include('src/check_ctrl_c.js');
globalThis.check_data_vds_id = include('src/check_data_vds_id.js');
globalThis.check_data_vgs_id = include('src/check_data_vgs_id.js');
globalThis.simulation_vgs_id = include('src/simulation_vgs_id.js');
globalThis.simulation_vgd_is = include('src/simulation_vgd_is.js');
globalThis.simulation_vds_id = include('src/simulation_vds_id.js');
globalThis.simulation_vsd_is = include('src/simulation_vsd_is.js');
globalThis.simulation_dc_jig = include('src/simulation_dc_jig.js');
globalThis.simulate = include('src/simulate.js');
globalThis.normalized_score = include('src/normalized_score.js');
globalThis.randomize_model = include('src/randomize_model.js');
globalThis.constraint_model = include('src/constraint_model.js');
globalThis.pull_away = include('src/pull_away.js');
globalThis.hill_climb = include('src/hill_climb.js');
globalThis.unstuck = include('src/unstuck.js');

// Disable jfet_model validate function (we will be using config.constraints anyway)
Internal.JfetModel.prototype.validate = function () {
    return;
};

