// Randomize randomly picked model attribute by a small amount
// linter: ngspicejs-lint
// global: config
"use strict";

function randomize_model(aModel, aAllowedAttributes) {
    // Randomize randomly picked model attribute by a small amount

    // pick random attribute
    var k = Object.keys(aModel)
        .filter((a) => aAllowedAttributes.includes(a))
        .randomItem();

    // change attribute according to config.speed.min/max
    var old = aModel[k].fromEng();
    aModel[k] = old * random_float(config.speed.min, config.speed.max);
    //echo('k', k, ':', old, '-->', aModel[k]);

    // if model is symmetrical and we changed rd or rs, use the same value in the other one as well
    if (config.symmetrical) {
        if (k === 'rd') {
            aModel.rs = aModel[k];
        }
        if (k === 'rs') {
            aModel.rd = aModel[k];
        }
    }

    // can't be a NaN
    if (Number.isNaN(aModel[k])) {
        throw new Exception('Value is NaN for attribute ' + k + ' old=' + old);
    }

    return {
        key: k,
        old: old
    };
}

globalThis.randomize_model = randomize_model;
globalThis.exports = randomize_model;

