const {merge} = require("webpack-merge");
const baseConfig = require("./webpack.base.js")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const prodConfig = {
    mode: "production",
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
    plugins: [
        /**
         * MiniCssExtractPlugin: 将css提取成一个独立的文件;
         * 文档地址: https://webpack.docschina.org/plugins/mini-css-extract-plugin/
         * */
        new MiniCssExtractPlugin({
            filename: "[name]_[contenthash:8].css"
        }),
    ]
};

module.exports = merge(baseConfig, prodConfig)
