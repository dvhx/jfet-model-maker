// Load all measured data for one transistor sample (specified in files.json)
// linter: ngspicejs-lint
// global: load_data
"use strict";

function load_all_data(aName, aKind) {
    // Load all measured data for one transistor sample (specified in files.json)
    Internal.assert_arguments_length(arguments, 2, 2, 'load_all_data(name, kind)');
    Internal.assert_enum(aKind, ['JFET_N', 'JFET_P'], 'kind', 'load_all_data(name,kind)');
    var files = file_read_json('data/' + aName + '/files.json');
    if (Array.isArray(files)) {
        throw new Exception('data/' + aName + '/files.json must contain object of csv files and their weights');
    }
    var data = [], o;
    for (var k in files) {
        if (files.hasOwnProperty(k)) {
            //echo(k, files[k]);
            if (!files[k]) {
                continue;
            }
            o = load_data('data/' + aName + '/' + k, aKind);
            o.score_weight = files[k];
            data.push(o);
        }
    }
    // find main Vgs:Id curve and largest and smallest Vds:Id
    var vgs_id = data.find((o) => o.method === 'vgs_id');
    var vds_id = data.filter((o) => o.method === 'vds_id').sort((a, b) => b.vgs - a.vgs);

    // check if vds_id data have all different Vgs
    var chk = vds_id.map(o => o.vgs);
    if (chk.length > 0 && (chk.unique().length !== chk.length)) {
        warn('There are ' + chk.length + ' vds_id data, but only ' + chk.unique().length + ' unique Vgs values (' + chk.join(', ') + '), usually they should all be different, this could be error!');
    }

    // "core curves" are vgs_id and first and last vds_id to keep charts simpler (to draw all charts use "data")
    var core = [vgs_id];
    if (vds_id.length === 1) {
        core.push(vds_id[0]);
    }
    if (vds_id.length > 1) {
        core.push(vds_id[0]);
        core.push(vds_id.at(-1));
    }

    return {
        name: aName,
        data,
        vto: vgs_id && vgs_id.vto,
        idss: vgs_id && vgs_id.idss,
        beta_ideal: vgs_id && vgs_id.beta_ideal,
        is_max: vgs_id && vgs_id.is_max,
        vgs_id,
        vds_id,
        core
    };
}

globalThis.load_all_data = load_all_data;
globalThis.exports = load_all_data;

