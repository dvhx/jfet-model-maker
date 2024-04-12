// Improve model using hill climbing
// linter: ngspicejs-lint
// global: randomize_model, simulate, constraint_model, config
"use strict";

function hill_climb(aModel, aMeasuredData, aAllowedParams, aAttempts, aGainLimit, aQuiet) {
    // Improve model using hill climbing
    var start_time = script_ms();
    var frames = 0;
    var gains = [];
    if (config.constraints) {
        constraint_model(aModel);
    }
    var best_score = simulate(aModel, aMeasuredData, false).score;
    var i, j, o, s;
    var best = JSON.parse(JSON.stringify(aModel));
    for (j = 0; j < aAttempts; j++) {
        echo_progress();
        frames++;
        // randomize best model
        o = JSON.parse(JSON.stringify(best));
        for (i = 0; i < 3; i++) {
            randomize_model(o, aAllowedParams);
        }
        if (config.constraints) {
            constraint_model(o);
        }
        // simulate it and measure score
        s = simulate(o, aMeasuredData, false);
        if (s.score < best_score) {
            // score improved
            // track last 30 gains to calculate average gain
            gains.push(best_score - s.score);
            if (gains.length > 30) {
                gains.shift();
            }
            if (!aQuiet) {
                echo('  score', s.score.toEng(3), 'gain', gains.avg().toEng(3), 'attempt', j, 'FPS', (simulate.frames / (script_ms() / 1000)).toFixed(0));
            }
            // keep improved score and model
            best_score = s.score;
            best = JSON.parse(JSON.stringify(o));
            // stop after 500 attempts if average gain dropped below limit
            if (j > 500 && gains.avg() < aGainLimit) {
                echo('  stopped after ' + j + ' attempts because average gain dropped below ' + aGainLimit.toEng());
                break;
            }
        }
        // stop if ctrl+c was pressed
        if (ctrl_c_pressed()) {
            break;
        }
    }
    return {
        score: best_score,
        model: best,
        fps: Math.round(frames / ((script_ms() - start_time) / 1000))
    };
}

globalThis.hill_climb = hill_climb;
globalThis.exports = hill_climb;

