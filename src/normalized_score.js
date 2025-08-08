// Calculate score (least squares difference between measured and simulated, smaller is better)
// linter: ngspicejs-lint
"use strict";

function normalized_score(aMeasuredX, aMeasuredY, aSimX, aSimY, aMaxX) {
    // Calculate score (least squares difference between measured and simulated, smaller is better)
    var l;

    // remove null and NaN from simulation outputs (it seems to occasionaly have gaps)
    var sim_x = aSimX.filter(Number.isFinite);
    var sim_y = aSimY.filter(Number.isFinite);
    Internal.assert_array_same_length(sim_x, sim_y, 'normalizeScore(...) - After removing null/NaN from simulated data x and y data are not the same length!');

    // lerp x values must be rising, but P-channel may have them falling
    if (sim_x[0] > sim_x.at(-1)) {
        l = lerp(sim_x.reverse(), sim_y.reverse());
    } else {
        l = lerp(sim_x, sim_y);
    }

    // find range for normalization
    //var h = Math.max(aMeasuredY.range(), sim_y.range());
    // sum squares
    var err = 0;
    var oldx = aMeasuredX[0];
    for (var i = 0; i < aMeasuredX.length; i++) {
        if (aMeasuredX[i] > aMaxX) {
            //echo('break after', i,  aMeasuredX.length, aMeasuredX[i], aMaxX);
            break;
        }
        var y = l.get(aMeasuredX[i]);
        var dy = aMeasuredY[i] - y;
        var dx = aMeasuredX[i] * oldx;
        oldx = aMeasuredX[i];
        // normalize to max current?
        // I decided not to normalize for Id to keep errors comparable (i.e. surface area on charts)
        // d /= h;
        // square
        err += Math.abs(dx) * Math.abs(dy);
        //echo('i', i, 'mx', aMeasuredX[i], 'my', aMeasuredY[i], 'y', y, 'dy', dy, 'dx', dx, 'err', err);
    }
    //err = Math.sqrt(err);
    // divide by number of items so that measurements with more data don't have higher score
    err /= aMeasuredX.length;
    return {
        score: err,
        real_x: aMeasuredX,
        real_y: aMeasuredY,
        sim_x,
        sim_y
    };
}

globalThis.normalized_score = normalized_score;
globalThis.exports = normalized_score;

