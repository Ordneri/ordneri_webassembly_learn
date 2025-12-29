# WebAssembly笔记

## 开始

### 安装Emscripten

<i style="color:grey;">用于将C++代码编译为wasm</i>

下载后到emsdk所在目录（D:\Program\Compilers\emscripten\emsdk）

```batch
./emsdk update
./emsdk install latest
```

安装后激活

```batch
./emsdk activate latest
```

设置环境变量:

```batch
emsdk_env.bat
```

安装成功后查看版本信息

```batch
emcc -v
```

### Hello World!

```c++
//hello.cc
#include<stdio.h>
int main(){
    printf("hello world");
}
```

```batch
emcc hello.cc -o hello.js
```

然后在网页中导入即可在控制台看到结果:<i style="color:grey;">_依然需要上线网页_</i>

```html
<script src="hello.js"></script>
```

<span style="color:#4f7;">也可直接用node.js运行</span>

```batch
node hello.js
```

编译生成测试网页<i style="color:grey">wasm的测试网页</i>

```batch
emcc hello.cc -o hello.html
```

在控制台中使用_main()与Module._main()均可以调用函数

![7507b6c0-5754-4782-8195-3be3c5daf4ce](./images/7507b6c0-5754-4782-8195-3be3c5daf4ce.png)

<span style="color:red;font-weight:bold;">需要先加载好才能调用函数否则将报错：</span>

```html
<script src="/code/cpp/wasm/hello.js"></script>
  <script>
    _main()
  </script>
```

错误信息：

```text
Aborted(Assertion failed: call to '_main' via reference taken before Wasm module initialization)
```

### 异步加载

<span style="color:#4f7;">Tip:可以采取main()函数回调的方式完成</span>

可采取Module.onRuntimeInitialized回调函数

```javascript
Module.onRuntimeInitialized = function() {
  console.log("ready");
}
```

### 编译目标

> Emscripten早于WebAssembly所以，WebAssembly前Emscripten长期用于编译asm.js

若要编译为asm，使用 `-s WASM=0`

```batch
emcc hello.cc -s WASM=0 -o hello_asm.js
```

## JavaScript与C通信

### JavaScript调用C函数

#### 编译时导出C函数

可以在编译时采用 `-s EXPORTED_FUNCTIONS=‘[”_function1“,"_function2"]’` <span style="color:red;font-weight:bold;">注意，由于需要导出的函数必须要用C语言风格函数前要加下划线，c++文件导出的函数前加 `extern "C"`</span>

```c
//export.c
int add(int a, int b)
{
    return a + b;
}
```

<i style="color:grey;">一定要加EXPORTED_FUNCTIONS，不加不行(试过了)</i>

<i style="color:grey;">另外，在我的电脑上单引号和双引号互换是没关系的</i>

```batch
emcc -s EXPORTED_FUNCTIONS='["_add"]' cpp/src/export.cc -o cpp/wasm/export.js 
```

然后就可以在console里面调用`_add`了

#### 使用宏导出C函数

可以定义一个导出宏，用于使函数在导出时不被编译器优化掉：

```c++
//ems_export.h 本人写
#ifndef EMS_EXPORT_H
#   define EMS_EXPORT_H
#   ifndef EM_PORT_API
#       if defined(__EMSCRIPTEN__)
#           include <emscripten/emscripten.h>
#           if defined(__cplusplus)
#               define EM_PORT_API(rettype) extern "C" rettype EMSCRIPTEN_KEEPALIVE
#           else
#               define EM_PORT_API(rettype) rettype EMSCRIPTEN_KEEPALIVE
#           endif
#       else
#           if defined(__cplusplus)
#               define EM_PORT_API(rettype) extern "C" rettype
#           else
#               define EM_PORT_API(rettype) rettype
#           endif
#       endif
#   endif
#endif
```

写在函数的返回类型上面

```c++
#include "../include/ems_export.h"
EM_PORT_API(int) add(int a, int b)
{
    return a + b;
}
```

<span style="color:#4f7;">JavaScript在调用C函数时，多余的参数将会被省略，少参数则填充undefined</span>

> 上面例子中，add(3) (缺少参数)将返回NaN

### C调用JavaScript函数

#### 通过js文件引入JavaScript函数

实现js函数，并通过`mergeInto`（旧方法）或`addToLibrary`（新方法）声明这些方法将导入到C中

```js
//jsadd.js
mergeInto(LibraryManager.library, {
    js_add: function(a, b) {
        return a + b;
    },
    js_log: function(numb) {
        console.log(numb);
    }
});
```

或是

```js
addToLibrary({
  js_add: function(a, b) {
    return a + b;
  },
  js_log: function(numb) {
    console.log(numb);
  },
});
```

在C中申明此函数

```c++
//import.cpp
#include "../include/ems_export.h"
int a=6,b=9;
EM_PORT_API(int) js_add(int a,int b);
EM_PORT_API(void) js_log(int numb);
EM_PORT_API(void) calladd()
{
    int c=js_add(a,b);
    js_log(c);
}
```

编译时加上`--js-library` +含需要导出函数的js文件，将该文件作为附加库链接

```text
em++ cpp/src/import.cpp -o cpp/wasm/import.js --js-library cpp/jsmodule/jsadd.js
```


