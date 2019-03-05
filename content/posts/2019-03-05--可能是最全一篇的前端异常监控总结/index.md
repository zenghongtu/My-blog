---
title: 可能是最全一篇的前端异常监控总结
category: "前端监控"
cover: photo-1484544808355-8ec84e534d75.jpeg
author: Jason Zeng
---


> 前言：这几天把公司的项目清理了一下，对一些细节进行了优化，然后翻到了之前做的时候留下了一点笔记，顺手整理一下就诞生了这篇总结~

## 异常捕获

###  try-catch

```JavaScript
try {
  error    // 未定义变量
} catch(e) {
  console.log('我知道错误了');
  console.log(e);
}
```

 try-catch 处理异常的能力有限，只能捕获捉到运行时非异步错误，对于语法错误和异步错误就显得无能为力，捕捉不到。

### window.onerror

```JavaScript
window.onerror = function (msg, url, row, col, error) {
  console.log('我知道异步错误了');
  console.log({
    msg,  url,  row, col, error
  })
  return true;
};
setTimeout(() => {
  error;
});
```

window.onerror 捕获异常能力比 try-catch 稍微强点，无论是异步还是非异步错误，onerror 都能捕获到运行时错误。

然而 window.onerror 对于语法错误还是无能为力，所以我们在写代码的时候要尽可能避免语法错误的，不过一般这样的错误会使得整个页面崩溃，还是比较容易能够察觉到的。

#### onerror 与 try-catch 区别

在实际的使用过程中，onerror 主要是来捕获预料之外的错误，而 try-catch 则是用来在可预见情况下监控特定的错误，两者结合使用更加高效。

#### window.onerror 细节

- onerror 函数只有在返回 true 的时候，异常才不会向上抛出，否则即使是知道异常的发生控制台还是会显示 Uncaught Error: xxxxx。
- 对于 onerror 这种全局捕获，最好写在所有 JS 脚本的前面，因为你无法保证你写的代码是否出错，如果写在后面，一旦发生错误的话是不会被 onerror 捕获到的。
- onerror 是无法捕获到网络异常的错误（静态资源加载可以用 DOM2级事件监听）

    ```JavaScript
    <script>
      window.onerror = function (msg, url, row, col, error) {
        console.log('我知道异步错误了');
        console.log({
          msg,  url,  row, col, error
        })
        return true;
      };
    </script>
    <img src="./404.png">
    ```

### addEventListener('error')

通过addEventListener('error')监控静态资源加载，由于网络请求异常不会事件冒泡，因此必须在捕获阶段将其捕捉到才行，而且无法判断错误状态码，所以还需要配合服务端日志才能进行排查分析。

缺点：仍然无法捕获异常时网络请求的状态码

```JavaScript
<script>
window.addEventListener('error', (msg, url, row, col, error) => {
  console.log('我知道 404 错误了');
  console.log(
    msg, url, row, col, error
  );
  return true;
}, true);
</script>
<img src="./404.png" alt="">
```

#### window.addEventListener('error')与window.onerror的区别

1. 前者能够捕获到资源加载错误，后者不能。
2. 都能捕获js运行时错误，捕获到的错误参数不同。前者参数为一个event对象；后者为 msg, url, lineNo, columnNo, error一系列参数。event对象中都含有后者参数的信息。


#### ajax 封装

所有http请求都是基于xmlHttpRequest或者fetch封装的。所以要捕获全局的接口错误，方法就是封装xmlHttpRequest或者fetch

- 封装xmlHttpRequest：

    ```JavaScript
    if(!window.XMLHttpRequest) return;
    var xmlhttp = window.XMLHttpRequest;
    var _oldSend = xmlhttp.prototype.send;
    var _handleEvent = function (event) {
        if (event && event.currentTarget && event.currentTarget.status !== 200) {
              // 自定义错误上报 }
    }
    xmlhttp.prototype.send = function () {
        if (this['addEventListener']) {
            this['addEventListener']('error', _handleEvent);
            this['addEventListener']('load', _handleEvent);
            this['addEventListener']('abort', _handleEvent);
        } else {
            var _oldStateChange = this['onreadystatechange'];
            this['onreadystatechange'] = function (event) {
                if (this.readyState === 4) {
                    _handleEvent(event);
                }
                _oldStateChange && _oldStateChange.apply(this, arguments);
            };
        }
        return _oldSend.apply(this, arguments);
    }
    ```

- 封装fetch：

    ```JavaScript
    if(!window.fetch) return;
        let _oldFetch = window.fetch;
        window.fetch = function () {
            return _oldFetch.apply(this, arguments)
            .then(res => {
                if (!res.ok) { // True if status is HTTP 2xx
                    // 上报错误
                }
                return res;
            })
            .catch(error => {
                // 上报错误
                throw error;  
            })
    }
    ```

## Promise 错误

通过 Promise 可以帮助我们解决异步回调地狱的问题，但是一旦 Promise 实例抛出异常而你没有用 catch 去捕获的话，onerror 或 try-catch 也无能为力，无法捕捉到错误。

```JavaScript
window.addEventListener('error', (msg, url, row, col, error) => {
  console.log('我感知不到 promise 错误');
  console.log(
    msg, url, row, col, error
  );
}, true);
Promise.reject('promise error');
new Promise((resolve, reject) => {
  reject('promise error');
});
new Promise((resolve) => {
  resolve();
}).then(() => {
  throw 'promise error'
});
```

1. 可以添加一个 Promise 全局异常捕获事件 unhandledrejection：

    ```JavaScript
    window.addEventListener("unhandledrejection", function(e){
      e.preventDefault()
      console.log('我知道 promise 的错误了');
      console.log(e.reason);
      return true;
    });
    Promise.reject('promise error');
    new Promise((resolve, reject) => {
      reject('promise error');
    });
    new Promise((resolve) => {
      resolve();
    }).then(() => {
      throw 'promise error'
    });
    ```
2. 借助 try-catch封装

    ```JavaScript
    // 如果浏览支持Promise，捕获promise里面then的报错，因为promise里面的错误onerror和try-catch都无法捕获
    if (Promise && Promise.prototype.then) {
        var promiseThen = Promise.prototype.then;

        Promise.prototype.then = function(resolve, reject) {
            return promiseThen.call(this, _wrapPromiseFunction(resolve), _wrapPromiseFunction(reject));
        }
    }

    /**
     * 输入一个函数，将函数内代码包裹进try-catch执行，then的resolve、reject和普通函数不一样
     * 
     * @param {any} fn 
     * @returns 一个新的函数
     */
    function _wrapPromiseFunction(fn) {

        // 如果fn是个函数，则直接放到try-catch中运行，否则要将类的方法包裹起来，promise中的fn要返回null，不能返回空函数
        if (typeof fn !== 'function') {
            return null;
        }

        return function () {
            try {
                return fn.apply(this, arguments);
            } catch (e) {
                _errorProcess(e);
                throw e;
            }
        };
    }
    ```


## iframe 错误

父窗口直接使用 window.onerror 是无法直接捕获，如果你想要捕获 iframe 的异常的话，有分好几种情况。

- 如果你的 iframe 页面和你的主站是同域名的话，直接给 iframe 添加 onerror 事件即可。

    ```JavaScript
    <iframe src="./iframe.html" frameborder="0"></iframe>
    <script>
      window.frames[0].onerror = function (msg, url, row, col, error) {
        console.log('我知道 iframe 的错误了，也知道错误信息');
        console.log({
          msg,  url,  row, col, error
        })
        return true;
      };
    </script>
    ```
- 如果你嵌入的 iframe 页面和你的主站不是同个域名的，但是 iframe 内容不属于第三方，是你可以控制的，那么可以通过与 iframe 通信的方式将异常信息抛给主站接收。与 iframe 通信的方式有很多，常用的如：postMessage，hash 或者 name 字段跨域等等
- 如果是非同域且网站不受自己控制的话，除了通过控制台看到详细的错误信息外，没办法捕获，这是出于安全性的考虑，你引入了一个百度首页，人家页面报出的错误凭啥让你去监控呢，这会引出很多安全性的问题。


## ES6 Class

我们是没办法把构造函数A直接装入try-catch中运行的，因为需要通过关键字new进行实例化，并创建新的作用域。

JavaScript中函数有个特殊的属性prototype，当函数作为构造函数是，prototype中的属性就成了实例化后的属性方法，而且这一属性对class同样生效。那么我们可以对React中class的prototype这个特殊属性的内容进行处理，对Component中的方法函数进行封装。

```JavaScript
/**
 * 封装React方法的错误处理,改成使用入参的prototype中是否有render生命周期函数来判断
 * @param  {object} Component 传入组件
 * @return {object} 返回包裹后的组件
 */
function _defineReact(Component) {

    var proto = Component.prototype;
    var key;

    // 封装本身constructor中的构造方法，React组件编译为ES5后是一个构造函数，ES6下面为class
    if (_isTrueFunction(Component)) {
        Component = wrapFunction(Component);
    }

    var componnetKeys = Object.getOwnPropertyNames(proto);

    // 支持ES6类的属性方法错误捕获
    for (var i = 0, len = componnetKeys.length; i < len; i++) {
        key = componnetKeys[i];
        proto[key] = wrapFunction(proto[key])
    }

    // 支持ES5下的属性方法错误捕获
    for (key in proto) {
        if (typeof proto[key] === 'function') {
            proto[key] = wrapFunction(proto[key]);
        }
    }

    return Component;
}

/**
 * 判断是否为真实的函数，而不是class
 * @param  {Function} fn [description]
 * @return {Boolean}     [description]
 */
function _isTrueFunction(fn) {

    var isTrueFunction = false;

    try {
        isTrueFunction = fn.prototype.constructor.arguments === null;
    } catch (e) {
        isTrueFunction = false;
    }

    for (var key in fn.prototype) {
        return false;
    }
    return isTrueFunction;
}
```

这样通过实例化产生的React组件中的内部方法中的错误就可以被捕获到了。即使代码不通过babel编译为ES5，class里面的异常也可以被捕获到。

```JavaScript
class component extends React.Component {
    componentDidMount(){
        var a = {};
        console.log(a.b.c);
    }
    render() {
        return <div>hello world</div>;
    }
}
export default _defineReact(component);
```


## 异常上报

主要有两种方式：

1. 通过 Ajax 发送数据
2. 动态创建 img 标签的形式

    ```JavaScript
    function report(error) {
      var reportUrl = 'http://xxxx/report';
      new Image().src = reportUrl + 'error=' + error;
    }
    ```


 在 CDN 下的脚本都是捕获到` Script error`异常，如何正确捕获异常？

 script 标签添加 crossOrigin 属性

``` JavaScript
const script = document.createElement('script');
script.crossOrigin = 'anonymous';
script.src = url;
document.body.appendChild(script);
```

如何解决一些类库中没有提供 crossOrigin 的能力？

劫持 document.createElement，从根源上为每个动态生成的脚本添加 crossOrigin 字段：

```JavaScript
document.createElement = (function() {
  const fn = document.createElement.bind(document);
  return function(type) {
    const result = fn(type);
    if(type === 'script') {
      result.crossOrigin = 'anonymous';
    }
    return result;
  }
})();
window.onerror = function (msg, url, row, col, error) {
  console.log('我知道错误了，也知道错误信息');
  console.log({
    msg,  url,  row, col, error
  })
  return true;
};
$.ajax({
  url: 'http://localhost:8081/data',
  dataType: 'jsonp',
  success: (data) => {
    console.log(data);
  }
})
```


## 其他

收集异常信息量太多，怎么办？

如果你的网站访问量很大，假如网页的 PV 有 1kw，那么一个必然的错误发送的信息就有 1kw 条，我们可以给网站设置一个采集率：

```JavaScript
Reporter.send = function(data) {
  // 只采集 30%
  if(Math.random() < 0.3) {
    send(data)      // 上报错误信息
  }
}
```


## 参考

[脚本错误量极致优化-监控上报与Script error](https://github.com/joeyguo/blog/issues/13)
[前端一站式异常捕获方案(全)](https://jixianqianduan.com/frontend-weboptimize/2018/02/22/front-end-react-error-capture.html)
[前端监听资源加载错误](http://hongweipeng.com/index.php/archives/1608/)
