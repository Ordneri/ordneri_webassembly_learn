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
