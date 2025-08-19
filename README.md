# LuminaPJ Weixin Mini Program

琳琅问微信小程序工程项目

## 开发须知

### 首次构建与运行

下载源码后，需要执行以下步骤才可在[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)正常运行：

1. 在微信开发者工具中导入并打开项目（需已在[微信公众平台](https://mp.weixin.qq.com/)新建小程序）
2. 在微信开发者工具中构建 `npm`（参见[微信官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/npm.html)）：
    1. 请根据您使用的包管理器，在项目根目录下执行以下命令之一：
    > npm
    
    ```Shell
    npm install
    ```
    
    > yarn
    
    ```Shell
    yarn install
    ```
   
    > pnpm
    
    ```Shell
    pnpm install
    ```
   
    > vlt
    
    ```Shell
    vlt install
    ```
    2. 在微信开发者工具中，点击开发者工具中的菜单栏：工具 --> 构建 `npm` 

### 后续开发

#### UnoCSS

琳琅问微信小程序工程项目使用 [UnoCSS](https://unocss.dev/)，在 WXML 中直接声明相应组件的 CSS（预设）样式类，以减少传统 HTML CSS 分离式写法的可维护性问题。

请在每次开始开发前运行以下命令以启动 UnoCSS 引擎：

```Shell
npm run unocss
```

#### 生成 `npm` 依赖及其 SPDX 开源许可列表

琳琅问使用 [npm License Checker](https://github.com/RSeidelsohn/license-checker-rseidelsohn) 生成项目所使用的 `npm` 依赖及其已进入 [SPDX](https://spdx.dev/) 的开放源代码许可证 JavaScript 字面量列表，并在最终用户界面中展示。

请在每次开发完毕后运行以下命令以生成依赖开源许可列表：

```Shell
npm run build-oss-licenses-dist
```
