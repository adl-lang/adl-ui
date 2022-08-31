// const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  "framework": "@storybook/react",
  // "webpackFinal": async (config) => {
  //   config.module.rules.push({
  //     test: /\.ts(x?)$/,
  //     use: [
  //       {
  //         loader: "ts-loader",
  //         options: { projectReferences: true }
  //       }
  //     ]
  //   });
  //   config.resolve.plugins.push(new TsconfigPathsPlugin());
  //   return config;
  // }
}
