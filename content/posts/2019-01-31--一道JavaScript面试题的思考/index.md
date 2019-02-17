---
title: 一道 JavaScript 面试题的思考
category: "思考"
cover: photo-1549556289-9706946b9c56.jpeg
author: Jason Zeng
---
*前言：昨天在群里讨(jin)论(chui)技(niu)术(pi)，有位老铁发了一道他面的某公司面试题，顺手保存了。今早花了一点时间把这题做了出来，发现挺有意思的，决定在今天认真工（hua)作(shui)前，与大家分享我的解题方案和思考过程。*

题目如下（可以自己先思考一会,没准可以想出比我更好的方法）：
<img width="891" alt="wechatimg4088" src="https://user-images.githubusercontent.com/25629121/51982440-f7c21500-24d0-11e9-9bd9-6021b0c287f5.png">
---

---


小眼一撇，这几个需求都是要实现链式调用，而链式调用最常见的是 jQuery，还有就是我们非常熟悉的 Promise。

*jQuery中链式调用的原理是在函数的末尾`return this`（即返回这个对象自身），使得对象可以继续调用自身的函数从而达到支持链式调用。*

知道了这个套路之后，接下来我们可以按照这个套路飞快的先写出符合第一个小需求的函数。

```js
const LazyMan = function (name) {
  console.log(`Hi i am ${name}`);
}
LazyMan('Tony')
// Hi i am Tony
```

虽然只有短短三行代码，但没有报一点错，而且运行起来飞快的，完美的实现了第一个小需求。

![f3d57c6ca0419d41e3cbbf21013c7f74](https://user-images.githubusercontent.com/25629121/51982641-89318700-24d1-11e9-81a7-5cd9b56085f8.png)

某路人：“等等，，不就是一个简单的函数，套路用在哪呢？”

啧啧，被你发现了，小伙子不错嘛，好，现在就用链式调把第二个小需求实现了：

```js
  const LazyMan = function (name) {
    console.log(`Hi i am ${name}`);
    class F {
      sleep(timeout) {
        setTimeout(function () {
          console.log(`等待了${timeout}秒`);
          return this;
        }, timeout)
      };

      eat(food) {
        console.log(`I am eating ${food}`);
        return this;
      }
    }
    return new F();
  }

LazyMan('Tony').sleep(10).eat('lunch')
```

丢浏览器里面跑一下，一段红条条蹦了出来
> `Uncaught TypeError: Cannot read property 'eat' of undefined`

![15e8c84a9fea062128e753880fd5b7d4](https://user-images.githubusercontent.com/25629121/51982695-b2521780-24d1-11e9-9e39-59f7f8553eb9.jpg)

纳尼，`eat`为什么会在`undefined`上调用，我不是在`sleep`中返回了`this`么！？是不是 Chrome 又偷偷更新，加了一个新 bug，，，

![72270bb84093d8a24f43db9d53271db3](https://user-images.githubusercontent.com/25629121/51982761-da417b00-24d1-11e9-89c2-613a849aed3d.jpg)

不过 google 工程师应该没有这么不靠谱吧。难道是我写错了？

![deb0ffca089deb1792b55c5ddee9cadd](https://user-images.githubusercontent.com/25629121/51982818-02c97500-24d2-11e9-9353-092c7eaedb3a.jpg)

扫一遍代码，发现`return this`是在`setTimeout`中的处理函数返回的，而不是`sleep`返回的，小改一下。

```js
// ...
sleep(timeout) {
        setTimeout(function () {
          console.log(`等待了${timeout}秒....`);
        }, timeout)
        return this;
      };
// ...
```

再跑一下，没有红条条了，嘿。

![e2c3a63d35170ef73750e4bd8eab32c3](https://user-images.githubusercontent.com/25629121/51982886-2f7d8c80-24d2-11e9-9c0b-3c4f672acc78.jpg)

但仔细一看，跟需求中的顺序不一致，我们现在的输出是这样的：
```js
Hi i am Tony
I am eating lunch
等待了10秒
```
![e9620866e9a465cf73c79675ac398057](https://user-images.githubusercontent.com/25629121/51982989-8c794280-24d2-11e9-995d-c3594b693d87.jpeg)

emmmmm，看来，现在得拿出一点 JavaScript 硬本事了。

JavaScript 中有同步任务和异步任务，同步任务就是按照我们编写顺序推入执行栈，一步一步执行；而`setTimeout`属于异步任务，在浏览器中是由定时触发器线程负责，这个线程会进行计时，当计时完成后将这个事件的`handler`推入到任务队列中，任务队列中的任务需要等待执行栈中为空时把队列中的任务丢入执行栈中进行执行（从这里也可以知道`handler`并不能准时执行）。
（随手画了一张草图，有点丑，不过应该不影响我想要表达的意思）

![xnip2019-01-30_15-29-45](https://user-images.githubusercontent.com/25629121/51983051-b92d5a00-24d2-11e9-98c8-92344977d88f.jpg)

如果不太了解，可以参考这篇文章  [这一次，彻底弄懂 JavaScript 执行机制](https://juejin.im/post/59e85eebf265da430d571f89) ，写的非常易懂了

知道了这个知识后，然并卵，它不能帮我们写出所需要的代码。。。

![688b227c69e52211c43d0bd123d9b4a2](https://user-images.githubusercontent.com/25629121/52023546-6c7c6a00-2538-11e9-924d-c813b2b1f573.jpg)

在空气安静了数十分钟后，我还是毫无头绪，只好拿起杯子，准备起身去倒杯水压压惊，突然犹有一道闪电击到了我一般，脑海中浮现了 vue 中实现`nextTick`这一方法实现的代码，代码虽模糊不清（我根本记不清楚了），但我造这应该可以帮助我解决点什么问题。so，我放下杯子，熟练的打开某 hub，在里面找到了`nextTick`的实现代码（在这里[next-tick.js](https://github.com/vuejs/vue/blob/dev/src/core/util/next-tick.js))。
快速从第一行到最后一行扫了一遍，可以获取到的东东是：它用一个`callbacks`数组存储需要执行的函数，然后利用`micro task`和`macro task`的优先级特性，从而可以在 DOM 渲染之前执行`callbacks`中的回调。emmmmm，跟我现在的需求好像扯不上什么关系，并不能给什么帮助。不过我也可以把需要执行的函数加入一个数组中，在最后执行它。说干就干，可以快速写出如下代码：

```js
  const LazyMan = function (name) {
    console.log(`Hi i am ${name}`);
    function _eat(food){
      console.log(`I am eating ${food}`);
    }
    const callbacks = [];
    class F {
      sleep(timeout) {
        setTimeout(function () {
          console.log(`等待了${timeout}秒....`);
          callbacks.forEach(cb=>cb())
        }, timeout);
        return this;

      };

      eat(food) {
        callbacks.push(_eat.bind(null,food));
        return this;
      }
    }
    return new F();
  };

  LazyMan('Tony').sleep(10).eat('lunch')
  // Hi i am Tony
  // 等待了10秒....
  // I am eating lunch

```
执行完，输出跟需求一模一样，嘿嘿嘿。

![6ba543ba4849600fd8a029c7bd2eebc7](https://user-images.githubusercontent.com/25629121/52023623-c8df8980-2538-11e9-843b-7f8582a41c31.jpeg)

接着按照第三个小需求执行一下，结果如下：
```js
//...

LazyMan('Tony').eat('lunch').sleep(10).eat('dinner')

// Hi i am Tony
// 等待了10秒
// I am eating lunch
// I am eating dinner

//...
```
没有报错，很好，但顺序又错了。。。这可不好办。
眼看着空气又要安静下来了，我不能干耗着，决定使用一些常用套路了，比如加个`flag`，区分是否是需要在 `sleep `之后执行的方法，改写后如下：
```js
  const LazyMan = function (name) {
    console.log(`Hi i am ${name}`);

    function _eat(food) {
      console.log(`I am eating ${food}`);
    }
    const callbacks = [];
    let isNeedSleep = false;
    class F {
      sleep(timeout) {
        setTimeout(function () {
          console.log(`等待了${timeout}秒`);
          callbacks.forEach(cb => cb())
        }, timeout);
        isNeedSleep = true;
        return this;
      };
      eat(food) {
        if (isNeedSleep) {
          callbacks.push(_eat.bind(null, food));
        } else {
          _eat.call(null, food);
        }
        return this;
      }
    }
    return new F();
  };
```

跑一下，跟第三个小需求输出一模一样，嘿嘿嘿，小菜一碟。

![0a8487ab892816b7af21ae91d4bc1256](https://user-images.githubusercontent.com/25629121/52023687-178d2380-2539-11e9-89f4-b1e4e63563cf.jpg)

到最后这个小需求中，链式调用中多了一个`sleepFirst`，其效果是会将`sleep`提至链式调用的最前端来执行，也就是说`sleepFirst`的优先级最高。

![fa075ddbe8b2aa4a67afce496acfa019](https://user-images.githubusercontent.com/25629121/52023763-6470fa00-2539-11e9-9dd6-7447c7f76a8a.jpg)

容我思考一下： 能够根据优先级来操作的数据结构，在我所知的范围内只有优先队列，而优先队列可以用数组来实现，so，是不是说可以用数组来实现优先级`callbacks`的调用，即用嵌套数组。答曰：你想的没有错啦。

撸起袖子继续干，于是数分钟后有了下面这个函数

```js
  const LazyMan = function (name) {
    console.log(`Hi i am ${name}`);

    function _eat(food) {
      console.log(`I am eating ${food}`);
    }
    const callbackQueue = [];
    let index = 0;
    class F {
      sleep(timeout) {
        const _callbacks = callbackQueue.shift();
        _callbacks && _callbacks.forEach(cb => cb());
        setTimeout(function () {
          console.log(`等待了${timeout}秒....`);
          const _callbacks = callbackQueue.shift();
          _callbacks && _callbacks.forEach(cb => cb())
        }, timeout);
        index ++;
        return this;
      };
      eat(food) {
        if(!callbackQueue[index]) callbackQueue[index] = [];
        callbackQueue[index].push(_eat.bind(null, food));
        return this;
      };
      sleepFirst(timeout){
        setTimeout(function () {
          console.log(`等待了${timeout}秒....`);
          const _callbacks = callbackQueue.shift();
           _callbacks && _callbacks.forEach(cb => cb())
        }, timeout);
        index ++;
        return this;
      }
    }

    return new F();
  };
```

我的想法是 每经过一次`sleep`后，`index`会+1，表示有新的一组`callback`，当执行`eat`时，判断是否存在当前`index`对应的数组，不存在则创建一个对应的空数组，然后把对应需要调用的函数添加入这个数组中，最后把这个数组存到`callbackQueue`中，当添加完成后，会按照顺序一步一步从`callbackQueue`中取出并执行。

虽然我思路这思路应该是对的，但我还是隐隐约约感觉到了里面蕴含的红条条，先丢浏览器中跑一下试试。

结果如下：
```js
Hi i am Tony
I am eating lunch
I am eating dinner
等待了5秒....
等待了10秒....
```

果然，没有按照所需的顺序执行，因为这里还是没有能够处理`sleepFirst`优先级的这个根本问题。。。

等等。。。我刚刚说了啥，'优先级'，咱们往上翻，我前面好像提到过这个词！

![e38e86c1bed2f9243738c1b412a27bd1](https://user-images.githubusercontent.com/25629121/52024091-756e3b00-253a-11e9-9e5b-c8812a162594.jpeg)

没错，`vue`中的`nextTick`中就用到了，我们可以参考它，利用`Event Loop`中`micro task`和`macro task`执行的优先级来解决这个问题。

```js
  const LazyMan = function (name) {
    console.log(`Hi i am ${name}`);

    function _eat(food) {
      console.log(`I am eating ${food}`);
    }

    const callbackQueue = [];
    let index = 0;

    class F {
      sleep(timeout) {
        setTimeout(() => {
          const _callbacks = callbackQueue.shift();
          _callbacks && _callbacks.forEach(cb => cb());
          setTimeout(function () {
            console.log(`等待了${timeout}秒....`);
            const _callbacks = callbackQueue.shift();
            _callbacks && _callbacks.forEach(cb => cb())
          }, timeout);
        })
        index++;
        return this;
      };

      eat(food) {
        if (!callbackQueue[index]) callbackQueue[index] = [];
        callbackQueue[index].push(_eat.bind(null, food));
        return this;
      };

      sleepFirst(timeout) {
        Promise.resolve().then(() => {
          const _callbacks = callbackQueue.shift();
          setTimeout(function () {
            console.log(`等待了${timeout}秒....`);
            _callbacks && _callbacks.forEach(cb => cb())
          }, timeout);
        })
        index++;
        return this;
      }
    }

    return new F();
  };

```

丢浏览器执行一下，完全冇问题，丢 node 中也一样，欧耶，完美。

![f70ed1ce5995e0061c3edcc645516d1e](https://user-images.githubusercontent.com/25629121/52024115-9171dc80-253a-11e9-9044-cc7770f50613.png)

最后画几张粗糙的图，简单描述一下这个执行的过程：

![xnip2019-01-30_19-52-31](https://user-images.githubusercontent.com/25629121/52024199-ddbd1c80-253a-11e9-9348-48c9f257c0c4.jpg)


因为是链式调用，所以在链上的都会入栈然后执行，额，执行栈少画了 sleep 和 sleepFirst。。。

```js
Hi i am Tony
```
其中 setTimeout 的 handler 为宏任务，加入`marco task`队列中；`Promise.resolve().then`的回调为微任务，加入`micro task`队列中

![xnip2019-01-30_19-52-59](https://user-images.githubusercontent.com/25629121/52024203-e150a380-253a-11e9-9619-8be4fe71a9b6.jpg)


然后执行栈被清空，`micro task`中未清空的任务加入执行栈中被执行，

![xnip2019-01-30_19-54-10](https://user-images.githubusercontent.com/25629121/52024213-eca3cf00-253a-11e9-82de-9f5b1412ffc4.jpg)

因为其中有一个 setTimeout，所以把其 handler 加入`macro task`中


![xnip2019-01-30_19-54-34](https://user-images.githubusercontent.com/25629121/52024214-eca3cf00-253a-11e9-88f5-596219cdd6bb.jpg)

前面的微任务执行完就出栈了，这时候`macro task`中第一个任务入执行栈中进行执行

这个时候如果有 `callbacks` 就会执行

![xnip2019-01-30_19-55-33](https://user-images.githubusercontent.com/25629121/52024215-ed3c6580-253a-11e9-9bba-0497bfe6a012.jpg)



因为函数内部又有一个 setTimeout，于是把它的 handler 加入`macro task`中

![xnip2019-01-30_19-56-09](https://user-images.githubusercontent.com/25629121/52024216-ed3c6580-253a-11e9-8ba3-a3828bb0d15c.jpg)

然后清空执行栈，继续执行下一个宏任务
```js
等待了5秒....
I am eating lunch
I am eating dinner
```

![xnip2019-01-30_19-56-25](https://user-images.githubusercontent.com/25629121/52024217-edd4fc00-253a-11e9-8194-a959dfda2420.jpg)


执行栈为空，把最后一个宏任务丢进栈中执行
```js
等待了10秒....
I am eating junk food
```

---

---

最后总结一下，这道题的难点是能否想到用`event loop`来解决，如果能往这方向去想了，做起来就很简单了。

还有平时不怎么动笔的（比如我），一开始写起文章来就会如鲠在喉，许多内容都写漏了。所以平时有时间就要多动动笔，写写文章，但也不是说东拼西凑一篇，而是真的要有自己的思考和感悟。

---

---

最最最后给各位看官老爷多添加一个小需求练练手：
```
 LazyMan('Tony').eat('lunch').eat('dinner').sleepFirst(5).sleep(10).eat('junk food').eat('healthy food')
 // Hi i am Tony
 // 等待了5秒
 // I am eating lunch
 // I am eating dinner
 // 等待了10秒
 // I am eating junk food
 // I am eating healthy food
```
