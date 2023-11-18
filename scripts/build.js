const fs = require('fs');
const execa = require('execa')

const dirs = fs.readdirSync('packages').filter(file => {
    return file !== 'examples'&&  fs.statSync(`packages/${file}`).isDirectory()
});
console.log(1111);
const build = async (target) => {
    console.log(target);
    // -env: --environment
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio:'inherit' });
}
const runParaller = async (dirs, buildFn) => {
    let res = [];
    for(let dir of dirs) {
        res.push(buildFn(dir));
    }
    return Promise.all(res);
}

runParaller(dirs, build).then((res) => {
    console.log('success', res);
})
