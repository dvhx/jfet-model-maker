// Check if Ctrl+C was pressed and if yes, save current best model to tmp.json
// linter: ngspicejs-lint
"use strict";

function check_ctrl_c(aBestModel, aBestScore) {
    // Check if Ctrl+C was pressed and if yes, save current best model to tmp.json
    if (ctrl_c_pressed()) {
        beep();
        echo();
        if (read_char('Before exit, do you want to save current best model with score ' + aBestScore.toEng(3) + ' to tmp.json? [Y/n]: ').toLowerCase() !== 'n') {
            echo();
            file_write_json('tmp.json', aBestModel, 4);
            echo('\nSaved tmp.json');
        }
        exit(1);
    }
}

globalThis.check_ctrl_c = check_ctrl_c;
globalThis.exports = check_ctrl_c;

