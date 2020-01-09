# lg-cli构建工具thinking
## 1.启动
> 使用package.json的bin字段，在使用link的时候，全局的npm包目录(bin)下会生成一个名为该字段key的可执行文件（bin与执行文件之间会生成软连接），让我们能够在任何地方访问到该值。键入该key值会执行bin字段内的目标文件，由于目标文件内使用了 `#!/usr/bin/env node` 告诉该文件使用node解析，所以可直接不使用`node`命令执行。

## 2.入口
##### 输入：
> 使用`process.argv`采集
##### 全局对象lg ：
> 在入口文件引入全局对象lg，项目内任意地方都可访问，可在lg上挂载公用方法。
##### 基本信息输出：
> 类如`lg -v` `lg -h`此类方法可读取package.json内的name、version、description等信息同步输出。涉及较为复杂的功能操作时（dev、init、build等）会读取相关功能文件运行。
##### 工作流程 
1. `serve`：开启本地服务
2. `init`：读取目录 -> 选择模板 -> 下载 -> 解压 -> 删除压缩包 -> 重写package.json
3. package-operating：分入口（single or mult ？） -> Loader -> 分离css、js 及优化 -> 插件（custom plugins） 
4. `dev`：打包至内存 -> 读取并开启本地服务（mockjs、engine.js 挂载） -> （running）监听文件变化并作相应处理
5. `build`：打包 -> engine.js注入 -> stats信息输出
6. mockjs、ts、eslint选择性开启

## 3.detail
##### mock.js：
> 使用require的变量 -> 使用require引用 -> （app._router.stack ）判断 增删路由
##### 文件监听：
> dev启动时监听mock或engine文件修改 -> 触发一些动作 -> 浏览器刷新（appleScript）
##### InjectEngine注入：
> webapck的emit阶段，若执行build将process.cwd()/engine.js生成到dist/publicPath/engine.js，并在html内注入引用；若为dev，考虑到dev的“读取”问题，生成html的engine会更改与disk上dist包内不同于engine的名字避免读取。

## 4.choice
##### 1）使用engine的全局变量而不是执行webpack时替换。
* 优点：测试包与线上包完全一致
* 缺点：HTML内无法去替换
##### 2）esLint的loader加载代替esLint NodeApi
> 使用nodeApi可以自定义处理eslint相关操作并决定输出，但无法解析 .vue 文件，目前存在两种常规解析特殊文件类型的方法 ：
* 命令行执行 —ext
* 使用loader
##### 3）eslint是否提供更加精细的控制
> src -> eslintA、 src/b -> eslintB、src/e/d -> eslintC

## 5.备注
1. dev阶段，mockjs更新时将该文件同步到dist内dist/**/mockjs，而不是修改html内mockjs的引入名
2. 输出dist内vendorjs过大优化
3. scss在使用vueloader提取commoncss时仍然保留在原文件内的问题
4. engine.js需要hash值的线上缓存问题（在这里仍然不使用replace-html-plugin）
5. 多级路由问题（最高支持3级，够用了）
6. 添加react Vue的ts支持
7. 开发一个emplate_vue_elegant（内含多种实用小功能）
8. 修改流式下载
9. mockjs目前只支持GET的请求
	