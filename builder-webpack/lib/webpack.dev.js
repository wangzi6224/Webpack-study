const merge = require("webpack-merge");
const baseConfig = require("./webpack.base")
const WebpackPluginLogger = require("../../webpack-plugin-logger")


const devConfig = {
    mode: "development",
    plugins:[
        new WebpackPluginLogger()
    ],
    hot: true,
    devtool: 'source-map'
}

module.exports = merge(baseConfig, devConfig)
