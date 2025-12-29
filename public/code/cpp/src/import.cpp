#include "../include/ems_export.h"
int a=6,b=9;
EM_PORT_API(int) js_add(int a,int b);
EM_PORT_API(void) js_log(int numb);
EM_PORT_API(void) calladd()
{
    int c=js_add(a,b);
    js_log(c);
}
