Module = {}
Module.onRuntimeInitialized = function() {
  console.log(`new int array in js [int_arr_ptr_js]`);
  var int_arr_ptr_js = _malloc(10 * 4);
  console.log("int_arr_ptr_js: "+int_arr_ptr_js.toString(16));
  console.log(`set value by HEAP32[(int_arr_ptr_js >> 2) + i] = i + 1;`);
  for(let i = 0;i<10;i++){
    HEAP32[(int_arr_ptr_js >> 2) + i] = i + 1;
  }
  console.log(`get item ptr by c function [item_3_ptr]`);
  let item_3_ptr = _get_array_item_ptr(int_arr_ptr_js,3);
  console.log(`int_arr_ptr_js[3] is: ${item_3_ptr.toString(16)}`);

  console.log(`get/set item value by empscripten method getValue/setValue [int_arr_ptr_js[3](${getValue(item_3_ptr)}) = 100]`);
  setValue(item_3_ptr,100);


  console.log(`get item ptr by calculate [item_3_ptr = int_arr_ptr_js + 3 * 4]`);
  item_3_ptr = int_arr_ptr_js + 3 * 4;
 
  
  console.log(`get/set item value by ptr in js [HEAP32[item_3_ptr >> 2](${HEAP32[item_3_ptr >> 2]}) = 200]`);
  HEAP32[item_3_ptr >> 2] = 200;


  console.log(`get/set item value by c function [_get_array_item_value(int_arr_ptr_js),3)(*${_get_array_item_ptr(int_arr_ptr_js,3).toString(16)},${_get_array_item_value(int_arr_ptr_js,3)}) = 300]`);
  _set_array_item_value(int_arr_ptr_js,3,300);

  console.log(`free js created array ptr by c function [_free_array_ptr(int_arr_ptr_js(${int_arr_ptr_js.toString(16)}))]`);
  _free_array_ptr(int_arr_ptr_js);

  console.log(`free c created array ptr by empscripten method [_free(_get_array_ptr())]`);
  _free(_get_array_ptr());
}