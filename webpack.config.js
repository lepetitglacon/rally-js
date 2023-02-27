const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: {
        main: './src/index.js',
    },
    output: {
        filename: 'index.js',
    },

    watch: true,
    watchOptions: {
        ignored: '**/node_modules',
    },

    plugins: [
        new HtmlWebpackPlugin()
    ],

    module: {
        rules: [
            {
                test: /\.(css)$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};