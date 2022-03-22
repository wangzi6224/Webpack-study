const path = require("path");
const webpack = require("webpack");

module.exports = {
    entry: {
        library: [
            "react",
            "react-dom"
        ]
    },
    output: {
        filename: "[name]_[hash:8].dll.js",
        path: path.join(__dirname, "build/library"),
        library: "[name]"
    },
    plugins: [
        /**
         * DllPlugin和DllReferencePlugin提供了拆分捆绑包的方法，可以大幅提高构建时间性能。“DLL”一词代表最初由微软引入的动态链接库。
         * 文档地址：https://webpack.js.org/plugins/dll-plugin/
        * */
        new webpack.DllPlugin({
            context: __dirname,
            name: '[name]_[fullhash]',
            path: path.join(__dirname, 'build/library/manifest.json'),
        })
    ]
}
