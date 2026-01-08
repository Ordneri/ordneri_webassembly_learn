#include "../include/ems_export.h"
#include <emscripten/emscripten.h>
#include <stdio.h>
#include <malloc.h>
void onload(){
    printf("onload!\n");
}
void onerror(){
    printf("onerror!\n");
}
int main(){
    emscripten_run_script(R"--(
    function myFunc(){
        console.log('hello world');
    }
    myFunc(); 
    )--");

    int ret = emscripten_run_script_int(R"--(
    function myFunc2(){
        return 42;
    }
    myFunc2(); 
    )--");
    printf("emscripten_run_script_int result : %d\n", ret);

    const char* ret_str = emscripten_run_script_string(R"--(
    function myFunc3(){
        return 'hello world3';
    }
    myFunc3(); 
    )--");
    printf("emscripten_run_script_string result : %s\n", ret_str);
    free((void*)ret_str);//可以不调用，因为下次emscripten_run_script_string会自动调用free

    emscripten_async_run_script(R"--(
    function myFunc4(){
        console.log('hello world4 after 5000ms');
    }
    myFunc4(); 
    )--",5000);

    emscripten_async_load_script("../code/js/eval_load_js.js",onload,onerror);
}