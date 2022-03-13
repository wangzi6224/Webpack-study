const path = require("path");
const webpack = require("webpack");
/**
 * glob: 通过星号等 shell 所用的模式匹配文件。
 * 文档地址: https://www.npmjs.com/package/glob
* */
const glob = require("glob");
// css 提取插件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
/**
 * CssMinimizerPlugin: Webpack5 css压缩插件
 * 注意: optimize-css-assets-webpack-plugin css压缩插件只能在 webpack5 以下的版本使用;
 * */
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");


/**
 * 占位符:
 * [ext]: 资源后缀名;
 * [name]: 文件名称;
 * [path]: 文件相对路径;
 * [folder]: 文件所在的文件夹;
 * [contenthash]: 文件的内容hash, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash
 * [hash]: 文件内容的hash, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash
 * [emoji]: 一个随机的指带文件内容的emoji;
 * */

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
        /**
        * [
         *   'src/index/index.js',
         *   'index',
         *   index: 41,
         *   input: '/Users/wangzilong/Projects/Webpack-study/src/index/index.js',
         *   groups: undefined
         * ]
         * [
         *   'src/search/index.js',
         *   'search',
         *   index: 41,
         *   input: '/Users/wangzilong/Projects/Webpack-study/src/search/index.js',
         *   groups: undefined
         * ]
        * */
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
    /**
     * entry: 入口文件,
     * 可以是多入口, 如果是单入口的, 就是字符串, 如果是多入口的就是:
     * {
     *     app: '路径',
     *     app1: '路径1'
     * }
     * */
    entry,
    /**
     * output: 打包之后的输出写入磁盘;
     * 如果多入口配置: output内 filename字段的 输出文件名需要用 [name] 进行占位, 例如 [name].js
     * */
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name]_[chunkhash:8].js"
    },
    mode: "production", // production 默认开启tree-shaking
    /**
     * watch: 文件监听; (生产默认不用监听)
     * 默认是false,
     * 原理: 首先webpack会轮询文件的最后修改时间, 并且存储起来, 某个文件发生了变化, 并不会理解告诉监听者, 而是线缓存起来, 等aggregateTimeout配置的时长后才执行;
     * */
    // watch: true,
    /**
     * watchOptions:文件监听配置项;
     * 只有在watch为true开启的时候才有意义
     * */
    watchOptions: {
        /**
         * ignored: 默认为空, 不坚挺的文件或者文件件, 支持正则匹配, 坚挺的文件越少, 性能会越好.
         * */
        ignored: /node_modules/,
        /**
         * 监听文件变化后300ms后才会执行, 默认300ms
         * */
        aggregateTimeout: 300,
        /**
         * poll: 判断文件是否发生变化, 标识轮询的周期, 默认是1000ms
         * */
        poll: 1000
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
    /**
     * 优化配置项
    * */
    optimization: {
        minimizer: [
            /**
             * 文档地址: https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/
            * */
            new CssMinimizerPlugin({
                test: /\.css$/,
                parallel: 4 //使用多进程并发执行，提升构建速度 Boolean|Number 默认值：true, Number代表并发进程数量
            }),
        ],
        /**
         * splitChunks: 对公共模块进行拆包分离提取;
         * chunks: 1. async 异步引入的库进行分离(默认), 2. initial: 同步引入的库进行分离, 3. all: 对所有引入的库进行分离;
         * minChunks: 最小使用引入公共模块的次数;
         * minSize: 分离的包体积的大小(字节);
         * maxAsyncRequests: 每次浏览器异步请求资源的并发数;
         * 文档地址: https://webpack.docschina.org/plugins/split-chunks-plugin
        * */
        splitChunks: {
            chunks: 'all',
            minSize: 20000, // 抽离的公共包最小的大小，单位字节
            // maxSize: 0, // 最大的大小
            minRemainingSize: 0,
            minChunks: 1, // 资源使用的次数(在多个页面使用到)， 大于1， 最小使用次数
            maxAsyncRequests: 30, // 并发请求的数量
            maxInitialRequests: 30, // 入口文件做代码分割最多能分成3个js文件
            enforceSizeThreshold: 50000, // 强制执行拆分的体积阈值和其他限制
            cacheGroups: {
                vendors: { // !!!!!!!!!! ------> 该字段名称需在HTMLWebpackPlugin 的chunks字段内配置
                    test: /[\\/]node_modules[\\/]/, //检测引入的库是否在node_modlues目录下的
                    priority: 10, //值越大,优先级越高.模块先打包到优先级高的组里
                    filename: "vendors_[hash:8].js",
                    reuseExistingChunk: true, //如果一个模块已经被打包过了,那么再打包时就忽略这个上模块
                },
                commons: { //  抽离公共模块
                    chunks: "all",
                    filename: "commons_[hash:8].js",
                    minSize: 0,
                    minChunks: 2,
                    priority: 1
                }
            },
        }
    },
    /**
     * plugins: 插件, 用于整个构建过程;
     * 插件用于优化bundle文件, 资源管理和环境变量注入;
     * */
    plugins: [
        /**
         * MiniCssExtractPlugin: 将css提取成一个独立的文件;
         * 文档地址: https://webpack.docschina.org/plugins/mini-css-extract-plugin/
        * */
        new MiniCssExtractPlugin({
            filename: "[name]_[contenthash:8].css"
        }),
        /**
         * HtmlWebpackPlugin: 是对HTML进行压缩的插件
         * 文档地址: https://webpack.docschina.org/plugins/html-webpack-plugin/#root
        * */
        /*new HtmlWebpackPlugin({
            template: path.join(__dirname, "src/index.html"),
            filename: "index.html", // 指定打包出的文件名
            chunks: ["index"], // 生成的html使用哪些chunk
            inject: true, // js或者css自动注入
            minify: {
                html5: true,
                collapseWhitespace: true,
                preserveLineBreaks: false,
                minifyCSS: true,
                minifyJS: true,
                removeComments: true,
            }
        }),*/
        /**
         * CleanWebpackPlugin: 每次构建先清空dist目录
        * */
        new CleanWebpackPlugin()
    ].concat(htmlWebpackPlugins)
}
