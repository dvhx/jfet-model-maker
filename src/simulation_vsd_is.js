// Simulate transistor model and measure VSD:IS at constant VGD, compare with measured data
// linter: ngspicejs-lint
// global: normalized_score
"use strict";

function simulation_vsd_is(aModelObject, aMeasuredData) {
    // Simulate transistor model and measure VSD:IS at constant VGD, compare with measured data
    Internal.assert_arguments_length(arguments, 2, 2, 'simulation_vgs_id(model,data)');
    if (typeof aMeasuredData.vgd !== 'number') {
        throw new Exception('Measured data must contain vgd (number)');
    }
    if (typeof aMeasuredData.rvoltmeter !== 'number') {
        throw new Exception('Measured data must contain rvoltmeter (number)');
    }
    if (typeof aMeasuredData.temperature !== 'number') {
        throw new Exception('Measured data must contain temperature (number)');
    }
    if (!Array.isArray(aMeasuredData.vsd)) {
        throw new Exception('Measured data must contain vsd (array)');
    }
    if (!Array.isArray(aMeasuredData.is)) {
        throw new Exception('Measured data must contain is (array)');
    }

    // clone model
    var o = JSON.parse(JSON.stringify(aModelObject));
    o.name = 'MOD1';

    // netlist
    netlist_clear();
    pwl('U1', 5, 0).shape([[0, 0], [0.020, 9.5]]);
    ammeter('A1', 5, 4);
    resistor('R1', 4, 'd', 220);
    jfet_model(o);
    jfet_n('T1', 0, 'g', 'd', o.name); // drain and source swapped
    resistor('RV', 'd', 0, aMeasuredData.rvoltmeter); // voltmeter input resistance (measure this with second multimeter)
    battery('U2', 'g1', 0, aMeasuredData.vgd);
    resistor('R2', 'g1', 'g', 2); // 2ohm gate resistor to prevent "timestep too small" error
    resistor('R3', 'g', 0, '1M'); // protection 1M gate to ground

    // transient
    var t = tran().run();
    t.dispose();
    if (!t.data) {
        return;
    }

    // score
    var score = normalized_score(aMeasuredData.vsd, aMeasuredData.is, t.data['V(d)'], t.data['I(A1)'], 9999);
    //echo_json(Object.keys(score));

    return {
        vgd: aMeasuredData.vgd,
        temperature: aMeasuredData.temperature,
        sim_x: t.data['V(d)'],
        sim_y: t.data['I(A1)'],
        real_x: aMeasuredData.vsd,
        real_y: aMeasuredData.is,
        param: 'Vgd=' + aMeasuredData.vgd.toEng() + 'V',    // distinguishing parameter
        score: score.score
    };
}

globalThis.simulation_vsd_is = simulation_vsd_is;
globalThis.exports = simulation_vsd_is;




