const path = require('path');

const config = {
  projectName: 'planar-bridge',
  date: '2026-04-03',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV || 'h5'}`,
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [
      {
        from: 'src/images',
        to: `dist/${process.env.TARO_ENV || 'h5'}/images`,
      },
    ],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  cache: {
    enable: false,
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024,
        },
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: [],
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]',
        },
      },
    },
    router: {
      mode: 'browser',
      customRoutes: {
        '/pages/welcome/index': '/',
        '/pages/search/index': '/search',
        '/pages/lists/index': '/lists',
        '/pages/settings/index': '/settings',
      },
    },
    devServer: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: 'all',
      historyApiFallback: true,
      open: false,
      client: {
        overlay: false,
        webSocketURL: {
          hostname: '0.0.0.0',
          port: 0,
          protocol: 'wss',
        },
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Methods': '*',
      },
    },
    webpackChain(chain) {
      chain.resolve.alias.set('@', path.resolve(__dirname, '../src'));
    },
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev'));
  }
  return merge({}, config, require('./prod'));
};
