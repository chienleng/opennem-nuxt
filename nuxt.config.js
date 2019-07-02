const pkg = require('./package')
const webpack = require('webpack')

module.exports = {
  mode: 'universal',

  server: {
    host: '0.0.0.0'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: pkg.name,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description }
    ],
    link: [
      {
        rel: 'stylesheet',
        href: 'https://unpkg.com/leaflet@1.2.0/dist/leaflet.css'
      },
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      { src: 'https://cdn.polyfill.io/v2/polyfill.min.js?features=default' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#e34a33' },

  /*
  ** Global CSS
  */
  css: ['@/assets/scss/app.scss'],

  generate: {
    routes: [
      '/energy/nem',
      '/energy/nsw1',
      '/energy/qld1',
      '/energy/sa1',
      '/energy/tas1',
      '/energy/vic1',
      '/facilities/nem',
      '/facilities/nsw1',
      '/facilities/qld1',
      '/facilities/sa1',
      '/facilities/tas1',
      '/facilities/vic1'
    ]
  },

  router: {
    base: '/'
  },

  /*
  ** Plugins to load before mounting the App
  */
  plugins: ['~plugins/filters.js', { src: '~/plugins/leaflet', ssr: false }],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios'
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    plugins: [
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/
      })
    ],
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
