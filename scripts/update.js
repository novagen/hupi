const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const root = process.cwd();
update_recursive(root);

function update_recursive(folder) {
    if (fs.existsSync(path.join(folder, 'package.json')) && !path.basename(folder) !== 'packages') {
        update(folder);
    }

    for (let subfolder of subfolders(folder)) {
        update_recursive(subfolder);
    }
}

function update(where) {
    child_process.execSync('ncu -u', { cwd: where, env: process.env, stdio: 'inherit' });
    console.info("----------");
}

function subfolders(folder) {
    return fs.readdirSync(folder)
        .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
        .filter(subfolder => subfolder !== 'node_modules' && subfolder[0] !== '.')
        .map(subfolder => path.join(folder, subfolder));
}