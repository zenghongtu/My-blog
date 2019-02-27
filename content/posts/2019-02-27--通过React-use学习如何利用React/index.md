---
title: 通过React-use学习如何利用React
category: "hooks造轮子"
cover: photo-1487017159836-4e23ece2e4cf.jpeg
author: Jason Zeng
---

前言：昨天花了小半天时间，把github 上一个 React hooks 的轮子集合 [react-use](https://github.com/streamich/react-use)里面的文档给翻译了一下。顺便看了一下它其中一些 hook 的实现原理。在这里挑几个不错的钩子来分析一下。

## 状态钩子

### useGetSet

通过返回`get`函数代替它本身的函数，减少一些小bug 的出现，比如说，一个 button 的快速多次点击，如果是用 react 自带的`setState`，因为是异步的，所以不会按照点击的次数来更新，而是隔一会更新一下，但是用这个函数就不会有这个问题了。它跟 vuex 中的 Getter 差不多。

```typescript
import {useGetSet} from 'react-use';

const Demo = () => {
  const [get, set] = useGetSet(0);
  const onClick = () => {
    setTimeout(() => {
      set(get() + 1)
    }, 1_000);
  };

  return (
    <button onClick={onClick}>Clicked: {get()}</button>
  );
};
```

原理也非常的简单

```typescript
import {useRef, useCallback} from 'react';
import useUpdate from './useUpdate';

const useGetSet = <T>(initialValue: T): [() => T, (value: T) => void] => {
  let state = useRef(initialValue);
  const update = useUpdate();
  const get = useCallback(() => state.current, []);
  const set = useCallback((value: T) => {
    state.current = value;
    update();
  }, []);

  return [get, set];
};

export default useGetSet;
```

通过`useRef`记录值，`useUpdate`来更新，`useCallback`缓存函数

```typescript
import {useState} from 'react';

const useUpdate = () => {
  const [, setState] = useState(0);
  return () => setState(cnt => cnt + 1);
};

export default useUpdate;

```

`useUpdate`中通过调用一个自增数字从而实现状态改变引起页面的更新。

### useSetState

这个钩子是模拟类中的`setState`，把新的`state`和旧的`state`合并，返回一个全新的 `state`。

```typescript
const [state, setState] = useSetState({cnt: 0});

setState({cnt: state.cnt + 1});
setState((prevState) => ({
  cnt: prevState + 1,
}));
```

直接看源码：

```typescript
import {useState} from 'react';

const useSetState = <T extends object>(initialState: T = {} as T): [T, (patch: Partial<T> | Function) => void]=> {
  const [state, set] = useState<T>(initialState);
  const setState = patch => {
    set(prevState => Object.assign({}, prevState, patch instanceof Function ? patch(prevState) : patch));
  };

  return [state, setState];
};

export default useSetState;
```

核心代码是` set(prevState => Object.assign({}, prevState, patch instanceof Function ? patch(prevState) : patch));`，对入参进行判断，如果是函数就把旧的`state`传入，否则直接合并。

## 副作用钩子

### useAsync

这个钩子能够接收函数或者异步函数，然后返回一个 promise 函数。

```typescript
import {useAsync} from 'react-use';

// Returns a Promise that resolves after one second.
const fn = () => new Promise((resolve) => {
  setTimeout(() => {
    resolve('RESOLVED');
  }, 1000);
});

const Demo = () => {
  const state = useAsync(fn);

  return (
    <div>
      {state.loading?
        <div>Loading...</div>
        : state.error?
        <div>Error...</div>
        : <div>Value: {state.value}</div>
      }
    </div>
  );
};
```

源码如下：

```typescript
import {useState, useEffect, useCallback} from 'react';

export type AsyncState<T> =
| {
  loading: true;
  error?: undefined;
  value?: undefined;
}
| {
  loading: false;
  error: Error;
  value?: undefined;
}
| {
  loading: false;
  error?: undefined;
  value: T;
};

const useAsync = <T>(fn: () => Promise<T>, args?) => {
  const [state, set] = useState<AsyncState<T>>({
    loading: true,
  });
  const memoized = useCallback(fn, args);

  useEffect(() => {
    let mounted = true;
    set({
      loading: true,
    });
    const promise = memoized();

    promise
      .then(value => {
        if (mounted) {
          set({
            loading: false,
            value,
          });
        }
      }, error => {
        if (mounted) {
          set({
            loading: false,
            error,
          });
        }
      });

    return () => {
      mounted = false;
    };
  }, [memoized]);

  return state;
};

export default useAsync;
```

 其中`mouted`用来记录该组件是否已经挂载，如果再`promise`运行时取消了，`mounted`为`false`，就不会调用更新状态了。而`const memoized = useCallback(fn, args);`则是缓存了这个函数，如果下次输入的入参相同，则返回同一个函数。

## 生命周期钩子

### useLifecycles

这个钩子在`mount`和`unmount`时，可以调用指定的回调函数。

使用方式如下：

```typescript
import {useLifecycles} from 'react-use';

const Demo = () => {
  useLifecycles(() => console.log('MOUNTED'), () => console.log('UNMOUNTED'));
  return null;
};
```

利用了`useEffect`，所以源码特别简单：

```typescript
import {useEffect} from 'react';

const useLifecycles = (mount, unmount?) => {
  useEffect(() => {
    if (mount) mount();
    return () => {
      if (unmount) unmount();
    };
  }, []);
};

export default useLifecycles;
```


