1、运行此代码须安装node6.x （放在Other\Bin\node）, 注意:如之前已安装低版本的nodejs请先进行卸载操作，版本查看命令: node -v

2、将npm的版本升级为4.5（版本查看命令: npm -v）, 命令: npm install -g npm@4.5.0

3、之前未安装webpack的需要全局安装一次，如果已安装请忽略，命令: npm install webpack -g , 完成后输入webpack -v 显示版本号(目前版本号为3.0.0)	即安装成功，否则安装失败

4、node安装完成后 copy web下面的全部内容至你指定文件夹（也可以直接以Web目录做为工程根目录新建工程）

5、cd 到该文件夹下， 命令行输入:npm install --registry=http://registry.npm.taobao.org 对项目的依赖进行下载安装

6、命令行输入: npm start 即可启动该项目



注意事项:
1.有时服务器会不稳定，如果npm install报错可以尝试换其它的镜象地址，或者多尝试几次
例如: npm install --registry=http://registry.cnpmjs.org
或者: npm install 直接使用官方仓库进行安装，官网服务器虽然慢一些但比国内的镜像服务器可靠

2.提示:Can't find Python executable "python" 则说明需要先安装python2.7, 下载地址:https://www.python.org/download/releases/2.7/
安装完成后需要自行配置环境变量，配置完成后在命令行cmd下输入: python -V ， 如果打印出版本信息说明配置成功



VUE官方说明：

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
