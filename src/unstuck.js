// Significantly change parameters one by one from current value, then hill climb for a while
// linter: ngspicejs-lint
// global: config, pull_away, hill_climb, simulate
"use strict";

function unstuck(aModel, aMeasuredData, aAllowedParams, aPullPercent, aAttempts, aGainLimit, aQuiet) {
    // Significantly change parameters one by one from current value, then hill climb for a while
    var orig_score = simulate(aModel, aMeasuredData, false);
    var params = aAllowedParams.union(Object.keys(aModel)).shuffle();
    var i;
    // do it for all params one by one
    for (i = 0; i < params.length; i++) {
        var k = params[i];
        var o, best;

        // increase one parameter to worsen the score by 200%
        o = pull_away(aModel, aMeasuredData, k, orig_score.score, aPullPercent);
        if (o) {
            // optimize it to get back (or better) then before the pull
            best = hill_climb(o, aMeasuredData, aAllowedParams, aAttempts, aGainLimit, aQuiet);
            // save result of a pull and hill climb
            echo('  inc. param ' + k + ' unstuck score ' + best.score.toEng(3));
            //echo('// score ' + best.score.toEng(3) + ' ' + JSON.stringify(best.model));
            if (best.score < orig_score.score) {
                return {score: best.score, model: best.model};
            }
            if (ctrl_c_pressed()) {
                return {score: 999};
            }
        }

        // decrease one parameter to worsen the score by 200%
        o = pull_away(aModel, aMeasuredData, k, orig_score.score, -aPullPercent);
        if (o) {
            // optimize it to get back (or better) then before the pull
            best = hill_climb(o, aMeasuredData, aAllowedParams, aAttempts, aGainLimit, aQuiet);
            // save result of a pull and hill climb
            echo('  dec. param ' + k + ' unstuck score ' + best.score.toEng(3));
            //echo('// score ' + best.score.toEng(3) + ' ' + JSON.stringify(best.model));
            if (best.score < orig_score.score) {
                return {score: best.score, model: best.model};
            }
            if (ctrl_c_pressed()) {
                return {score: 999};
            }
        }
    }

    // nothing improved, return original
    echo('Unstuck unsuccessfull');
    return {score: orig_score.score, model: aModel};
}

globalThis.unstuck = unstuck;
globalThis.exports = unstuck;

