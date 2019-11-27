const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const InjectEngPlugin = require('./custom-pugins/inject-eng-plugin');
const EslineRunningPlugin = require('./custom-pugins/eslint-runnint-plugin');

const template_file_path = process.cwd()
const path_file_arr = fs.readdirSync(path.resolve(template_file_path, './src/pages'))
const lg_config_content = require(path.resolve(template_file_path, 'lg-config.js'))

const loaderPath = (LoaderName) => path.resolve(__dirname, `../node_modules/${LoaderName}`)

const vueLoader = loaderPath('vue-loader')
const babelLoader = loaderPath('babel-loader')
const cssLoader = loaderPath('css-loader')
const sassLoader = loaderPath('sass-loader')
const babelEnv = loaderPath('@babel/preset-env')
const urlLoader = loaderPath('url-loader')
const fileLoader = loaderPath('file-loader')
const eslintLoader = loaderPath('eslint-loader')

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

    const public_path = lg_config_content[env_param].publicPath

    const rules = [{
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
    },
    {
        test: /\.(jpg|png|gif|bmp|jpeg)$/,
        use: [{
            loader: urlLoader,
            options: {
                limit: 8192,
                name: 'assets/images/[name]_[hash].[ext]'
            }
        }]
    },
    {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
            loader: fileLoader,
            options: {
                name: '[name]_[hash].[ext]',
                outputPath: 'assets/fonts/'
            }
        }]
    }
]

lg_config_content.useEslint && rules.push(    {
    enforce: 'pre',
    test: /\.(js|vue)$/,
    loader: eslintLoader,
    include: [path.resolve(process.cwd(), 'src')],
    exclude: /node_modules/,
    options: {
        formatter: require('eslint-friendly-formatter')
      }
})

    return {
        mode: 'production',
        entry: entryMode(),
        output: {
            path: path.resolve(template_file_path, `dist${public_path.substr(0, public_path.length - 1)}`),
            filename: "js/[name].[hash].js",
            publicPath: public_path
        },
        module: {
            rules
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
            // new EslineRunningPlugin(esLintPath.useEslint),
            ...path_file_arr.map(p => new HtmlWebpackPlugin({
                chunks: ['module', 'common', projectElement === 'single' ? 'main' : p],
                template: `src/${projectElement === 'single' ? '' : 'pages/' + p + '/'}index.html`,
                filename: `${projectElement === 'single' ? p + '/index.html' : p + '.html'}`,
                inject: 'body'
            })),
            new MiniCssExtractPlugin({
                filename: 'style/[name].[contenthash].css',
                // Dynamically output filename when css is built
                // chunkFilename: "style/[name].[contenthash].css"
            }),
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
                    js: {
                        name: 'module',
                        test: /[\\/]node_modules[\\/]/,
                        filename: 'js/module.[contenthash].js',
                        chunks: 'all',
                        priority: 10
                    },
                    common: {
                        name: 'common',
                        chunks: 'all',
                        minChunks: 2,
                        minSize: 0,
                    }
                }
            }
        }
    }
}