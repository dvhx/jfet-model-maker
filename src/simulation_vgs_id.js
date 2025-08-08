// Simulate transistor model and measure VGS:ID at constant Vbat
// linter: ngspicejs-lint
// global: normalized_score
"use strict";

function simulation_vgs_id(aModelObject, aMeasuredData) {
    // Simulate transistor model and measure VGS:ID at constant Vbat
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
    if (!Array.isArray(aMeasuredData.vgs)) {
        throw new Exception('Measured data must contain vgs (array)');
    }
    if (!Array.isArray(aMeasuredData.id)) {
        throw new Exception('Measured data must contain id (array)');
    }
    if (!['JFET_N', 'JFET_P'].includes(config.kind)) {
        throw new Exception('Model object kind is ' + aModelObject.kind + ' but allowed are only JFET_N or JFET_P');
    }

    // clone model
    var o = JSON.parse(JSON.stringify(aModelObject));
    o.name = 'MOD1';

    // Id vs Vgs (measures Vto and Idss)
    netlist_clear();
    battery('U1', 5, 0, aModelObject.kind === 'JFET_N' ? 9 : -9).rs(10);
    ammeter('A1', 5, 4);
    resistor('R1', 4, 3, 220);
    jfet_model(o);
    if (aModelObject.kind === 'JFET_N') {
        jfet_n('T1', 3, 'g', 0, o.name); // normal
    } else {
        jfet_p('T1', 3, 'g', 0, o.name); // normal
    }
    pwl('U2', 'g1', 0).shape([[0, aMeasuredData.vgs[0]], [0.020, aMeasuredData.vgs.at(-1)]]);
    resistor('R2', 'g1', 'g', 2); // 2ohm gate resistor to prevent "timestep too small" error
    resistor('R3', 'g', 0, '1M'); // protection 1M gate to ground

    // transient
    var t = tran().run();
    t.dispose();

    if (!t.data) {
        return;
    }

    // score
    var score = normalized_score(aMeasuredData.vgs, aMeasuredData.id, t.data['V(g)'], t.data['I(A1)'], aMeasuredData.score_max_vgs);

    return {
        vbat: aMeasuredData.vbat,
        temperature: aMeasuredData.temperature,
        sim_x: t.data['V(g)'],
        sim_y: t.data['I(A1)'],
        real_x: aMeasuredData.vgs,
        real_y: aMeasuredData.id,
        param: 'Vbat=' + aMeasuredData.vbat.toEng() + 'V',    // distinguishing parameter?
        score: score.score,
        score_max_vgs: aMeasuredData.score_max_vgs
    };
}

globalThis.simulation_vgs_id = simulation_vgs_id;
globalThis.exports = simulation_vgs_id;


