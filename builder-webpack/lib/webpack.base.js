const glob = require("glob");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WebpackPluginLogger = require("../../webpack-plugin-logger")
/**
 * ⚠️ friendly-errors-webpack-plugin 这个插件仅限于webpack5 之前的版本使用，且不再维护了；
* */
// var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');



/**
 * 多页面应用的配置方法:
 * 一般单页面叫SPA, 多页面MPA
 * 通过glob, 动态匹配所有文件, 生成出多个entry 和 htmlWebpackPlugins 的数组, 合并到配置项
 * */
const setMPA = () => {
    const entry = {}; // 定义入口
    const htmlWebpackPlugins = []; // 定义多页面的html使用的插件
    /**
     * 通过glob.sync 同步匹配src下面的所有有文件
     * */
    const entryFiles = glob.sync(path.join(__dirname, './src/*/index.js'))

    Object.keys(entryFiles).map(index => {
        const entryFile = entryFiles[index];
        const pageName = entryFile.match(/src\/(.*)\/index\.js/);
        entry[pageName[1]] = entryFile;
        htmlWebpackPlugins.push(
            new HtmlWebpackPlugin({
                template: path.join(__dirname, `src/${pageName[1]}/index.html`),
                filename: `${pageName[1]}.html`, // 指定打包出的文件名
                chunks: ['vendors', 'commons', pageName[1]], // 生成的html使用哪些chunk
                inject: true, // js或者css自动注入
                minify: {
                    html5: true,
                    collapseWhitespace: true,
                    preserveLineBreaks: false,
                    minifyCSS: true,
                    minifyJS: true,
                    removeComments: true,
                }
            })
        )
    })
    return {
        entry, htmlWebpackPlugins
    }
}

const {entry, htmlWebpackPlugins} = setMPA();

module.exports = {
    entry,
    output: {

    },
    /**
     * 1. 在module字段内指定rules字段, 定义loader;
     * 2. rules是一个数组, 数组内每一个对象有几个字段:
     *  a. test: 匹配文件后缀, 指定匹配规则;
     *  b. use: 指定使用的loader名称;
     * */
    module: {
        rules: [
            {
                /**
                 * 解析js
                 * 通过配置 babeIrc
                 * */
                test: /\.js$/,
                use: "babel-loader",
            },
            {
                /**
                 * 解析css
                 * */
                test: /\.css/,
                use: [
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                /**
                 * 解析less,
                 * use字段是数组的形式, 由于在解析的时候是数组是从右向左执行的顺序, 所以先通过less-loader解析为css,
                 * 然后通过css转换为css-loader, 再转使用style-loader进行转换成样式的顺序执行的
                 * */
                test: /\.less/,
                use: [
                    // "style-loader", // style-loader无法和css文件提取一起使用的
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "less-loader",
                    /**
                     * postcss-loader: 是一个处理css的loader;
                     * 在webpack调用次loader的时候, 默认会查找目录下的postcss.config.js的配置文件,
                     * */
                    "postcss-loader",
                    /*{
                        /!**
                         * 在做移动端适配的时候, 使用px2rem-loader
                         * remUnit: 表示1rem 代表 多少像素;
                         * remPrecision: 标识rem转为px时后面小数点的位数;
                        * *!/
                        loader: "px2rem-loader",
                        options: {
                            remUnit: 75,
                            remPrecision: 8
                        }
                    }*/
                ]
            },
            {
                /**
                 * 解析file
                 * */
                test: /.(png|jpg|jpeg|gif)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name]_[hash:8].[ext]"
                        }
                    },
                ]
            },
            /*{
                /!**
                 * url-loader: 也可以处理静态资源, 处理图片和文字,
                 * 可以设置较小的资源自动base64
                 * *!/
                test: /.(png|jpg|jpeg|gif)$/,
                use: [{
                    loader: "url-loader",
                    options: {
                        // limit: 10240, // 对图片进行限制,如果小于10kb的话, 会进行base64转换
                    }
                }]
            }*/
        ]
    },
    optimization: {

    },
    plugins: [ 
        /**
         * MiniCssExtractPlugin: 将css提取成一个独立的文件;
         * 文档地址: https://webpack.docschina.org/plugins/mini-css-extract-plugin/
         * */
        new MiniCssExtractPlugin({
            filename: "[name]_[contenthash:8].css"
        }),
        /**
         * CleanWebpackPlugin: 每次构建先清空dist目录
         * */
        new CleanWebpackPlugin(),
        new WebpackPluginLogger()
    ].concat(htmlWebpackPlugins),
    /**
     * stats：日志打印；
     * 文档地址：https://webpack.docschina.org/configuration/stats
    * */
    stats: "errors-only"
}
