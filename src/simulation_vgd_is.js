// Simulate transistor model and measure VGD:IS at constant Vbat (same as VGS:ID but transistor is swapped)
// linter: ngspicejs-lint
// global: normalized_score
"use strict";

function simulation_vgd_is(aModelObject, aMeasuredData) {
    // Simulate transistor model and measure VGD:IS at constant Vbat (same as VGS:ID but transistor is swapped)
    Internal.assert_arguments_length(arguments, 2, 2, 'simulation_vgs_id(model,data)');
    if (typeof aMeasuredData.vbat !== 'number') {
        throw new Exception('Measured data must contain vbat (number)');
    }
    if (typeof aMeasuredData.rvoltmeter !== 'number') {
        throw new Exception('Measured data must contain rvoltmeter (number)');
    }
    if (typeof aMeasuredData.temperature !== 'number') {
        throw new Exception('Measured data must contain temperature (number)');
    }
    if (!Array.isArray(aMeasuredData.vgd)) {
        throw new Exception('Measured data must contain vgd (array)');
    }
    if (!Array.isArray(aMeasuredData.is)) {
        throw new Exception('Measured data must contain is (array)');
    }

    // clone model
    var o = JSON.parse(JSON.stringify(aModelObject));
    o.name = 'MOD1';

    // Is vs Vgd (measures Vto and Idss)
    netlist_clear();
    battery('U1', 5, 0, 9).rs(10);
    ammeter('A1', 5, 4);
    resistor('R1', 4, 3, 220);
    jfet_model(o);
    jfet_n('T1', 0, 'g', 3, o.name); // drain and source swapped
    pwl('U2', 'g1', 0).shape([[0, aMeasuredData.vgd[0]], [0.020, aMeasuredData.vgd.at(-1)]]);
    resistor('R2', 'g1', 'g', 2); // 2ohm gate resistor to prevent "timestep too small" error
    resistor('R3', 'g', 0, '1M'); // protection 1M gate to ground

    // transient
    var t = tran().run();
    t.dispose();
    if (!t.data) {
        return;
    }

    // score
    var score = normalized_score(aMeasuredData.vgd, aMeasuredData.is, t.data['V(g)'], t.data['I(A1)'], aMeasuredData.score_max_vgs);
    //echo('score', score.score);

    return {
        vbat: aMeasuredData.vbat,
        temperature: aMeasuredData.temperature,
        sim_x: t.data['V(g)'],
        sim_y: t.data['I(A1)'],
        real_x: aMeasuredData.vgd,
        real_y: aMeasuredData.is,
        param: 'Vbat=' + aMeasuredData.vbat.toEng() + 'V',    // distinguishing parameter?
        score: score.score,
        score_max_vgs: aMeasuredData.score_max_vgs
    };
}

globalThis.simulation_vgd_is = simulation_vgd_is;
globalThis.exports = simulation_vgd_is;



