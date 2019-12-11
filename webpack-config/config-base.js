const fs = require('fs') 
const path = require('path') 
const VueLoaderPlugin = require('vue-loader/lib/plugin') 
const HtmlWebpackPlugin = require('html-webpack-plugin') 
const UglifyJsPlugin = require('uglifyjs-webpack-plugin') 
const MiniCssExtractPlugin = require('mini-css-extract-plugin') 
const InjectEngPlugin = require('./custom-pugins/inject-eng-plugin') 
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') 

const template_file_path = process.cwd()
const lg_config_content = require(path.resolve(template_file_path, 'lg-config.js'))
const path_file_arr = fs.readdirSync(path.resolve(template_file_path, './src/pages'))
const loaderPath = (LoaderName) => path.resolve(__dirname, `../node_modules/${LoaderName}`)

const urlLoader = loaderPath('url-loader')
const vueLoader = loaderPath('vue-loader')
const cssLoader = loaderPath('css-loader')
const fileLoader = loaderPath('file-loader')
const sassLoader = loaderPath('sass-loader')
const babelLoader = loaderPath('babel-loader')
const babelEnv = loaderPath('@babel/preset-env')
const eslintLoader = loaderPath('eslint-loader')
const babelReact = loaderPath('@babel/preset-react')
const sourceMapLoader = loaderPath('source-map-loader')
const awesomeTypescriptLoader = loaderPath('awesome-typescript-loader')

const useTs = lg_config_content.useTypeScript 
const projectElement = lg_config_content.projectElement 
projectElement === 'single' && path_file_arr.push('.')

const entryMode = () => {
    if (projectElement === 'single')
        return path.resolve(template_file_path, `./src/main.${useTs ? 'ts' : 'js'}`)
    else {
        let temp = {}
        fs.readdirSync(path.resolve(template_file_path, './src/pages')).forEach(p => {
            temp[p] = path.resolve(template_file_path, `./src/pages/${p}/index.${useTs ? 'ts' : 'js'}`)
        })
        return temp
    }
}

/**
 * @param {String} env_param lg-config.js replace_content keys
 */
module.exports = (env_param) => {

    const public_path = lg_config_content[env_param].publicPath
    const hashChoice = env_param === 'prod' ? 'contenthash' : 'hash'

    const rules = [{
            test: /\.vue$/,
            loader: vueLoader,
            options: {
                extractCSS: true,
            },
            exclude: /node_modules/
        },
        {
            test: /\.(js|jsx)$/,
            loader: babelLoader,
            query: {
                presets: [
                    babelEnv,
                    babelReact
                ],
                exclude: /node_modules/
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
                    name: 'assets/images/[name]_[contenthash].[ext]'
                }
            }]
        },
        {
            test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
            use: [{
                loader: fileLoader,
                options: {
                    name: `[name]_[${hashChoice}].[ext]`,
                    outputPath: 'assets/fonts/'
                }
            }]
        }
    ]

    lg_config_content.useEslint && rules.push({
        enforce: 'pre',
        test: /\.(js|jsx|vue)$/,
        loader: eslintLoader,
        include: [path.resolve(process.cwd(), 'src')],
        exclude: /node_modules/,
        options: {
            formatter: require('eslint-friendly-formatter')
        }
    })

    const tsRuleConfig = [{
            test: /\.tsx?$/,
            loader: awesomeTypescriptLoader
        },
        {
            enforce: "pre",
            test: /\.js$/,
            loader: sourceMapLoader
        }

    ]

    useTs && rules.push(...tsRuleConfig)

    return {
        mode: 'production',
        entry: entryMode(),
        devtool: "source-map",
        output: {
            path: path.resolve(template_file_path, `dist${public_path.substr(0, public_path.length - 1)}`),
            filename: `js/[name].[${hashChoice}].js`,
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
                '.vue', '.js', ".ts", ".tsx", "json"
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
                chunks: ['module', 'common', projectElement === 'single' ? 'main' : p],
                template: `src/${projectElement === 'single' ? '' : 'pages/' + p + '/'}index.html`,
                filename: `${projectElement === 'single' ? p + '/index.html' : p + '.html'}`,
                inject: 'body'
            })),
            new MiniCssExtractPlugin({
                filename: `style/[name].[${hashChoice}].css`,
                // Dynamically output filename when css is built
                chunkFilename: `style/[name].[${hashChoice}].css`
            }),
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
                        filename: `js/module.[${hashChoice}].js`,
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