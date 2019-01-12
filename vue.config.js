const SWPrecache = require('sw-precache-webpack-plugin')

module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '/nudoku/' : '/',
  productionSourceMap: process.env.NODE_ENV === 'development',
  outputDir: 'docs',
  configureWebpack: {
    plugins: process.env.NODE_ENV === 'production' ? [
      new SWPrecache({
        cacheId: 'blabla',
        filepath: 'docs/service-worker.js',
        staticFileGlobs: [
          'docs/*.*',
          'docs/**/*.*'
        ],
        stripPrefix: 'docs/'
      })
    ] : []
  }
}
