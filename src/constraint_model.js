// Limit model attributes to <min, max> range defined in config.json
// linter: ngspicejs-lint
// global: config
"use strict";

function constraint_model(aModel) {
    // Limit model attributes to <min, max> range defined in config.json
    for (var k in aModel) {
        if (aModel.hasOwnProperty(k)) {
            if (k === 'name' || k === 'kind' || k === 'level') {
                continue;
            }
            if (!config.constraints.hasOwnProperty(k)) {
                throw "Missing config.constraints." + k;
            }
            var c = config.constraints[k];
            // min
            if (aModel[k] < c.min) {
                aModel[k] = c.min;
            }
            // max
            if (aModel[k] > c.max) {
                aModel[k] = c.max;
            }
        }
    }
}

globalThis.constraint_model = constraint_model;
globalThis.exports = constraint_model;

