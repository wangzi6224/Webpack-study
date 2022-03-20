const PLUGIN_NAME = 'logger-plugin';
class WebpackPluginLogger {
    apply(compiler) {
        const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
        logger.log('log from compiler');

        compiler.hooks.compilation.tap("done", (compilation) => {
            const logger = compilation.getLogger(PLUGIN_NAME);
            logger.info('编译完成');
        });
    }
}

module.exports = WebpackPluginLogger;
