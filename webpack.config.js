const path = require("path");
const htmlWebpackPlugin = require("html-webpack-plugin");
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = {
  mode: "development",
  entry: {
    app: "./src/index.tsx",
    "editor.worker": "monaco-editor-core/esm/vs/editor/editor.worker.js",
    "javaWorker": './src/java/java.worker.ts'

  },
  output: {
    globalObject: 'self',
    filename: (chunkData) => {
        switch (chunkData.chunk.name) {
            case 'editor.worker':
                return 'editor.worker.js';
            case 'javaWorker':
                return "javaWorker.js"
            default:
                return 'bundle.[hash].js';
        }
    },
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {

    fallback: {
      assert: require.resolve('assert'),
      buffer: require.resolve('buffer'),
      console: require.resolve('console-browserify'),
      constants: require.resolve('constants-browserify'),
      crypto: require.resolve('crypto-browserify'),
      domain: require.resolve('domain-browser'),
      events: require.resolve('events'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser')
    },

    extensions: [".ts", ".tsx", ".js", ".jsx", ".css"],

  },
  module: {
    rules: [
      {
        test: /\.tsx?/,
        loader: "ts-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  plugins: [
    new NodePolyfillPlugin(),
    new htmlWebpackPlugin({
      template: "./src/index.html",
    }),
  ],
};
