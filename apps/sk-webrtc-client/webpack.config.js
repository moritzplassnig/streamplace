
/*eslint-disable no-var */
var path = require("path");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var config = require("sk-config");

var resolve = function(x) {
  return path.resolve(x);
};

module.exports = {
  context: __dirname,
  entry: "./src/index",
  output: {
    filename: "bundle.js", //this is the default name, so you can skip it
    path: "dist",
    publicPath: ""
  },
  plugins: [
    new CopyWebpackPlugin([
      // {output}/file.txt
      { from: "src/*.mustache", to: ".", flatten: true },
    ])
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: "babel",
      query: {
        presets: [
          // Weirdness here because of https://github.com/babel/babel-loader/issues/166
          require.resolve("babel-preset-react"),
          require.resolve("babel-preset-streamkitchen")
        ]
      }
    }, {
      test: /\.scss$/,
      loaders: ["style", "css?modules", "sass"]
    }, {
      test: /\.json$/,
      loaders: ["json"]
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "url-loader?limit=10000&minetype=application/font-woff"
    }, {
      test: /\.(ttf|eot|svg|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "file-loader"
    }, {
      test: /\.mustache$/,
      loaders: [
        "file?name=[name]",
        "val",
        `apply?{obj: ${JSON.stringify(config)}}`,
        "mustache"
      ]
    }]
  },
  externals: {
    //don"t bundle the "react" npm package with our bundle.js
    //but get it from a global "React" variable
    "react": "React",
    "react-dom": "ReactDOM"
  },
  resolve: {
    root: ([
      path.resolve(__dirname),
      path.resolve(__dirname, ".."), // So we can resolve all our other packages
    ]).concat(process.env.NODE_PATH.split(":").map(resolve)),
    extensions: [".js", ".jsx", ".scss", ".json", ""]
  },
  resolveLoader: {
    root: path.join(__dirname, "node_modules")
  }
};
