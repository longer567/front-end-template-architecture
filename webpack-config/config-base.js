const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const InjectEngPlugin = require('./custom-pugins/inject-eng-plugin');
const CssCommonSplitPlugin = require('./custom-pugins/css-common-split-plugin')

const template_file_path = process.cwd()
const path_file_arr = fs.readdirSync(path.resolve(template_file_path, './src/pages'))
const lg_config_content = require(path.resolve(template_file_path, 'lg-config.js'))

const loaderPath = (LoaderName) => path.resolve(__dirname, `../node_modules/${LoaderName}`)

const vueLoader = loaderPath('vue-loader')
const babelLoader = loaderPath('babel-loader')
const cssLoader = loaderPath('css-loader')
const sassLoader = loaderPath('sass-loader')
const babelEnv = loaderPath('@babel/preset-env')

const projectElement = lg_config_content.projectElement;

projectElement === 'single' && path_file_arr.push('.')

const entryMode = () => {
    if (projectElement === 'single')
        return path.resolve(template_file_path, "./src/main.js")
    else {
        let temp = {}
        fs.readdirSync(path.resolve(template_file_path, './src/pages')).forEach(p => {
            temp[p] = path.resolve(template_file_path, `./src/pages/${p}/index.js`)
        })
        return temp
    }
}

/**
 * @param {String} env_param lg-config.js replace_content keys
 */
module.exports = (env_param) => {
    return {
        mode: 'production',
        entry: entryMode(),
        output: {
            path: path.resolve(template_file_path, "dist"),
            filename: "js/[name].[hash].js",
            publicPath: lg_config_content[env_param].publicPath
        },
        module: {
            rules: [{
                    test: /\.vue$/,
                    loader: vueLoader,
                    options: {
                        extractCSS: true,
                    },
                    exclude: /node_modules/
                },
                {
                    test: /\.js$/,
                    loader: babelLoader,
                    query: {
                        presets: [
                            babelEnv
                        ]
                    }
                },
                {
                    test: /\.(sc|sa|c)ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        cssLoader,
                        sassLoader,
                    ]
                }
            ]
        },
        performance: {
            hints: false
        },
        resolve: {
            extensions: [
                '.vue', '.js'
            ],
            modules: ["node_modules"],
            alias: {
                vue: 'vue/dist/vue.min.js',
                components: path.resolve(template_file_path + '/src/components/'),
                '@': path.resolve('src')
            }
        },
        plugins: [
            new VueLoaderPlugin(),
            ...path_file_arr.map(p => new HtmlWebpackPlugin({
                chunks: [p, "common"],
                template: `src/${projectElement === 'single' ? '' : 'pages/' + p + '/'}index.html`,
                filename: `${p}/index.html`,
                inject: 'body'
            })),
            new MiniCssExtractPlugin({
                filename: 'style/[name].[contenthash].css',
                // Dynamically output filename when css is built
                // chunkFilename: "style/[name].[contenthash].css"
            }),
            new CssCommonSplitPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            // new HtmlReplacePlugin(lg_config_content.replace_content[env_param]),
            new InjectEngPlugin(env_param || 'prod')
        ],
        optimization: {
            // env must be production
            minimizer: [
                new OptimizeCssAssetsPlugin(),
                new UglifyJsPlugin()
            ],
            splitChunks: {
                cacheGroups: {
                    common: {
                        name: 'common',
                        chunks: 'initial',
                        minChunks: 2, 
                        minSize: 0, 
                    }
                }
            }
        },
    };
}