Module = {}
Module.onRuntimeInitialized = function() {
  let arr_ptr = Module._malloc(50 << 2);
  console.log("arr_ptr: "+arr_ptr.toString(16));
  for(let i = 0;i<50;i++){
    Module.HEAP32[(arr_ptr >> 2) + i] = i + 1;
  }
  console.log(Module._sum(arr_ptr,50));
  Module._free(arr_ptr);
}