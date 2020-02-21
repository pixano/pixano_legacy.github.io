const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'demo/standalone-app-smart-rect.js'),
  output: {
    path: path.resolve(__dirname, './demo'),
    filename: 'standalone-app-smart-rect-bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      { test: /\.(png|woff|woff2|eot|ttf|svg)$/, use: ['url-loader?limit=100000'] },
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
    ]
  }
};
