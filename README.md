# @zxalct/vite-plugin-purgecss

## 📦 Install

**Using npm**:

```sh
npm install --save-dev @zxalct/vite-plugin-purgecss
```

**Using yarn**:

```sh
yarn add --dev @zxalct/vite-plugin-purgecss
```

**Using pnpm**:

```sh
pnpm add --save-dev @zxalct/vite-plugin-purgecss
```

## 🚀 Usage

### Basic

Omitting the options argument will use the default PurgeCSS options to clean
the CSS output of the Vite build.

```ts
// vite.config.ts
import pluginPurgeCss from "@zxalct/vite-plugin-purgecss";

export default {
	plugins: [pluginPurgeCss()],
};
```

### With CSS Variables

To remove unused CSS variable declarations and invalid `var()` functions,
enable the `variables` PurgeCSS option.

```ts
// vite.config.ts
import pluginPurgeCss from "@zxalct/vite-plugin-purgecss";

export default {
	plugins: [
		pluginPurgeCss({
			variables: true,
      safelist: [
        /-(leave|enter|appear)(|-(to|from|active))$/,
        /^(?!(|.*?:)cursor-move).+-move$/,
        /^router-link(|-exact)-active$/,
        /data-v-.*/,
        /** vant-ui */
        /^van-/,
      ]
		}),
	],
};
```