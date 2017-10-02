module.exports = {
  context: __dirname + '/app',
  entry: './entry',
  output: {
    path: __dirname + '/public/javascripts',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/,
        loader: 'style!css'
      }
    ]
  }
};
