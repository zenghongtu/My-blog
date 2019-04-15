---
title: 一个纯 CSS 实现的'简约'搜索框
category: "CSS"
cover: photo-1491485880348-85d48a9e5312.jpeg
author: Jason Zeng
---



> 这几天在尝试用`electron`来做一个桌面端的词典，装了 n 个词典来参(chao)考(xi)一下交互。感觉金山词霸的搜索框用起来'都挺好'，用 JS 来实现很简单，但我们稍微挑战一下，用纯 CSS 来实现一个。


首先来看一下效果：

![Kapture 2019-04-05 at 18](_v_images/20190405185107197_1118589418.gif)

在线地址：[https://codesandbox.io/s/xlm6mq58p4](https://codesandbox.io/s/xlm6mq58p4)

## 需求分析

从交互中可以获取到以下信息：

1. 默认情况下搜索 icon 居中

这个很 easy，我们有多达五六七八种方法实现。

不过我们这里考虑到需要对 icon 进行滑动，使用万金油式的`position: absolution + transform`来实现。

2. 点击它会滑动到左侧，输入框获取焦点，并出现 placeholder

滑动效果我们可以通过伪类`:focus`来获取点击，配上`transition`，再修改`left`值即可实现。

难点在于 placeholder 的显示，在未点击之前需要把它隐藏起来。但还好我们有好几个用来隐藏元素的 css 属性，常见的有`display: none`、`opacity: 0`、`visiblity: hidden`等。我们用一个更简单的`color:transparent;`就可以了。

3. 在输入文字后会显示清除 icon

这里我们啥也不用干，直接使用`type="search"`时 input 自带的清除 icon

4. 在清除文字后，如果失去焦点搜索 icon 会居中

这个我们啥也不用干，在失去焦点后，icon 会自动居中


**看起来似乎就这么轻松的实现了，是不是真的这样呢，让我们把代码写下来看看**

## 实现需求

我们来一个一个实现：

```
// ...
function App() {
  return (
    <div className={styles.container}>
      <input
        className={styles.searchInput}
        placeholder={"查单词"}
        type="text"
      />
      <div className={styles.searchIcon}>
        <SearchIcon />
      </div>
    </div>
  );
}
// ...
```

1. 默认情况下搜索 icon 居中

```
.container {
  position: relative;
  padding:0;
  height:38px;
  width:400px;
  font-size:16px;

  .searchInput{
    width:100%;
    height:100%;
    padding:0 38px;
    box-sizing: border-box;
    border-radius: 20px;
    outline:none;
    border:none;
  }
  .searchIcon{
    position: absolute;
    left:50%;
    top:50%;
    transform: translate(-50%,-50%);
  }
}
```

2. 点击它会滑动到左侧，并出现 placeholder

```
.container {
  position: relative;
  padding:0;
  height:38px;
  width:400px;
  font-size:16px;

  .searchInput{
    width:100%;
    height:100%;
    padding:0 38px;
    box-sizing: border-box;
    border-radius: 20px;
    outline:none;
    border:none;

    &::placeholder {
      transition:all ease-in .5s;
      color:transparent;
    }
    &:focus{
      &::placeholder{
        color:#111;
      }
      & + .searchIcon{
        left:25px;
      }
    }
  }
  .searchIcon{
    position: absolute;
    left:50%;
    top:50%;
    transform: translate(-50%,-50%);
    transition: left ease-out .5s;
  }
}
```

3. 在输入文字后会显示清除 icon
啥也不用做

4. 在清除文字后，如果失去焦点搜索 icon 会回到中间
啥也不用做


让我们来看一下效果：

![Kapture 2019-04-05 at 18](_v_images/20190405182233230_11448089.gif)


### 发现问题

好像基本实现了，但是，当我们文字没有被清除却失去了焦点，是怎么样呢？

![Kapture 2019-04-05 at 18](_v_images/20190405182820684_1498231301.gif)

可以发现，存在一个问题就是当文字没有被清除，icon 还是会回到中间位置，而且还有一个问题就是点击输入框如果是在图标上会被遮住，无法让输入框获取焦点。

### 解决问题

首先我们来解决输入框没有被清除，icon 回位置的问题。

如果我们能判断输入框中还存在文字就可以不让 icon 回去，但是在 input 中并没有存在可以检测是否为空的属性或伪类（:empty 在 input 为 search 时用不了）。似乎在这里就是走进死胡同了，我们尝试看一下有没有其他属性或者伪类可以用的上的。

上 MDN 翻一下发现还当真有一个 -- ·:placeholder-shown·属性可以判断·placeholder·是否显示，通过它可以间接判断输入框是否失去焦点。

加上这一段

```
   &:not(:placeholder-shown){
      & + .searchIcon{
        left:25px;
      }
    }
```


对于icon 遮挡问题，我们直接用 `pointer-events: none;`轻松解决。


让我们再测试一下，没有啥问题，搞定！

![Kapture 2019-04-05 at 18](_v_images/20190405184552732_1194162492.gif)



