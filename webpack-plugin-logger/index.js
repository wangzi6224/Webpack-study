const PLUGIN_NAME = 'logger-plugin';

/**
 * plugin 和 loader 差别：
 * 1. Loader有独立的运行环境， 可以通过loader-runner独立运行开发，plugin需要以来webpack运行环境执行和开发；
 * 2. Loader是按照顺序执行的且 运行在打包文件之前， 从上到下， 从又至左的顺序执行的，plugin 在整个编译周期都起作用；
 * 3.在Webpack 运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在合适的时机通过Webpack提供的 API改变输出结果，
 *   对于loader，实质是一个转换器，将A文件进行编译形成B文件，操作的是文件，比如将A.scss或A.less转变为B.css，单纯的文件转换过程
 * 4.loader 是文件加载器，能够加载资源文件，并对这些文件进行一些处理，诸如编译、压缩等，最终一起打包到指定的文件中，
 *   plugin 赋予了 webpack 各种灵活的功能，例如打包优化、资源管理、环境变量注入等，目的是解决 loader 无法实现的其他事
* */

/**
 * Loader模版代码：
 * 导出一个函数，source为webpack传递给loader的文件源内容
 * module.exports = function(source) {
 *     const content = doSomeThing2JsString(source);
 *
 *     // 如果 loader 配置了 options 对象，那么this.query将指向 options
 *     const options = this.query;
 *
 *     // 可以用作解析其他模块路径的上下文
 *     console.log('this.context');
 *
 *
 *  // this.callback 参数：
 *  // error：Error | null，当 loader 出错时向外抛出一个 error
 *  // content：String | Buffer，经过 loader 编译后需要导出的内容
 *  // sourceMap：为方便调试生成的编译后内容的 source map
 *  // ast：本次编译生成的 AST 静态语法树，之后执行的 loader 可以直接使用这个 AST，进而省去重复生成 AST 的过程
 *
 *  this.callback(null, content); // 异步
 *  return content; // 同步
 * }
 * */

class MyWebpackPlugin {
    constructor(options) {
        // options 是插件接受的参数
        this.options = options
    }
    // 每次调用都会调用这个类的apply方法，并且会传入compiler对象
    apply(compiler) {
        // 在compiler对象监听需要的hooks
        compiler.hooks.emit.tap('done', (stat) => {
            console.log(this.options)
        })

        compiler.hooks.compilation.tap("done", (compilation) => {
            const logger = compilation.getLogger(PLUGIN_NAME);
            logger.info('编译完成');
        });
    }
}

module.exports = MyWebpackPlugin;
