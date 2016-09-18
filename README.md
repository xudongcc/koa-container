这是一个 Koa 框架的依赖容器，将 koa middleware 中的`context`替换为一个依赖容器。

## 安装
```
npm install @xudong/koa-container --save
```
## 使用方法
```
const koa = require('koa');
const container = require('koa-container');

const app = new koa();
container(app);

...
```
## 容器API
### 注册服务
通过`set(name, service)`方法设置服务
```
ctx.set('date', function () {
    return new Date();
});
```
也可以直接设置属性名来注册服务
```
ctx.date = function () {
    return new Date();
};
```
如果服务就是一个对象可以直接赋值
```
ctx.date = new Date();
```
### 获取服务(共享实例)
通过`get(name)`方法获取服务实例
```
var date = ctx.get('date');
console.log(date);
```
也可以直接设置属性名来获取服务
```
var date = ctx.date;
console.log(date);
```
### 生成一个服务实例(非共享实例)
```
var date1 = ctx.get('date');
var date2 = ctx.make('date');
var date3 = ctx.make('date');

console.log(date1 === date2);   // false
console.log(date2 === date3);   // false
```
### 服务别名
```
var people = {
    this.name = 'xudong',
    getName: function () {
        return this.name;
    }
};

ctx.set('people', people);
ctx.alias('human', 'people');

console.log(ctx.human.getName());   // xudong;
```
服务别名支持使用`.`来别名已注册的服务的属性与方法
```
var people = {
    this.name = 'xudong',
    getName: function () {
        return this.name;
    }
};

ctx.set('people', people);
ctx.alias('getName', 'people.getName');

console.log(ctx.getName());   // xudong;
```