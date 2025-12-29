#include "../include/ems_export.h"
#include <stdio.h>
EM_PORT_API(int) sum(int * arr,int len) {
  int s = 0;
  printf("ptr: %p\n",(void*)arr);
  for(int i = 0;i<len;i++){
    s += arr[i];
  }
  return s;
}

