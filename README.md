# lg-cli构建工具

使用lg-cli脚手架来创建基础项目并在此基础上开发

### 基础环境搭建

1. npm install

2. npm link 

### lg命令

* `lg -v`: 查看版本号

* `lg -h`: 查看命令提示

* `lg init`: 查看所有模板项目
  
  输出:
  ```
  template_vue
  template_zepto
  template_react
  ...
  ```

* 可以通过在serve后面加入path、port来更加精准的操作它

    `lg serve` 默认3000端口的当前子目录

    `lg serve <path>` 部署指定目录

    `lg serve <path> *p <port>` 部署指定port的指定目录

* `lg dev`: 启动lg模板项目

* `lg build`: 构建lg模板项目的dist包

### 依赖文件

##### lg-config

```js
{
    // 项目类型 single(单页面) multiple(多页面)
    "projectElement": "single",
    // 是否启用es
    "useEslint": true,
    // 是否启用ts
    "useTypeScript": true,
    // dev阶段配置
    "dev": {
        // 参考 https://webpack.js.org/configuration/dev*server/#devserver
        "devServer_config": {
            "contentBase": "./dist",
            "port": 9000,
            "compress": true,
        },
        // 是否启用mock.js
        "useMock": true,
        // 静态资源加载
        "path": "/a/b/",
        // 项目打包路径
        "publicPath": "/a/b/"
    },
    // 生产配置
    "prod": {
        // 同"dev"的path、publicPath
        "path": "/a/b/",
        "publicPath": "/a/b/"
    }
}
```

##### engine.js

> engine通过全局注入replace_content内的字段来控制静态变量的修改，来控制各种环境下的变量值

* 示例

    ```js
    {
        "replace_content": {
            "dev": {
                "api_prefix": "",
                "routerPath": "/a/b"
            },
            "test": {
                "api_prefix": "//msinner.jr.jd.com",
                "routerPath": "/a/b"
            },
            "prod": {
                "api_prefix": "//u.jr.jd.com",
                "routerPath": "/a/b"
            }
        },
        "nowEnv": "dev"
    }
    ```

* 字段

    `nowEnv`: 当前的环境(对应于replace_content内的keys)

    `keys in replace_content`: 代替项目模板内的静态值，例如："dev"内的"api_prefix"来代替项目模板内的"LG_CONFIG_API_PREEFIX"

* waring

> 使用此功能会有以下问题：只对js有效；无文件hash，线上会有缓存问题


### 精确控制

##### mock.js

* 当前目录需要有mock文件

```js
{
    // 请求路径公共字段
    "prefix": "/a/b",
    // 模拟延迟，默认0
    "delay": 200,
    // 需要mock的接口
    "apiList":[
        {
            "url": "/c/testUrl",
            "method": "GET",
            // 接口对应mock数据，详见 https://github.com/nuysoft/Mock/wiki/Syntax*Specification
            "handle": {}
        }
    ]
}
```

##### .eslintrc.js

* 同.eslintrc，详见 [eslintDoc](https://eslint.org/docs/user*guide/configuring)

##### .ts

* 配置文件同ts，详见 [tsDoc](http://www.typescriptlang.org/docs/handbook/tsconfig-json.html#using-tsconfigjson)

### 更多

* 流程控制详见 [thinking](./thinking)


