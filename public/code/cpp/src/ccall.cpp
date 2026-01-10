#include "../include/ems_export.h"
#include "emscripten/console.h"
#include <stdio.h>
#include <stdint.h>
#include <string.h>
EM_PORT_API(unsigned long long int) mult(unsigned long long int a, unsigned long long int b){
    printf("mult in c: %llu * %llu = %llu",a,b,a*b);
    char str[100];
    sprintf(str,"mult in c: %llu * %llu = %llu",a,b,a*b);
    emscripten_console_log(str);
    return a * b;
}
EM_PORT_API(int) sum(uint8_t * arr, int len){
    int ret = 0,temp;
    for(int i = 0; i < len; i++){
        memcpy(&temp,arr+i*4,4);
        ret += temp;
    }
    return ret;
}
EM_PORT_API(void) say(const char * str){
    emscripten_console_log(str);//ccall调用时printf无效
}