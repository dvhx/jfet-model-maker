// Simulate all curves, return total score and charts
// linter: ngspicejs-lint
// global: config
"use strict";

function simulate(aModelObject, aMeasuredData, aMakeCharts) {
    // Simulate all curves, return total score and charts
    // Check data and transistor name
    if (aModelObject.name !== config.transistor) {
        warn('Measured data name (' + aModelObject.name + ') and config.transistor (' + config.transistor + ') are different!');
    }
    // count frames
    simulate.frames = simulate.frames || 0;
    simulate.frames++;
    // simulate all curves
    var score = 0, met, c = {}, curves = {}, chart_name, series_name;
    for (var k in aMeasuredData) {
        if (aMeasuredData.hasOwnProperty(k)) {
            // find method
            met = 'simulation_' + aMeasuredData[k].method;
            var fun = globalThis[met];
            if (typeof fun !== 'function') {
                throw new Exception('Cannot find simulation method: ' + met);
            }
            // run simulation
            var s;
            try {
                s = fun(aModelObject, aMeasuredData[k]);
            } catch (ignore) {
                warn('caught:' + ignore);
                s = {score: 999, real_x: [0, 1], real_y: [0, 0], param: '?'};
            }
            if (!s) {
                s = {score: 999, real_x: [0, 1], real_y: [0, 0], param: '?'};
            }

            // add weighted partial score to total score
            score += s.score * aMeasuredData[k].score_weight;

            // add simulated data to charts
            if (aMakeCharts && s.sim_x) {
                chart_name = aMeasuredData[k].chart_name;
                series_name = aMeasuredData[k].series_name;
                c[chart_name] = c[chart_name] || chart_xy()
                    .title(aModelObject.name + ' ' + met)
                    .width(800)
                    .height(402);
                c[chart_name].add_series(s.real_x, s.real_y, 'real ' + series_name);
                c[chart_name].add_series(s.sim_x, s.sim_y, 'sim ' + series_name + ' E' + s.score.toEng(3));
                curves[chart_name] = curves[chart_name] || [];
                curves[chart_name].push({
                    chart_name,
                    series_name,
                    score: s.score,
                    label_x: aMeasuredData[k].label_x,
                    label_y: aMeasuredData[k].label_y,
                    real_x: s.real_x,
                    real_y: s.real_y,
                    real_label: 'real ' + series_name,
                    sim_x: s.sim_x,
                    sim_y: s.sim_y,
                    sim_label: 'sim ' + series_name + ' E' + s.score.toEng(3),
                    title: aModelObject.name + ' (E' + s.score.toEng(3) + ')',
                    method: met
                });
            }
        }
    }

    var ret = {score: score, charts: c, curves};

    // add total score to title of each chart
    if (aMakeCharts) {
        for (k in c) {
            c[k].attr.title += ' E' + score.toEng(3);
        }
        // add function to show all charts
        ret.show = function () {
            if (c.chart1 && (aMeasuredData.kind === 'JFET_N')) {
                // chart 1 doesn't need curve left of vto
                c.chart1.min_x(round_to(aMeasuredData.find(a => a.vto).vto, 1));
            }
            for (var k in c) {
                if (c.hasOwnProperty(k)) {
                    c[k].show();
                }
            }
            return ret;
        };
    }
    return ret;
}

globalThis.simulate = simulate;
globalThis.exports = simulate;
