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

> Emscripten早于WebAssembly，所以WebAssembly诞生前Emscripten长期用于编译asm.js

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

## 单向透明内存

### 可用内存大小

当前版本的Emscripten(4.0.23)中，指针类型为int32，即最大可用内存为2GB - 1，未定义的情况下（Emscripten 4.0.23），栈容量（STACK_SIZE）为64KB，堆容量16MB，设置`ALLOW_MEMORY_GROWTH`后，`MAXIMUM_MEMORY`生效，内存可扩展至2GB。

> #### [STACK_SIZE](https://emscripten.webassembly.net.cn/docs/tools_reference/settings_reference.html#stack-size "Permalink to this headline")
> 
> 总堆栈大小。无法扩大堆栈，因此该值必须足够大以满足程序的要求。如果断言打开，我们将在不超过此值的情况下断言，否则，它会静默失败。
> 
> 默认值：64*1024
> 
> --------------
> 
> #### [INITIAL_HEAP](https://emscripten.webassembly.net.cn/docs/tools_reference/settings_reference.html#initial-heap)
> 
> 程序可用的初始堆内存量。这是通过 sbrk、malloc 和 new 可用于动态分配的内存区域。
> 
> 与 INITIAL_MEMORY 不同，此设置允许程序内存的静态区域和动态区域独立增长。在大多数情况下，我们建议使用此设置而不是 INITIAL_MEMORY。但是，此设置不适用于导入的内存（例如，当使用动态链接时）。
> 
> 默认值：16777216
> 
> --------------
> 
> #### [INITIAL_MEMORY](https://emscripten.webassembly.net.cn/docs/tools_reference/settings_reference.html#initial-memory)
> 
> 要使用的初始内存量。使用超过此内存量的内存会导致我们扩展堆，这对于类型化数组来说可能很昂贵：在这种情况下，我们需要将旧堆复制到新堆中。如果设置了 ALLOW_MEMORY_GROWTH，则此初始内存量可以在以后增加；如果没有，那么它就是最终的总内存量。
> 
> 默认情况下，此值是根据 INITIAL_HEAP、STACK_SIZE 以及输入模块中静态数据的尺寸计算得出的。
> 
> （此选项以前称为 TOTAL_MEMORY。）
> 
> 默认值：-1
> 
> --------------
> 
> #### [MAXIMUM_MEMORY](https://emscripten.webassembly.net.cn/docs/tools_reference/settings_reference.html#maximum-memory)
> 
> 设置 wasm 模块中内存的最大尺寸（以字节为单位）。这仅在设置 ALLOW_MEMORY_GROWTH 时才相关，因为如果没有增长，INITIAL_MEMORY 的大小无论如何都是最终内存的大小。
> 
> 请注意，这里的默认值为 2GB，这意味着默认情况下，如果您启用内存增长，那么我们可以增长到 2GB，但不会更高。2GB 是一个自然的限制，原因有以下几个
> 
> > * 如果最大堆大小超过 2GB，则指针必须在 JavaScript 中无符号，这会增加代码大小。我们不希望内存增长构建更大，除非有人明确选择加入到 >2GB+ 堆中。
> > 
> > * 历史上，没有 VM 支持超过 2GB+，直到最近（2020 年 3 月）才开始出现支持。由于支持有限，对于人们来说，选择加入到 >2GB+ 堆中比获得可能不适用于所有 VM 的构建更安全。
> 
> 要使用超过 2GB，请将其设置为更高的值，例如 4GB。
> 
> （此选项以前称为 WASM_MEM_MAX 和 BINARYEN_MEM_MAX。）
> 
> 默认值：2147483648
> 
> ------------------- 
> 
> #### [ALLOW_MEMORY_GROWTH](https://emscripten.webassembly.net.cn/docs/tools_reference/settings_reference.html#allow-memory-growth)
> 
>  如果为 false，如果我们尝试分配超过我们所能分配的内存（INITIAL_MEMORY），我们就会中止并报错。如果为 true，我们将在运行时无缝动态地增长内存数组。有关 chrome 中内存增长性能的信息，请参见 https://code.google.com/p/v8/issues/detail?id=3907。请注意，增长内存意味着我们替换 JS 类型化数组视图，因为一旦创建，它们就无法调整大小。（在 wasm 中，我们可以增长 Memory，但仍然需要为 JS 创建新的视图。）在该选项上设置此选项将禁用 ABORTING_MALLOC，换句话说，ALLOW_MEMORY_GROWTH 使完全标准的行为生效，即 malloc 在失败时返回 0，并且能够根据需要从系统中分配更多内存。
> 
> 默认值：false

### 获取和设置值

Emscripten推荐使用 [`getValue(ptr, type)`](https://emscripten.webassembly.net.cn/docs/api_reference/preamble.js.html#getValue "getValue") 和 [`setValue(ptr, value, type)`](https://emscripten.webassembly.net.cn/docs/api_reference/preamble.js.html#setValue "setValue") 访问内存，第一个参数是一个指针（表示内存地址的数字）。 `type` 必须是 LLVM IR 类型，分别是 `i8`、 `i16`、 `i32`、 `i64`、 `float`、 `double` 或指针类型，如 `i8*`（或只是 `*`）。

<span style="color:red;font-weight:bold;">注意，`getValue(ptr, type)`和`setValue(ptr, value, type)`需要在编译时导出，参见<a href="#preamble_js_and_exported_runtime_methods" style="color:inherit">[EXPORTED_RUNTIME_METHODS]</a></span>

### 读写内存

[Emscripten 内存表示](https://emscripten.webassembly.net.cn/docs/porting/emscripten-runtime-environment.html#emscripten-memory-model) 使用类型化数组缓冲区 (`ArrayBuffer`) 来表示内存，其中不同的视图可以访问不同的类型。用于访问不同类型内存的视图如下。

| 类型      | 解释           |
| ------- | ------------ |
| HEAP8   | 8 位有符号内存的视图  |
| HEAP16  | 16 位有符号内存的视图 |
| HEAP32  | 32 位有符号内存的视图 |
| HEAPU8  | 8 位无符号内存的视图  |
| HEAPU16 | 16 位无符号内存的视图 |
| HEAPU32 | 32 位无符号内存的视图 |
| HEAPF32 | 32 位浮点内存的视图  |
| HEAPF64 | 64 位浮点内存的视图  |

<span style="color:#4f7;">对内存进行读写时，需要通过<a href="#preamble_js_and_exported_runtime_methods" style="color:inherit">[EXPORTED_RUNTIME_METHODS]</a>导出相应类型视图，如`-sEXPORTED_RUNTIME_METHODS=HEAP32`。</span>

<span style="color:#4f7;">使用时，注意内存地址与视图元素索引的转换，如`HEAP32`需要将内存地址除以4才能得到对应的元素（使用类似`ptr>>2`的表达式记得加括号，因为`+`/`-`优先级大于`>>`/`<<`）</span>

相关使用示例详见<a href="#heap_malloc_free_example" style="color:inherit">"在JavaScript中申请内存"</a>，

### 数据交换

<span style="color:#4f7;">JavaScript与C之间只能通过number进行参数何返回值的传递，number传入时，若C中类型为int则向0取整，若为float则可能造成精度丢失。</span>

```c++
//type_conv.cpp
#include "../include/ems_export.h"
#include <stdio.h>
EM_PORT_API(void) print_int(int value){
    printf("int value: %d\n", value);
}
EM_PORT_API(void) print_float(float value){
    printf("float value: %f\n", value);
}
```

```javascript
//type_conv_js.js
Module = {}
Module.onRuntimeInitialized = function() {
  console.log(`print_int(123):`);
  _print_int(123)
  console.log(`print_int(23.45):`);
  _print_int(23.45)
  console.log(`print_float(123.456):`);
  _print_float(123.456)
  console.log(`print_float(1000000.23456789):`);
  _print_float(1000000.23456789)
  console.log(`print_float():`);
  _print_float()
  console.log(`print_int():`);
  _print_int()
} 
```

结果

![34232e1a-25fc-4de1-ad02-6378a7fef588](./images/34232e1a-25fc-4de1-ad02-6378a7fef588.png)

### 通过内存交换数据

可通过传递数组指针来传递数据，通过

### 在JavaScript中申请内存<span id="heap_malloc_free_example"> </span>

可通过在编译时添加`-sEXPORTED_FUNCTIONS=_malloc,_free`来暴露malloc与free函数。

```c++
//cmem.cpp
#include "../include/ems_export.h"
#include <malloc.h>

EM_PORT_API(int *) get_array_ptr(){
    return (int *) malloc(10 * sizeof(int));
};

EM_PORT_API(void) free_array_ptr(int *ptr){
    free(ptr);
};

EM_PORT_API(void) set_array_item_value(int *ptr, int index, int value){
    ptr[index] = value;
};

EM_PORT_API(int) get_array_item_value(int *ptr, int index){
    return ptr[index];
};

EM_PORT_API(int *) get_array_item_ptr(int *ptr, int index){
    return &ptr[index];
}; 
```

编译

```batch
em++ cpp/src/cmem.cpp -o cpp/wasm/cmem.js -sEXPORTED_RUNTIME_METHODS=setValue,getValue,HEAP32 -sEXPORTED_FUNCTIONS=_malloc,_free
```

在js中调用

```javascript
//cmem_js.js
Module.onRuntimeInitialized = function() {
  console.log(`new int array in js [int_arr_ptr_js]`);
  var int_arr_ptr_js = _malloc(10 * 4);
  console.log("int_arr_ptr_js: "+int_arr_ptr_js.toString(16));
  console.log(`set value by HEAP32[(int_arr_ptr_js >> 2) + i] = i + 1;`);
  for(let i = 0;i<10;i++){
    HEAP32[(int_arr_ptr_js >> 2) + i] = i + 1;
  }
  console.log(`get item ptr by c function [item_3_ptr]`);
  let item_3_ptr = _get_array_item_ptr(int_arr_ptr_js,3);
  console.log(`int_arr_ptr_js[3] is: ${item_3_ptr.toString(16)}`);

  console.log(`get/set item value by empscripten method getValue/setValue [int_arr_ptr_js[3](${getValue(item_3_ptr)}) = 100]`);
  setValue(item_3_ptr,100);


  console.log(`get item ptr by calculate [item_3_ptr = int_arr_ptr_js + 3 * 4]`);
  item_3_ptr = int_arr_ptr_js + 3 * 4;


  console.log(`get/set item value by ptr in js [HEAP32[item_3_ptr >> 2](${HEAP32[item_3_ptr >> 2]}) = 200]`);
  HEAP32[item_3_ptr >> 2] = 200;


  console.log(`get/set item value by c function [_get_array_item_value(int_arr_ptr_js),3)(*${_get_array_item_ptr(int_arr_ptr_js,3).toString(16)},${_get_array_item_value(int_arr_ptr_js,3)}) = 300]`);
  _set_array_item_value(int_arr_ptr_js,3,300);

  console.log(`free js created array ptr by c function [_free_array_ptr(int_arr_ptr_js(${int_arr_ptr_js.toString(16)}))]`);
  _free_array_ptr(int_arr_ptr_js);

  console.log(`free c created array ptr by empscripten method [_free(_get_array_ptr())]`);
  _free(_get_array_ptr());
}
```

运行结果: <i style="color:grey;">html页面仅引入了两个js文件，所以不展示代码</i>

![00ff2fb9-75b2-4a20-b6be-48c8d6bf5878](./images/00ff2fb9-75b2-4a20-b6be-48c8d6bf5878.png)

### 字符串处理

JavaScript 字符串 `someString` 可以使用 `ptr = stringToNewUTF8(someString)` 转换为 `char *`。(貌似并没有~~stringToNewUTF16~~等)<span style="color:red;font-weight:bold;">转换为指针会分配内存，需要通过调用 `free(ptr)` 来释放内存（在 JavaScript 侧为 `_free`）</span>

除此之外还有以下方式处理字符串：

#### `UTF8ToString`(_ptr_[, _maxBytesToRead_])

给定一个指向 Emscripten HEAP 中以空终止的 UTF8 编码字符串的指针 `ptr`，返回该字符串的副本，作为 JavaScript `String` 对象。

参数

* **ptr** – 指向 Emscripten HEAP 中以空终止的 UTF8 编码字符串的指针。

* **maxBytesToRead** – 一个可选的长度，指定要读取的最大字节数。可以省略此参数来扫描字符串，直到第一个 0 字节。如果传递了 maxBytesToRead，并且 `[ptr, ptr+maxBytesToReadr)` 中的字符串在中间包含一个空字节，则该字符串将在该字节索引处被截断（即 maxBytesToRead 不会生成一个长度精确为 `[ptr, ptr+maxBytesToRead)` 的字符串）请注意，频繁地使用 `UTF8ToString()`（带有和不带有 maxBytesToRead）可能会扰乱 JS JIT 优化，因此值得考虑始终如一地使用其中一种风格。

返回值

一个 JavaScript `String` 对象

---

#### `stringToUTF8`(_str_, _outPtr_, _maxBytesToWrite_)

将给定的 JavaScript `String` 对象 `str` 复制到 Emscripten HEAP 的地址 `outPtr`，以空终止，并以 UTF8 形式编码。

复制将最多需要 `str.length*4+1` 字节的 HEAP 空间。可以使用 `lengthBytesUTF8()` 函数计算对字符串进行编码所需的精确字节数（不包括空终止符）。

参数

* **str** (_String_) – 一个 JavaScript `String` 对象。

* **outPtr** – 指向从 `str` 复制的数据的指针，以 UTF8 格式编码，并以空终止。

* **maxBytesToWrite** – 此函数最多可以写入的字节数限制。如果字符串比此更长，则输出将被截断。即使发生截断，输出的字符串也将始终以空终止，只要 `maxBytesToWrite > 0`。

---

#### `UTF16ToString`(_ptr_)

给定一个指向 Emscripten HEAP 中以空终止的 UTF16LE 编码字符串的指针 `ptr`，返回该字符串的副本，作为 JavaScript `String` 对象。

参数

* **ptr** – 指向 Emscripten HEAP 中以空终止的 UTF16LE 编码字符串的指针。

返回值

一个 JavaScript `String` 对象

---

#### `stringToUTF16`(_str_, _outPtr_, _maxBytesToWrite_)

将给定的 JavaScript `String` 对象 `str` 复制到 Emscripten HEAP 的地址 `outPtr`，以空终止，并以 UTF16LE 形式编码。

复制将需要 HEAP 中的 `(str.length+1)*2` 字节空间。

参数

* **str** (_String_) – 一个 JavaScript `String` 对象。

* **outPtr** – 指向从 `str` 复制的数据的指针，以 UTF16LE 格式编码，并以空终止。

* **maxBytesToWrite** – 此函数最多可以写入的字节数限制。如果字符串比此更长，则输出将被截断。即使发生截断，输出的字符串也将始终以空终止，只要 `maxBytesToWrite >= 2`，以便有空间用于空终止符。

---

#### `UTF32ToString`(_ptr)_

给定一个指向 Emscripten HEAP 中以空终止的 UTF32LE 编码字符串的指针 `ptr`，返回该字符串的副本，作为 JavaScript `String` 对象。

参数

* **ptr** – 指向 Emscripten HEAP 中以空终止的 UTF32LE 编码字符串的指针。

返回值

一个 JavaScript `String` 对象。

-------

#### `stringToUTF32`(_str_, _outPtr_, _maxBytesToWrite_)

将给定的 JavaScript `String` 对象 `str` 复制到 Emscripten HEAP 的地址 `outPtr`，以空终止，并以 UTF32LE 形式编码。

复制将最多需要 `(str.length+1)*4` 字节的 HEAP 空间，但可以使用更少的空间，因为 `str.length` 不会返回字符串中字符的数量，而是返回字符串中 UTF-16 代码单元的数量。可以使用 `lengthBytesUTF32()` 函数计算对字符串进行编码所需的精确字节数（不包括空终止符）。

参数

* **str** (_String_) – 一个 JavaScript `String` 对象。

* **outPtr** – 指向从 `str` 复制的数据的指针，以 UTF32LE 格式编码，并以空终止。

* **maxBytesToWrite** – 此函数最多可以写入的字节数限制。如果字符串比此更长，则输出将被截断。即使发生截断，输出的字符串也将始终以空终止，只要 `maxBytesToWrite >= 4`，以便有空间用于空终止符。

---

#### `AsciiToString`(_ptr_)

将 ASCII 或 Latin-1 编码字符串转换为 JavaScript String 对象。

参数

* **ptr** – 要转换为 `String` 的指针。

返回值

一个 JavaScript `String`，包含来自 `ptr` 的数据。

返回值类型

String

---

#### `intArrayFromString`(_stringy_, _dontAddNull_[, _length_])

这会将 JavaScript 字符串转换为以 0 结尾的 C 行数字数组。

参数

* **stringy** (_String_) – 要转换的字符串。

* **dontAddNull** (_bool_) – 如果 `true`，则新数组不会以零结尾。

* **长度** – 数组的长度（可选）。

返回值

从 `stringy` 创建的数组。

---

#### `intArrayToString`(_array_)

这将从一个以零结尾的 C 行数字数组创建一个 JavaScript 字符串。

参数

* **array** – 要转换的数组。

返回值

一个 `String`，包含 `array` 的内容。

---

#### `writeArrayToMemory`(_array_, _buffer_)

将数组写入堆中的指定地址。请注意，在写入数组之前，应该为数组分配内存。

参数

* **array** – 要写入内存的数组。

* **buffer** (_Number_) – `array` 要写入的地址（数字）。

---

举例：

```c++
//strings.cpp
#include "../include/ems_export.h"
#include <malloc.h>
#include <stdio.h>
#include <string.h>

const char* str = "hello world";

EM_PORT_API(void) print_str(char* str){
    printf("str value: %s\n", str);
}

EM_PORT_API(void*) get_c_str(){
    return (void *) str;
}
EM_PORT_API(void *) malloc_str(int len){
    return (void *) malloc(len);
}
EM_PORT_API(int) get_c_str_len(void* str){
    return strlen((char *) str);
}
```

```javascript
//strings_js.js
Module = {}
Module.onRuntimeInitialized = function() {
  console.log(`get c str ptr: ${UTF8ToString(_get_c_str())}`);
  let str_ptr = stringToNewUTF8("new str hello world from js，你好");
  console.log(`print js new str by c function [_print_str(str_ptr)]`);
  _print_str(str_ptr);

  let js_str = "normal str hello world from js，你好";
  let str_buffer_ptr = _malloc_str(100);
  console.log(`str_buffer_ptr: ${str_buffer_ptr.toString(16)}`);
  stringToUTF8(js_str,str_buffer_ptr,100);
  console.log(`get c str len: ${_get_c_str_len(str_buffer_ptr)}`);
  _free(str_buffer_ptr);
}
```

```batch
em++ cpp/src/strings.cpp -o cpp/wasm/strings.js -s EXPORTED_RUNTIME_METHODS=stringToNewUTF8,stringToUTF8  -sEXPORTED_FUNCTIONS=_malloc,_free
```

### ES_ASM系列



## 补充

## <span id="preamble_js_and_exported_runtime_methods">preamble.js 与 EXPORTED_RUNTIME_METHODS</span>

在 [preamble.js](https://github.com/emscripten-core/emscripten/blob/main/src/preamble.js) 中的 JavaScript API 提供了与编译后的 C 代码进行交互的编程访问方式，包括：调用编译后的 C 函数、访问内存、将指针转换为 JavaScript `Strings` 和 `Strings` 到指针（使用不同的编码/格式）以及其他便捷函数。

我们称之为“`preamble.js`”，因为 Emscripten 的输出 JS 在高级别上包含序言（来自 `src/preamble.js`），然后是编译后的代码，最后是尾声。（更详细地说，序言包含实用函数和设置，而尾声连接事物并处理运行应用程序。）

序言代码包含在输出的 JS 中，然后由编译器与您添加的任何 `--pre-js` 和 `--post-js` 文件以及来自任何 JavaScript 库 (`--js-library`) 的代码一起进行优化。这意味着您可以直接调用序言中的方法，编译器会看到您需要它们，并且不会将其删除为未使用的代码。

如果您想从编译器无法看到的某个地方（例如 HTML 上的另一个脚本标签）调用序言方法，则需要将其**导出**。为此，请将它们添加到 `EXPORTED_RUNTIME_METHODS` 中（例如，`-sEXPORTED_RUNTIME_METHODS=ccall,cwrap` 将导出 `ccall` 和 `cwrap`）。导出后，您可以在 `Module` 对象上访问它们（例如，作为 `Module.ccall`）。
