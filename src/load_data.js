// Load csv and convert data columns to arrays, scalars as simple variables, check stuff
// linter: ngspicejs-lint
// global: check_data_vgs_id, check_data_vds_id
"use strict";

function load_data(aCsvFileName, aKind) {
    // Load csv and convert data columns to arrays, scalars as simple variables, check stuff
    Internal.assert_arguments_length(arguments, 2, 2, 'load_data(csv_filename,kind)');
    Internal.assert_enum(aKind, ['JFET_N', 'JFET_P'], 'kind', 'load_data(csv_filename,kind)');
    var prefix = "In file '" + aCsvFileName + "' ";
    var csv = file_read_csv(aCsvFileName);
    var ret = {};
    csv[0].forEach((n) => {
        var col = csv[0].indexOf(n);
        if (col < 0) {
            hint('Available columns are: ' + csv[0]);
            throw new Exception(prefix + "has no column '" + n + "'");
        }
        // arrays
        ret[n] = csv.column(col, 1)
            .filter((a) => a !== '' && a !== undefined)
            .map((a) => (n === 'kind' || n === 'method' || n === 'chart_name' || n === 'series_name') ? a : a.fromEng());
        // scalar?
        if (ret[n].length === 1) {
            ret[n] = ret[n][0];
        }
    });

    // check supported simulation method
    var allowed_methods = ['vgs_id', 'vds_id', 'vgd_is', 'vsd_is', 'dc_jig'];
    if (!allowed_methods.includes(ret.method)) {
        throw new Exception(prefix + "method has invalid value '" + ret.method + "', allowed methods are: " + allowed_methods.join(', '));
    }
    // check voltmeter range
    if (ret.rvoltmeter < 100000 || ret.rvoltmeter > 1e9) {
        warn(prefix + 'rvoltmeter has unusual value: ' + ret.rvoltmeter);
    }
    // check temperature
    if (ret.temperature < 10 || ret.temperature > 35) {
        warn(prefix + 'temperature has unusual value: ' + ret.temperature);
    }

    // check Vgs-Id characteristic
    var c;
    if (ret.method === 'vgs_id') {
        c = check_data_vgs_id(ret.vgs, ret.id, aCsvFileName, aKind);
        ret.label_x = 'Vgs/V';
        ret.label_y = 'Id/A';
        ret.x = ret.vgs;
        ret.y = ret.id;
        ret.vto = c.vto;
        ret.idss = c.idss;
        ret.beta_ideal = c.beta_ideal;
        ret.is_max = c.is_max;
        if (aKind === 'JFET_P' && ret.score_max_vgs < 9) {
            warn("In " + aKind + " don't use score_max_vgs < 9 as Vgs is positive in p-channel JFETs, score_max_vgs=" + ret.score_max_vgs);
        }
    }
    // check Vgd-Is characteristic
    if (ret.method === 'vgd_is') {
        c = check_data_vgs_id(ret.vgd, ret.is, aCsvFileName, aKind);
        ret.label_x = 'Vgd/V';
        ret.label_y = 'Is/A';
        ret.x = ret.vgd;
        ret.y = ret.is;
        ret.vto = c.vto;
        ret.idss = c.idss;
        ret.beta_ideal = c.beta_ideal;
        ret.is_max = c.is_max;
    }
    // check Vds:Id characteristic
    if (ret.method === 'vds_id') {
        ret.label_x = 'Vds/V';
        ret.label_y = 'Id/A';
        ret.x = ret.vds;
        ret.y = ret.id;
        check_data_vds_id(ret.vds, ret.id, ret.vgs, aCsvFileName, aKind);
    }
    // check Vsd:Is characteristic
    if (ret.method === 'vsd_is') {
        ret.label_x = 'Vsd/V';
        ret.label_y = 'Is/A';
        ret.x = ret.vsd;
        ret.y = ret.is;
        check_data_vds_id(ret.vsd, ret.is, ret.vgd, aCsvFileName, aKind);
    }

    ret.unit_x = 'V';
    ret.unit_y = 'A';
    if (ret.method === 'dc_jig') {
        ret.unit_x = 'n/a';
        ret.unit_y = 'n/a';
    }

    return ret;
}

globalThis.load_data = load_data;
globalThis.exports = load_data;

