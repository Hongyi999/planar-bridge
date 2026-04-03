module.exports = {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {},
  mini: {
    optimizeMainPackage: {
      enable: true,
    },
  },
  h5: {
    /**
     * WebpackChain 插件配置
     * @docs https://github.com/mozilla-neutrino/webpack-chain
     */
    webpackChain(chain) {
      chain.optimization.splitChunks({
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
      });
    },
  },
};
