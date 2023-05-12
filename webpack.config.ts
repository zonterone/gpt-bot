import * as path from 'path';
import * as webpack from 'webpack';
import NodemonPlugin from "nodemon-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";

const { NODE_ENV } = process.env;

const config: webpack.Configuration = {
  mode: NODE_ENV === 'development' ? NODE_ENV : 'production',
  target: "node",
  entry: { bot: "./src/bot.ts" },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
      },
    ],
  },
  plugins: [new NodemonPlugin()],
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: /AbortSignal/,
          keep_fnames: /AbortSignal/,
          ecma: 2020,
          module: true,
          toplevel: true,
        },
      }),
    ],
  },
};

export default config;