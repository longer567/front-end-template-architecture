# lg-cli构建工具
使用lg-cli脚手架来创建基础项目并在此基础上开发

### 基础环境搭建
1. npm install
2. npm link 

### lg命令
- `lg init`: 查看所有模板项目
  
  输出:
  ```
  template_vue
  template_zepto
  template_react
  ...
  ```

- 可以通过在serve后面加入path、port来更加精准的操作它

    `lg serve` 默认3000端口的当前子目录

    `lg serve <path>` 部署指定目录

    `lg serve <path> -p <port>` 部署指定port的指定目录

- `lg dev`: 启动lg模板项目

- `lg build`: 构建lg模板项目的dist包

### 依赖文件

- `lg-config`

- `engine.js`

### 精确控制

- `mock.js`

- `.eslintrc.js`

- `.ts`

