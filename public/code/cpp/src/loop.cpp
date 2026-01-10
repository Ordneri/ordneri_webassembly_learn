#include "../include/ems_export.h"
#include "emscripten/emscripten.h"
#include <stdio.h>
#include <string.h>


struct {
  bool alloced = false;
  void *ptr;
} loop_arg;
struct gobj{
    gobj(){printf("gobj constructor!\n");}
    ~gobj(){printf("gobj destructor!\n");}
}obj;
int count = 0;
int block_count = 0;
void simple_block(void *) {
  emscripten_sleep(3000);
  printf("simple_block! block_count: %d\n", block_count--);
}

void arg_loop(void *arg) {
  printf("arg_loop! arg: %s\n", (const char *)arg);
  if (count % 5 == 0) {
    printf("loop! count: %d\n", count);
  }
  if (block_count > 0) {
    emscripten_set_main_loop_expected_blockers(block_count);
    for (int i = 0; i < block_count; i++) {
      emscripten_push_main_loop_blocker(simple_block, NULL);
    }
  }
  count++;
}

EM_PORT_API(void) push_block(int number) { block_count = number; }

EM_PORT_API(void) startloop(const char *arg, int mode) {
  struct obj {
    obj() { printf("main obj constructor!\n"); }
    ~obj() { printf("main obj destructor!\n"); }
  } stack_obj;
  count = 0;
  printf("startloop simulate_infinite_loop: %d!\narg: %s", mode, arg);
  if (mode == 0) {
    //在mode为0时，main()栈会被释放，arg也会被释放，所以需要在全局分配内存
    if (loop_arg.alloced) {
      free(loop_arg.ptr);
    }
    loop_arg.ptr = malloc(strlen(arg) + 1);
    strcpy((char *)loop_arg.ptr, arg);
    loop_arg.alloced = true;
    emscripten_set_main_loop_arg(arg_loop, (void *)loop_arg.ptr, 1, mode);
  }else{
    emscripten_set_main_loop_arg(arg_loop, (void *)arg, 1, mode);
  }
  

  printf("startloop end!\n");
}

EM_PORT_API(void) stoploop() {
  printf("stoploop!\n");
  emscripten_cancel_main_loop();
  if (loop_arg.alloced) {
    free(loop_arg.ptr);
    loop_arg.alloced = false;
  }
}
