
module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '/nudoku/' : '/',
  productionSourceMap: process.env.NODE_ENV === 'development'
}
