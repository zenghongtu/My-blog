---
title: 快速了解react-hooks
category: "react"
cover: photo-1489389944381-3471b5b30f04.jpeg
author: Jason Zeng
---

> 前言：一直对这个新特性非常感兴趣，终于今天有时间，花了大半天时间，把 `Hooks`的官方教程过了一遍，收获颇多，惊叹这个新特性真 TM 好用，以后开发用这个怕是要起飞了😆。

### 状态钩子（State Hook）

```js
const [state, setState] = useState(initialState);
```

1. 多个`useState`时，`React`依赖于每次渲染时钩子的调用顺序都是一样的(存在与每个组件关联的“存储单元”的内部列表存放JavaScript对象)，从而实现钩子与状态的一一对应关系。
2. `setState()`接收新的`state`或者一个返回`state`的函数（`setCount(prevCount => prevCount - 1)}`）。
3. 不同于类组件中的`setState`，`useState`返回的`setState` 不会自动合并更新对象到旧的`state`中（可以使用`useReducer`）。
4. `useState`可以接收一个函数返回`initialState`，它只会在初次渲染时被调用。
5. 当`setState`中的`state`和当前的`state`相等（通过`Object.is`判断），将会退出更新。
6. 建议将一个状态根据哪些需要值一起变化拆分为多个状态变量。

```js
const [rows, setRows] = useState(createRows(props.count));  // `createRows()`每次将会渲染将会被调用
```

优化一下：

```js
const [rows, setRows] = useState(() => createRows(props.count));  // `createRows()`只会被调用一次
```
其中的`() => createRows(props.count)`会赋值给`rows`，这样就保证了只有在`rows`调用时，才会创建新的值。


### 作用钩子（Effect Hook）

```js
useEffect(didUpdate);
```

1. 相当于生命周期函数`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`的组合。
2. 可以返回一个函数(`cleanup`)用于清理。
3. 每次重新渲染都将会发生`cleanup phase`⏬

```js
useEffect(() => {
    ChatAPI.subscribeToFriendStatus(props.friend.id, handleStatusChange);
    return () => {
      ChatAPI.unsubscribeFromFriendStatus(props.friend.id, handleStatusChange);
    };
  });
```

```js
  componentDidMount() {
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  // ====== 原因在这里 ======
  componentDidUpdate(prevProps) {
    // Unsubscribe from the previous friend.id
    ChatAPI.unsubscribeFromFriendStatus(
      prevProps.friend.id,
      this.handleStatusChange
    );
    // Subscribe to the next friend.id
    ChatAPI.subscribeToFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }

  componentWillUnmount() {
    ChatAPI.unsubscribeFromFriendStatus(
      this.props.friend.id,
      this.handleStatusChange
    );
  }
```

```js
// Mount with { friend: { id: 100 } } props
ChatAPI.subscribeToFriendStatus(100, handleStatusChange);     // Run first effect

// Update with { friend: { id: 200 } } props
ChatAPI.unsubscribeFromFriendStatus(100, handleStatusChange); // Clean up previous effect
ChatAPI.subscribeToFriendStatus(200, handleStatusChange);     // Run next effect

// Update with { friend: { id: 300 } } props
ChatAPI.unsubscribeFromFriendStatus(200, handleStatusChange); // Clean up previous effect
ChatAPI.subscribeToFriendStatus(300, handleStatusChange);     // Run next effect

// Unmount
ChatAPI.unsubscribeFromFriendStatus(300, handleStatusChange); // Clean up last effect
```

4. `useEffect(() => {document.title = You clicked ${count} times;}, [count]); ` ，指定第二个参数（这里为[`count`]）变化时才发生`cleanup phase`，然后执行`effect`；
5. 上面情况，如果`useEffect`第二个参数为为`[]`则表示只运行一次(`componentDidMount`中执行`effect`，`componentWillUnmount`中进行`cleanup`)，永远不重新运行。
6. 和`componentDidMount`/`componentDidUpdate`有区别的地方在于，`useEffect`中的函数会在`layout`和`paint`结束后才被触发。（可以使用`useLayoutEffect`在下一次渲染之前(即 DOM 突变之后)同步触发）
7. `useEffect`虽然被推迟到浏览器绘制完成之后，但是肯定在有任何新的呈现之前启动。因为`React`总是在开始更新之前刷新之前渲染的效果。


### 其他钩子

#### useContext

```js
const context = useContext(Context);
```

接受一个上下文对象（由`React.createContext`创建），返回当前上下文值（由最近的上下文提供）。


### 附加钩子（Additional Hooks）

基本钩子的变体或用于特定边缘情况的钩子。

#### useReducer

```js
const [state, dispatch] = useReducer(reducer, initialArg, init);
```

1. 第三个参数`init`为函数，将会这样调用：`init(initialArg)`，返回初始值。
2. 如果返回`state`和现在的`state`一样，将会在不影响子孙或者触发效果的情况下退出渲染。

#### useCallback

```js
const memoizedCallback = useCallback(
  () => {
    doSomething(a, b);
  },
  [a, b],
);
```

传入一个内联回调和一个输入数组，返回一个带有记忆的*函数*，只有输入数组中其中一个值变化才会更改。`useCallback(fn, inputs)` 等价于 `useMemo(() => fn, inputs)`。

#### useMemo

```js
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
```

传入一个创建函数和一个输入数组，返回一个带有记忆的*值*，只有输入数组中其中一个值变化才会重新计算。

#### useRef

```js
const refContainer = useRef(initialValue);
// ...
<input ref={refContainer} />
...
```
返回一个可变的`ref`对象，可以自动将`ref`对象中的`current`属性作为初始值传递的参数，保持到组件的整个生命周期。

与在类中使用实例字段的方式类似，它**可以保留任何可变值**。

如保存前一个状态：
```js
function Counter() {
  const [count, setCount] = useState(0);

  const prevCountRef = useRef();
  useEffect(() => {
    prevCountRef.current = count;
  });
  const prevCount = prevCountRef.current;

  return <h1>Now: {count}, before: {prevCount}</h1>;
}
```


#### useImperativeHandle

```js
useImperativeHandle(ref, createHandle, [inputs])
```

自定在使用 ref 时，公开给父组件的实例值，必须和`forwardRef`一起使用。

```js
function FancyInput(props, ref) {
  const inputRef = useRef();
  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current.focus();
    }
  }));
  return <input ref={inputRef} ... />;
}
FancyInput = forwardRef(FancyInput);

```

```js
<FancyInput ref={fancyInputRef} />

// 调用
fancyInputRef.current.focus()
```

#### useLayoutEffect

使用方法和`useLayoutEffect`一致，不过它是在 DOM 读取布局时同步触发（相当于`componentDidMount`和`componentDidUpdate`阶段）。（建议尽可能使用`useEffect`避免阻塞可视化更新）


#### useDebugValue

```js
useDebugValue(value)
```

用于在`React DevTools`中显示自定义钩子的标签，对于自定义钩子中用于共享的部分有更大价值。

自定义显示格式：
```js
useDebugValue(date, date => date.toDateString());
```

### 钩子（Hooks）规则

#### 1. 只能在顶层调用，不能再循环、条件语句和嵌套函数中使用。 （原因：[State Hook](#State Hook) 第1条）

正确做法：
```js
useEffect(function persistForm() {
      // 👍 We're not breaking the first rule anymore
      if (name !== '') {
        localStorage.setItem('formData', name);
      }
    });
```

#### 2. 只能在`React`函数组件中被调用。（可以通过自定义钩子函数解决）

可以使用[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)来强制自动执行这些规则。

### 自定义钩子（Hook）

1. 以`use`开头，一种公约。
1. 自定钩子是一种复用状态逻辑的机制（例如设置订阅和记住当前值），每次使用，内部所有状态和作用都是独立的。
1. 自定义钩子每个状态独立的能力源于`useState`和`useEffect`是完全独立的。


### 测试钩子（Hook)

```js
function Example() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

使用[ReactTestUtils.act()](https://reactjs.org/docs/test-utils.html#act)

```js
import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Counter from './Counter';

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

it('can render and update a counter', () => {
  // Test first render and effect
  act(() => {
    ReactDOM.render(<Counter />, container);
  });
  const button = container.querySelector('button');
  const label = container.querySelector('p');
  expect(label.textContent).toBe('You clicked 0 times');
  expect(document.title).toBe('You clicked 0 times');

  // Test second render and effect
  act(() => {
    button.dispatchEvent(new MouseEvent('click', {bubbles: true}));
  });
  expect(label.textContent).toBe('You clicked 1 times');
  expect(document.title).toBe('You clicked 1 times');
});
```

建议使用[react-testing-library](https://git.io/react-testing-library)


### 参考

- [Hooks](https://reactjs.org/docs/hooks-intro.html)

