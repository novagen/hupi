const path = require('path');
const fs = require('fs');
const child_process = require('child_process');

const root = process.cwd();
npm_install_recursive(root);

function npm_install_recursive(folder) {
    if (fs.existsSync(path.join(folder, 'package.json')) && !path.basename(folder) !== 'packages') {
        npm_install(folder);
    }

    for (let subfolder of subfolders(folder)) {
        npm_install_recursive(subfolder);
    }
}

function npm_install(where) {
    console.info("Installing", where);
    child_process.execSync('npm install --no-audit --no-fund', { cwd: where, env: process.env, stdio: 'inherit' });
    console.info("----------");
}

function subfolders(folder) {
    return fs.readdirSync(folder)
        .filter(subfolder => fs.statSync(path.join(folder, subfolder)).isDirectory())
        .filter(subfolder => subfolder !== 'node_modules' && subfolder[0] !== '.')
        .map(subfolder => path.join(folder, subfolder));
}