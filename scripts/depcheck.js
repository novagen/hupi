const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const root = process.cwd();
depcheck_recursive(root);

function depcheck_recursive(folder) {
    if (fs.existsSync(path.join(folder, 'package.json')) && !path.basename(folder) !== 'packages') {
        depcheck(folder);
    }

    for (let subfolder of subfolders(folder)) {
        depcheck_recursive(subfolder);
    }
}

function depcheck(where) {
    console.info("Checking", where);
    try {
        child_process.execSync('depcheck --ignores="esm,lodash.merge,eslint"', { cwd: where, env: process.env, stdio: 'inherit' });
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