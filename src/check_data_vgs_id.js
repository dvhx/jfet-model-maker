// Check VGS and ID data and calculate vto, idss, beta_ideal, is_max
// linter: ngspicejs-lint
"use strict";

function check_data_vgs_id(aVgs, aId, aCsvFileName) {
    // Check VGS and ID data and calculate vto, idss, beta_ideal, is_max
    var vto, idss, beta_ideal, is_max;
    var prefix = 'In file "' + aCsvFileName + '" ';
    // check Vgs-Id characteristic
    if (!Array.isArray(aVgs)) {
        throw new Exception(prefix + 'column vgs must be array');
    }
    if (!Array.isArray(aId)) {
        throw new Exception(prefix + 'column id must be array');
    }
    if (aVgs.length !== aId.length) {
        throw new Exception(prefix + 'arrays vgs(' + aVgs.length + ') and id(' + aId.length + ') must be same length!');
    }
    // calculate vto (vgs at first non-zero drain current)
    for (var i = 0; i < aVgs.length; i++) {
        if (aId[i] > 0) {
            vto = aVgs[i];
            break;
        }
    }
    if (vto < -20 || vto >= 0) {
        warn(prefix + 'calculated VTO has unusual value ' + vto);
    }
    // calculate idss
    var l = lerp(aVgs, aId);
    idss = l.get(0);
    if (idss < 1e-6 || vto >= 0.5) {
        warn(prefix + 'calculated IDSS has unusual value ' + idss);
    }
    // calculate ideal beta
    beta_ideal = idss / (vto * vto);
    // calculate smallest non-zero IS
    is_max = aId.filter((i) => i > 0)[0];
    if (is_max > 1e-6) {
        warn(prefix + 'non-zero drain current starts at ' + is_max + ' it should start at 1uA (or less) for optimal accuracy');
    }
    // drain current should start at zero
    if (aId[0] !== 0) {
        warn(prefix + 'drain current should start at 0 but is ' + aId[0]);
    }
    // vgs should contain zero
    if (!aVgs.includes(0)) {
        warn(prefix + 'vgs should contain 0 to measure idss more accurately');
    }
    return {vto, idss, beta_ideal, is_max};
}

globalThis.check_data_vgs_id = check_data_vgs_id;
globalThis.exports = check_data_vgs_id;

