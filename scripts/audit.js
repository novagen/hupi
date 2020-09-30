const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const param = process.argv.length >= 3 ? process.argv[2] : "";
const root = process.cwd();
audit_recursive(root);

function audit_recursive(folder) {
    if (fs.existsSync(path.join(folder, 'package.json')) && !path.basename(folder) !== 'packages') {
        audit(folder);
    }

    for (let subfolder of subfolders(folder)) {
        audit_recursive(subfolder);
    }
}

function audit(where) {
    console.info("Auditing", where);
    try {
        child_process.execSync(`npm audit ${param}`, { cwd: where, env: process.env, stdio: 'inherit' });
    } catch (e) {
        if (!e.statSync == 255) {
            console.error(e);
        }
    }
    console.info("----------");
}

function subfolders(folder) {
    return fs.readdirSync(folder)
        .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
        .filter(subfolder => subfolder !== 'node_modules' && subfolder[0] !== '.')
        .map(subfolder => path.join(folder, subfolder));
}

