/**
 * Copyright (c) 2025 LuminaPJ
 * SM2 Key Generator is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

/**
 * 这是一个协议文档构建脚本，用于将 Markdown 格式的协议文档转换为 JavaScript 模块
 * 主要功能：
 * 1. 读取 `miniprogram/agreement-docs` 目录下的所有 Markdown 文件
 * 2. 将 Markdown 内容转换为HTML格式
 * 3. 将所有文档内容打包成一个JavaScript对象模块
 * 4. 使用 uglify-js 对生成的模块进行压缩混淆
 * 5. 输出为 AgreementDocsDist.js 文件供小程序使用
 * 6. 生成 AgreementDocsDist.d.ts 声明文件
 */

const fs = require('fs');
const path = require('path');
const marked = require('marked');
const uglifyJS = require('uglify-js');
const JSON5 = require('json5');
const shell = require('shelljs');

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
    console.error('压缩过程中出现错误：', minifiedResult.error);
    process.exit(1);
}

const outputFilePath = path.join(targetDir, 'AgreementDocsDist.js');
fs.writeFileSync(outputFilePath, minifiedResult.code, 'utf-8');

const tscCommand = `npx tsc --declaration --emitDeclarationOnly --allowJs ${outputFilePath} --outDir ${targetDir}`;
shell.exec(tscCommand);
