// Change one parameter of the model so much that the score become worse by aPercent amount from the original score
// linter: ngspicejs-lint
// global: config, simulate
"use strict";

function pull_away(aModel, aMeasuredData, aParam, aOrigScore, aPercent) {
    // Change one parameter of the model so much that the score become worse by aPercent amount from the original score
    echo_raw('Pulling param ' + aParam + ': ');
    echo_flush();
    var old = aModel[aParam];
    var p = JSON.parse(JSON.stringify(aModel));
    var s = aOrigScore;
    var r = 1.001;
    var last = [1,2,3,4,5,6,7,8,9,10];
    var reason = 'ok';
    var iter = 0;
    while (Math.abs((s - aOrigScore) / aOrigScore) < Math.abs(aPercent) / 100) {
        echo_progress();
        if (aPercent > 0) {
            p[aParam] *= r;
        } else {
            p[aParam] /= r;
        }
        if (p[aParam] < config.constraints[aParam].min) {
            p[aParam] = config.constraints[aParam].min;
            reason = 'min constraint';
            break;
        }
        if (p[aParam] > config.constraints[aParam].max) {
            p[aParam] = config.constraints[aParam].max;
            reason = 'max constraint';
            break;
        }
        s = simulate(p, aMeasuredData, false).score;
        //echo('  s', s, aOrigScore, aParam, p[aParam]);

        // if 5 out of last 10 values are the same stop
        last.push(s);
        last.shift();
        if (last.unique().length < 5) {
            //echo('score got stuck');
            reason = 'stuck';
            break;
        }

        // gradually increase pull speed
        iter++;
        if (iter % 5 === 0) {
            r *= r;
        }
    }
    if (old === p[aParam]) {
        echo('pull', aParam, 'not changed', old);
        return;
    }
    echo('from', old, 'to', p[aParam], 'change', (Math.abs((s - aOrigScore) / aOrigScore) * 100).toFixed(1) + '% (' + reason + ')');
    return p;
}

globalThis.pull_away = pull_away;
globalThis.exports = pull_away;

