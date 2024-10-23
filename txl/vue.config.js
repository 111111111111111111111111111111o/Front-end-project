const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer:{

    host: '0.0.0.0',
    port: 8082,
    client: {
      webSocketURL: 'ws://0.0.0.0:8082/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    port: 8082
  },
  transpileDependencies: true,
  chainWebpack: config =>{
    config.plugin('html' )
    .tap(args => {
      args[0].title = "通讯录";
      return args;
    })
  },



})
