// Calculate score (least squares difference between measured and simulated, smaller is better)
// linter: ngspicejs-lint
"use strict";

function normalized_score(aMeasuredX, aMeasuredY, aSimX, aSimY, aMaxX) {
    // Calculate score (least squares difference between measured and simulated, smaller is better)
    var l = lerp(aSimX, aSimY);
    // find range for normalization
    //var h = Math.max(aMeasuredY.range(), aSimY.range());
    // sum squares
    var err = 0;
    for (var i = 0; i < aMeasuredX.length; i++) {
        if (aMeasuredX[i] > aMaxX) {
            break;
        }
        var y = l.get(aMeasuredX[i]);
        var d = aMeasuredY[i] - y;
        // normalize to max current?
        // I decided not to normalize for Id to keep errors comparable (i.e. surface area on charts)
        // d /= h;
        // square
        err += d * d;
    }
    err = Math.sqrt(err);
    // divide by number of items so that measurements with more data don't have higher score
    err /= aMeasuredX.length;
    return {
        score: err,
        real_x: aMeasuredX,
        real_y: aMeasuredY,
        sim_x: aSimX,
        sim_y: aSimY
    };
}

globalThis.normalized_score = normalized_score;
globalThis.exports = normalized_score;

