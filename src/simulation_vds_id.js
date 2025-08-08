// Simulate transistor model and measure VDS:ID at constant VGS, compare with measured data
// linter: ngspicejs-lint
// global: normalized_score
"use strict";

function simulation_vds_id(aModelObject, aMeasuredData) {
    // Simulate transistor model and measure VDS:ID at constant VGS, compare with measured data
    Internal.assert_arguments_length(arguments, 2, 2, 'simulation_vgs_id(model,data)');
    if (typeof aMeasuredData.vgs !== 'number') {
        throw new Exception('Measured data must contain vgs (number)');
    }
    if (typeof aMeasuredData.rvoltmeter !== 'number') {
        throw new Exception('Measured data must contain rvoltmeter (number)');
    }
    if (typeof aMeasuredData.temperature !== 'number') {
        throw new Exception('Measured data must contain temperature (number)');
    }
    if (!Array.isArray(aMeasuredData.vds)) {
        throw new Exception('Measured data must contain vds (array)');
    }
    if (!Array.isArray(aMeasuredData.id)) {
        throw new Exception('Measured data must contain id (array)');
    }

    // clone model
    var o = JSON.parse(JSON.stringify(aModelObject));
    o.name = 'MOD1';

    // netlist
    netlist_clear();
    pwl('U1', 5, 0).shape([[0, 0], [0.020, aModelObject.kind === 'JFET_N' ? 9.5 : -9.5]]);
    ammeter('A1', 5, 4);
    resistor('R1', 4, 'd', 220); // fixme: use resistor value from measured data?
    jfet_model(o);
    if (aModelObject.kind === 'JFET_N') {
        jfet_n('T1', 'd', 'g', 0, o.name); // normal
    } else {
        jfet_p('T1', 'd', 'g', 0, o.name); // normal
    }
    resistor('RV', 'd', 0, aMeasuredData.rvoltmeter); // voltmeter input resistance (measure this with second multimeter)
    battery('U2', 'g1', 0, aMeasuredData.vgs);
    resistor('R2', 'g1', 'g', 2); // 2ohm gate resistor to prevent "timestep too small" error
    resistor('R3', 'g', 0, '1M'); // protection 1M gate to ground

    // transient
    var t = tran().run();
    t.dispose();
    if (!t.data) {
        return;
    }

    // score
    var score = normalized_score(aMeasuredData.vds, aMeasuredData.id, t.data['V(d)'], t.data['I(A1)'], 9999);

    return {
        vgs: aMeasuredData.vgs,
        temperature: aMeasuredData.temperature,
        sim_x: t.data['V(d)'],
        sim_y: t.data['I(A1)'],
        real_x: aMeasuredData.vds,
        real_y: aMeasuredData.id,
        param: 'Vgs=' + aMeasuredData.vgs.toEng() + 'V',    // distinguishing parameter
        score: score.score
    };
}

globalThis.simulation_vds_id = simulation_vds_id;
globalThis.exports = simulation_vds_id;



