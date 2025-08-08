// Simulate transistor model using DC jig with Rd to Vbat, Rs and Rg to ground
// linter: ngspicejs-lint
// global: normalized_score
"use strict";

function simulation_dc_jig(aModelObject, aMeasuredData) {
    // Simulate transistor model using DC jig with Rd to Vbat, Rs and Rg to ground

    // check measured data for obvious errors
    if (aModelObject.kind === 'JFET_N' && aMeasuredData.vbat < 0) {
        Internal.assert_number(aMeasuredData.vbat, 'measured_data.vbat', 'simulation_dc_jig', 1, 100);
        Internal.assert_number(aMeasuredData.id, 'measured_data.id', 'simulation_dc_jig', 1e-9, 10);
        Internal.assert_number(aMeasuredData.vd, 'measured_data.vd', 'simulation_dc_jig', 0.001, aMeasuredData.vbat);
        Internal.assert_number(aMeasuredData.vs, 'measured_data.vs', 'simulation_dc_jig', 0, aMeasuredData.vbat);
        Internal.assert_number(aMeasuredData.vg, 'measured_data.vg', 'simulation_dc_jig', 0, aMeasuredData.vbat);
    }
    if (aModelObject.kind === 'JFET_P' && aMeasuredData.vbat > 0) {
        Internal.assert_number(aMeasuredData.vbat, 'measured_data.vbat', 'simulation_dc_jig', -100, -1);
        Internal.assert_number(aMeasuredData.id, 'measured_data.id', 'simulation_dc_jig', -10, -1e-9);
        Internal.assert_number(aMeasuredData.vd, 'measured_data.vd', 'simulation_dc_jig', aMeasuredData.vbat, -0.001);
        Internal.assert_number(aMeasuredData.vs, 'measured_data.vs', 'simulation_dc_jig', aMeasuredData.vbat, 0);
        Internal.assert_number(aMeasuredData.vg, 'measured_data.vg', 'simulation_dc_jig', aMeasuredData.vbat, 0);
    }
    Internal.assert_number(aMeasuredData.rd, 'measured_data.rd', 'simulation_dc_jig', 1, 100e6);
    Internal.assert_number(aMeasuredData.rs, 'measured_data.rs', 'simulation_dc_jig', 1, 100e6);
    Internal.assert_number(aMeasuredData.rg, 'measured_data.rg', 'simulation_dc_jig', 1, 1000e6);
    Internal.assert_number(aMeasuredData.rvoltmeter, 'measured_data.rvoltmeter', 'simulation_dc_jig', 1, 10000e6);
    Internal.assert_number(aMeasuredData.temperature, 'measured_data.temperature', 'simulation_dc_jig', 0, 50);
    Internal.assert_number(aMeasuredData.temperature, 'measured_data.temperature', 'simulation_dc_jig', 0, 50);

    // clone model
    var o = JSON.parse(JSON.stringify(aModelObject));
    o.name = 'MOD1';

    // netlist
    netlist_clear();
    battery('U1', 5, 0, aMeasuredData.vbat);
    ammeter('A1', 5, 4);
    resistor('RD', 4, 'd', aMeasuredData.rd);
    jfet_model(o);
    jfet_n('T1', 'd', 'g', 's', o.name); // normal
    resistor('RS', 's', 0, aMeasuredData.rs);
    resistor('RG', 'g', 0, aMeasuredData.rg);

    // this may be a bit of a problem because in reality I only have 1 voltmeter and I am swapping them
    resistor('RV1', 'd', 0, aMeasuredData.rvoltmeter);
    resistor('RV2', 'g', 0, aMeasuredData.rvoltmeter);
    resistor('RV3', 's', 0, aMeasuredData.rvoltmeter);
    //echo_netlist();

    // transient
    var t = tran().run();
    t.dispose();
    if (!t.data) {
        return;
    }

    // score
    var score_vd = Math.abs(aMeasuredData.vd - t.avg('V(d)'));
    //echo('vd', score_vd, aMeasuredData.vd, t.avg('V(d)'));
    var score_vs = Math.abs(aMeasuredData.vs - t.avg('V(s)'));
    //echo('vs', score_vs, aMeasuredData.vs, t.avg('V(s)'));
    var score_vg = Math.abs(aMeasuredData.vg - t.avg('V(g)'));
    //echo('vg', score_vg, aMeasuredData.vg, t.avg('V(g)'));
    var score_id = Math.abs(aMeasuredData.id - t.avg('I(A1)'));
    //echo('id', score_id, aMeasuredData.id, t.avg('I(A1)'));

    // total score (feel free to fiddle with weights, increase weights for problematic variables)
    var score = 10e-6 * (20 * score_vd + 10 * score_vs + 100 * score_vg + 5000 * score_id);
    //echo('score', score);

    return {
        temperature: aMeasuredData.temperature,
        real_x: [0, 0.01, 1],
        real_y: [0, score, score],
        sim_x: [0, 0.01, 1],
        sim_y: [0, score, score],
        param: 'unknown',
        score: score
    };
}

globalThis.simulation_dc_jig = simulation_dc_jig;
globalThis.exports = simulation_dc_jig;

