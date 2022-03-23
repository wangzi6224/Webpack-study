const path = require("path");
const os = require("os");
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
const ESLintPlugin = require('eslint-webpack-plugin');
const WebpackPluginLogger = require("./webpack-plugin-logger");
/**
 * 分析构建速度插件
 * 文档地址：https://www.npmjs.com/package/speed-measure-webpack-plugin
* */
const SpeedMeasureWebpackPlugin = require("speed-measure-webpack-plugin");

/*------------------------------------------------------------------------*/

/**
 * webpack-bundle-analyzer：打包后对文件模块大小进行分析，build之后，会开启一个port：8888的页面
 * 文档地址：https://github.com/webpack-contrib/webpack-bundle-analyzer
* */
// const {BundleAnalyzerPlugin} = require("webpack-bundle-analyzer");

/*------------------------------------------------------------------------*/


/**
 * HappyPack: 通过启动webpack
* */
// const HappyPack = require("happypack")

/*------------------------------------------------------------------------*/


/**
 * TerserPlugin: 多线程压缩代码;
 * 文档地址：https://webpack.docschina.org/plugins/terser-webpack-plugin/
* */
const TerserPlugin = require("terser-webpack-plugin");

/*------------------------------------------------------------------------*/


/**
 * HardSourceWebpackPlugin: 不能再Webpack5中使用，会报 "Error: Cannot find module 'webpack/lib/DependenciesBlockVariable'"的错误，
 * 由于 Webpack5中将DependenciesBlockVariable这个功能删除掉了， 所以会报错；
 * 如需使用缓存， 直接在配置中 cache字段 改为true
 * 文档地址：https://github.com/mzgoddard/hard-source-webpack-plugin#readme
* */
// const HardSourceWebpackPlugin = require("hard-source-webpack-plugin");

/*------------------------------------------------------------------------*/

/**
 * purgecss-webpack-plugin：css的 Tree Shaking；
 * 文档地址：https://purgecss.com/
* */
const PurgecssPlugin = require('purgecss-webpack-plugin');

const PATH = {
    src: path.join(__dirname, 'src')
}

/*------------------------------------------------------------------------*/


/**
 * 提升二次构建速度的思路：
 * 缓存思路：
 * babel-loader 开启缓存：提升二次解析速度
 * terser-webpack-plugin 开启缓存：提升二次压缩速度
 * 使用 cache-loader 或者 hard-source-webpack-plugin：用于缓存 webpack 内部模块处理的中间结果，提升二次模块转换速度
* */

const smp = new SpeedMeasureWebpackPlugin();

/**
 * 占位符:
 * [ext]: 资源后缀名;
 * [name]: 文件名称;
 * [path]: 文件相对路径;
 * [folder]: 文件所在的文件夹;
 * [hash]: hash是本次构建的唯一的hash值，全局唯一hash, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash；
 * [chunkhash]: 该占位符主要是基于入口（Entry）的不同，构建出不同的chunkhash，常用语bundle.js文件上，该入口解析出的模块，都会是当前的这个chunkhash；
 *              如果是动态引入（例如动态import（）需要配合babel插件进行编译）的模块，会有单独的hash；
 * [contenthash]: 文件的（内容哈希）, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash；
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
                use: [
                    {
                        loader: "thread-loader",
                        options: {
                            workers: 3
                        }
                    },
                    /**
                     * cacheDirectory: 主要是开启构建之后的缓存，提升二次构建的速率；
                     * 开启缓存后，会把所有缓存的文件 缓存到node_module下面的 .cache文件夹内
                    * */
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ],
                /**
                 * 如果开启happyPack，需要在此处配置happyPack的loader，
                 * 然后在Plugins数组内，实例话HappyPack，入参的loaders配置项内写入babel-loader等插件
                * */
                // use: 'happypack/loader',
            },
            {
                /**
                 * 解析css
                 * */
                test: /\.css/,
                use: [
                    MiniCssExtractPlugin.loader,
                    // "style-loader",
                    "css-loader" // style-loader无法和css文件提取一起使用的
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
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    "less-loader",
                    /**
                     * postcss-loader: 是一个处理css的loader;
                     * 在webpack调用次loader的时候, 默认会查找目录下的postcss.config.js的配置文件,
                     * */
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
             * CssMinimizerPlugin：主要是压缩css代码，可以启动多线程压缩，提高构建效率；
             * 文档地址: https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/
            * */
            new CssMinimizerPlugin({
                test: /\.css$/,
                parallel: 4 //使用多进程并发执行，提升构建速度 Boolean|Number 默认值：true, Number代表并发进程数量
            }),
            new TerserPlugin({
                parallel: os.cpus().length - 1,
                // cache: true
            })
        ],
        /**
         * splitChunks: 对公共模块进行拆包分离提取;
         * chunks: 1. async 异步引入的库进行分离(默认), 2. initial: 同步引入的库进行分离, 3. all: 对所有引入的库进行分离;
         * minChunks: 最小使用引入公共模块的次数;
         * minSize: 分离的包体积的大小(字节);
         * maxAsyncRequests: 每次浏览器异步请求资源的并发数;
         * 文档地址: https://webpack.docschina.org/plugins/split-chunks-plugin
         *
         * -------->DllPlugin可以一起使用。 DllPlugin 通常用于基础包（框架包、业务包）的分离。
         * -------->SplitChunks 虽然也可以做 DllPlugin 的事情，但是更加推荐使用 SplitChunks 去提取页面间的公共 js 文件。
         * -------->因为使用 SplitChunks 每次去提取基础包还是需要耗费构建时间的，如果是 DllPlugin 只需要预编译一次，后面的基础包时间都可以省略掉。
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
            filename: "[name]_[contenthash:8].css",
        }),
        /**
         * CleanWebpackPlugin: 每次构建先清空dist目录
        * */
        new CleanWebpackPlugin(),
        /**
         * ESLintPlugin: 开启eslint插件, 需要安装, eslint配置在跟目录下 创建 ".eslintrc.js" 文件进行配置
         * 不太会配, 觉得麻烦就不配了;
         * eslint配置官网: http://eslint.cn/
        * */
        // new ESLintPlugin()
        new WebpackPluginLogger(),
        // new BundleAnalyzerPlugin(),
        /*new HappyPack({
            loaders:[
                'babel-loader'
            ]
        })*/
        /**
         * DllReferencePlugin: 配合DllPlugin导出的 manifest.json 去引用指定模块进行分包，较少构建的体积。
        * */
        /* new webpack.DllReferencePlugin({
            manifest: require("./build/library/manifest.json")
        }) */
        // new HardSourceWebpackPlugin(),
        new PurgecssPlugin({
            paths: glob.sync(`${PATH.src}/**/*`, {nodir: true})
        })
    ].concat(htmlWebpackPlugins),
    resolve: {
        alias: {
            "react": path.join(__dirname, './node_modules/react/umd/react.production.min.js'),
            "react-dom": path.join(__dirname, './node_modules/react-dom/umd/react-dom.production.min.js'),
        },
        extensions:['.js'],
        mainFields: ['main']
    },
    cache: true
}
