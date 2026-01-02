#include "../include/ems_export.h"
#include <stdio.h>
EM_PORT_API(void) print_int(int value){
    printf("int value: %d\n", value);
}
EM_PORT_API(void) print_float(float value){
    printf("float value: %f\n", value);
}
