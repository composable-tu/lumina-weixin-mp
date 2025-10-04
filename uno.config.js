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
import {defineConfig, presetWind3} from "unocss";

const remRE = /^-?[.\d]+rem$/

export default defineConfig({
    postprocess(util) {
        util.entries.forEach((i) => {
            const value = i[1]
            if (value && typeof value === 'string' && remRE.test(value)) {
                const numericValue = parseFloat(value.slice(0, -3));
                i[1] = `${numericValue * 2 * 32}rpx`;
            }
        })
    }, presets: [presetWind3(),], rules: [[/^bg-(.*)$/, ([, c]) => ({'background-color': `#${c}`})],], theme: {
        preflightRoot: ["page,::before,::after"]
    },
})