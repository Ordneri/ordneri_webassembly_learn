#include "../include/ems_export.h"
#include <malloc.h>

EM_PORT_API(int *) get_array_ptr(){
    return (int *) malloc(10 * sizeof(int));
};


EM_PORT_API(void) free_array_ptr(int *ptr){
    free(ptr);
};

EM_PORT_API(void) set_array_value(int *ptr, int index, int value){
    ptr[index] = value;
};

EM_PORT_API(int) get_array_value(int *ptr, int index){
    return ptr[index];
};

EM_PORT_API(int *) get_array_item_ptr(int *ptr, int index){
    return &ptr[index];
};
