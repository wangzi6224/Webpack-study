const path = require("path");
const webpack = require("webpack");

/**
 * 占位符:
 * [ext]: 资源后缀名;
 * [name]: 文件名称;
 * [path]: 文件相对路径;
 * [folder]: 文件所在的文件夹;
 * [contenthash]: 文件的内容hash, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash
 * [hash]: 文件内容的hash, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash
 * [hash]: 文件内容的hash, 默认是MD5生成; ---- 如果后面接 ":" + "number", 就是表示前多少位hash
 * [emoji]: 一个随机的指带文件内容的emoji;
 * */

module.exports = {
    /**
     * entry: 入口文件,
     * 可以是多入口, 如果是单入口的, 就是字符串, 如果是多入口的就是:
     * {
     *     app: '路径',
     *     app1: '路径1'
     * }
     * */
    entry: './src/index.js',
    /**
     * output: 打包之后的输出写入磁盘;
     * 如果多入口配置: output内 filename字段的 输出文件名需要用 [name] 进行占位, 例如 [name].js
    * */
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name][chunkhash:8].js"
    },
    mode: "development",
    /**
     * watch: 文件监听;
     * 默认是false,
     * 原理: 首先webpack会轮询文件的最后修改时间, 并且存储起来, 某个文件发生了变化, 并不会理解告诉监听者, 而是线缓存起来, 等aggregateTimeout配置的时长后才执行;
    * */
    watch: true,
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
                    "style-loader",
                    "css-loader",
                    "less-loader"
                ]
            },
            {
                /**
                 * 解析file
                * */
                test: /.(png|jpg|jpeg|gif)$/,
                use: "file-loader"
            },
            {
                /**
                 * url-loader: 也可以处理静态资源, 处理图片和文字,
                 * 可以设置较小的资源自动base64
                * */
                test: /.(png|jpg|jpeg|gif)$/,
                use: [{
                    loader: "url-loader",
                    options: {
                        name: "img/[name][hash:8].[ext]",
                        limit: 10240, // 对图片进行限制,如果小于10kb的话, 会进行base64转换
                    }
                }]
            }
        ]
    },
    /**
     * plugins: 插件, 用于整个构建过程;
     * 插件用于优化bundle文件, 资源管理和环境变量注入;
    * */
    plugins: [
        /**
         * webpack.HotModuleReplacementPlugin 没有必要加, hot: true 会自动引入这个 plugin
        * */
        // new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        /**
         * static: 告诉服务器内容的来源
         * */
        static: './dist',
        /**
         * 热更新原理:
         * Webpack Compile: 首先编译器将代码编译成bundle文件;
         * HMR Server: 将热更新的文件输出给HMR Runtime;
         * Bundle Serve: 提供文件给在浏览器的访问;
         * HMR Runtime: 会在打包阶段注入到浏览器的bundle.js, 就会和服务器进行简历链接, 通常这个链接采用WebSocket 进行连接;
         * bundle.js: 构建输出的文件;
         *
         * 热更新流程:
         * 1. 首先通过Webpack Compile将代码编译成bundle.js文件, 提供给Bundle Serve服务器;
         * 2. Bundle Serve服务器会将bundle.js提供给浏览器, 并将HMR Runtime代码注入到bundle.js中, 以便和服务器的 HMR Server建立WebSocket连接;
         * 3. 浏览器内接受到文件后, 执行文件, 渲染页面;
         * 4. 监听原文件的变化, 一旦变化,  Wabpack Dev Server就会用 HMR Server通知浏览器的HMR Runtime及时尽心更新文件, 已达到热更新的效果;
        * */
        hot: true
    }
}
