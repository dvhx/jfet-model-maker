// Check VDS and ID data
// linter: ngspicejs-lint
"use strict";

function check_data_vds_id(aVds, aId, aVgs, aCsvFileName) {
    // Check VDS and ID data
    var prefix = 'In file "' + aCsvFileName + '" ';
    if (!Array.isArray(aVds)) {
        throw new Exception(prefix + 'column vds/vsd must be array');
    }
    if (!Array.isArray(aId)) {
        throw new Exception(prefix + 'column id/is must be array');
    }
    if (aVds.length !== aId.length) {
        throw new Exception(prefix + 'arrays vds/vsd(' + aVds.length + ') and id/is(' + aId.length + ') must be the same length!');
    }
    if (typeof aVgs !== 'number') {
        throw new Exception(prefix + 'vgs/vgd should be a number but is ' + aVgs);
    }
    if (aVds[0] !== 0) {
        throw new Exception(prefix + 'vds/vgd should start at 0 but starts at ' + aVds[0]);
    }
    if (aVds.at(-1) !== 9) {
        throw new Exception(prefix + 'vds/vsd should end at 9 but ends at ' + aVds.at(-1));
    }
    if (aId[0] !== 0) {
        throw new Exception(prefix + 'id/is should start at 0 but starts at ' + aId[0]);
    }
}

globalThis.check_data_vds_id = check_data_vds_id;
globalThis.exports = check_data_vds_id;
