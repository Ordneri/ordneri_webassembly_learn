#include "../include/ems_export.h"
#include "emscripten/emscripten.h"
#include <stdio.h>
bool running = true;
int count = 0;
void loop(){
    if(!running){
        throw 0;
    }
    if(count % 4 == 0){
        printf("loop1! count: %d\n", count);
    }
    count++;
}


class obj{
    public:
        obj(){
            printf("obj constructor!\n");
        }
        ~obj(){
            printf("obj destructor!\n");
        }
    };

EM_PORT_API(void) startinfloop(){
    obj stack_obj;
    count = 0;
    running = true;
    printf("startinfloop!\n");
    emscripten_set_main_loop(loop, 1, 1);
    printf("startinfloop end!\n");
}

EM_PORT_API(void) startnoninfloop(){
    obj stack_obj;
    count = 0;
    running = true;
    printf("startnoninfloop!\n");
    emscripten_set_main_loop(loop, 1, 0);
    printf("startnoninfloop end!\n");
}


EM_PORT_API(void) stoploop(){
    running = false;
}
