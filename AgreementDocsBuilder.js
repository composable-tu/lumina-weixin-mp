const fs = require('fs');
const path = require('path');
const marked = require('marked');
const uglifyJS = require('uglify-js');
const JSON5 = require('json5');

marked.setOptions({
    gfm: true, breaks: true,
});

const sourceDir = path.join(__dirname, 'miniprogram/agreement-docs');
const targetDir = path.join(__dirname, 'miniprogram/agreement-docs');

if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {recursive: true});
}

const markdownFiles = fs.readdirSync(sourceDir)
    .filter(file => path.extname(file) === '.md');

const docsData = {};

markdownFiles.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const fileName = path.basename(file, '.md');

    const markdownContent = fs.readFileSync(filePath, 'utf-8');

    const htmlContent = marked.parse(markdownContent);

    const key = fileName
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toUpperCase(); // 转换为大写

    docsData[key] = htmlContent;
});

const jsContent = `module.exports = ${JSON5.stringify(docsData, null, 2)};`;

const minifiedResult = uglifyJS.minify(jsContent, {
    mangle: {toplevel: true}, compress: {
        sequences: true, dead_code: true, drop_debugger: true, unsafe: false
    }, output: {
        beautify: false, comments: false, max_line_len: 0
    },
});

if (minifiedResult.error) {
    console.error('压缩过程中出现错误:', minifiedResult.error);
    process.exit(1);
}

const outputFilePath = path.join(targetDir, 'AgreementDocsDist.js');
fs.writeFileSync(outputFilePath, minifiedResult.code, 'utf-8');
