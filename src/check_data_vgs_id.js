// Check VGS and ID data and calculate vto, idss, beta_ideal, is_max
// linter: ngspicejs-lint
"use strict";

function check_data_vgs_id(aVgs, aId, aCsvFileName, aKind) {
    // Check VGS and ID data and calculate vto, idss, beta_ideal, is_max
    Internal.assert_arguments_length(arguments, 4, 4, 'check_data_vgs_id(vgs,id,filename,kind)');
    Internal.assert_enum(aKind, ['JFET_N', 'JFET_P'], 'kind', 'check_data_vgs_id(vgs,id,filename,kind)');
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
    if (aKind === 'JFET_N') {
        for (let i = 0; i < aVgs.length; i++) {
            if (aId[i] > 0) {
                vto = aVgs[i];
                break;
            }
        }
        if (vto < -20 || vto >= 0) {
            warn(prefix + 'calculated VTO has unusual value ' + vto + ' (for ' + aKind + ')');
        }
    }
    // calculate vto for P (vgs when current drops below 1uA)
    if (aKind === 'JFET_P') {
        for (let i = 0; i < aVgs.length; i++) {
            if (aId[i] >= -1e-6) {
                vto = aVgs[i];
                break;
            }
        }
        if (vto <= 0 || vto >= 20) {
            warn(prefix + 'calculated VTO has unusual value ' + vto + ' (for ' + aKind + ')');
        }
    }

    // calculate idss
    hint('CSV filename is ' + aCsvFileName);
    var l = lerp(aVgs, aId);
    idss = l.get(0);
    if (aKind === 'JFET_N' && (idss < 1e-6 || vto >= 0.5)) {
        warn(prefix + 'calculated IDSS has unusual value ' + idss + ' (for ' + aKind + ')');
    }
    if (aKind === 'JFET_P' && idss > -1e-6) {
        warn(prefix + 'calculated IDSS has unusual value ' + idss + ' (for ' + aKind + ')');
    }
    echo('vto', vto);
    echo('idss', idss.toEng(3));
    // calculate ideal beta
    beta_ideal = idss / (vto * vto);
    echo('beta_ideal', beta_ideal.toEng(3));
    // calculate smallest non-zero IS
    if (aKind === 'JFET_N') {
        is_max = aId.filter((i) => i > 0)[0];
    }
    if (aKind === 'JFET_P') {
        is_max = aId.filter((i) => i < 0).sortNumerically()[0];
    }
    echo('is_max', is_max);
    if (is_max > 1e-6) {
        warn(prefix + 'non-zero drain current starts at ' + is_max + ' it should start at 1uA (or less) for optimal accuracy');
    }
    // drain current should start at zero
    if ((aKind === 'JFET_N') && (aId[0] !== 0)) {
        warn(prefix + 'drain current should start at 0 but is ' + aId[0]);
    }
    if ((aKind === 'JFET_P') && (aId.at(-1) !== 0)) {
        warn(prefix + 'drain current should end at 0 but is ' + aId.at(-1));
    }
    // vgs should contain zero
    if (!aVgs.includes(0)) {
        warn(prefix + 'vgs should contain 0 to measure idss more accurately');
    }
    return {vto, idss, beta_ideal, is_max};
}

globalThis.check_data_vgs_id = check_data_vgs_id;
globalThis.exports = check_data_vgs_id;

