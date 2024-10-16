import { extname } from "path";
import { PurgeCSS } from "purgecss";

import type { OutputAsset, Plugin as RollupPlugin } from "rollup";
import type { Plugin as VitePlugin } from "vite";
import type { Options, PurgeCssContent, PurgeCssStyles } from "./types";

// 匹配 `.css` 和 `.module.css` 文件的正则表达式，包括可选的查询字符串。
export const cssRegExp = /^.*(\.module)?\.css(\?.*)?$/i;

/**
 * 使用 PurgeCSS 从生成的包中移除未使用的 CSS 的 Vite 插件。
 *
 * **注意**：由于使用了 `generateBundle` 输出生成钩子，该插件在开发过程中不会被调用。
 *
 * @param opts 插件选项
 * @returns purgecss vite 插件
 */
function purgeCssPlugin(opts?: Options): VitePlugin {
  return {
    name: "vite-plugin-purgecss",
    enforce: "post",
    apply: 'build', // 仅在构建模式下应用
    config(config) {
      // 确保 build 和 rollupOptions 存在
      config.build = config.build || {};
      config.build.rollupOptions = config.build.rollupOptions || {};

      // 添加我们的 Rollup 插件到 rollupOptions.plugins
      const plugins = config.build.rollupOptions.plugins || [];
      plugins.push(purgeCssRollupPlugin(opts));
      config.build.rollupOptions.plugins = plugins;
    },
  };
}

// 定义 Rollup 插件
function purgeCssRollupPlugin(opts?: Options): RollupPlugin {
  return {
    name: 'rollup-plugin-purgecss',
    async generateBundle(_, bundle) {
      let content: PurgeCssContent = [];
      let css: PurgeCssStyles = [];

      if (opts != null) {
        // 从选项中提取 PurgeCSS content 和 css
        const { content: optsContent, css: optsCss, ...rest } = opts;
        content = optsContent ?? content;
        css = optsCss ?? css;
        opts = rest;
      }

      // 可能被转换的 CSS 资源的缓存
      const outputs: Record<string, OutputAsset> = {};

      for (const id in bundle) {
        const file = bundle[id];
        const isChunk = file.type === "chunk";
        if (isChunk || !cssRegExp.test(file.fileName)) {
          // 将代码块和非 CSS 资产添加到要分析的内容数组中
          content.push({
            extension: extname(file.fileName).slice(1),
            raw: isChunk ? file.code : sourceString(file.source),
          });
          continue;
        }

        // 将 CSS 资产添加到要转换的 css 数组中
        css.push({ name: id, raw: sourceString(file.source) });

        // 将输出文件添加到 CSS 资产缓存中
        outputs[id] = file;
      }
      const results = await new PurgeCSS().purge({
        ...opts,
        content,
        css,
      })

      for (const result of results) {
        // 用 PurgeCSS 结果替换 CSS 资产
        outputs[result.file!].source = result.css;
      }
    }
  };
}

/**
 * 如有必要，将包内容转换为字符串。
 *
 * @param source 字符串或二进制数据缓冲区
 * @returns `source` 的字符串形式
 */
export function sourceString(source: string | Uint8Array) {
  if (typeof source === "string") {
    return source;
  }
  return new TextDecoder().decode(source);
}

export default purgeCssPlugin;
export type { Options, PurgeCssContent, PurgeCssStyles }