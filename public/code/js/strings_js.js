Module = {}
Module.onRuntimeInitialized = function() {
  console.log(`get c str ptr: ${UTF8ToString(_get_c_str())}`);
  let str_ptr = stringToNewUTF8("new str hello world from js，你好");
  console.log(`print js new str by c function [_print_str(str_ptr)]`);
  _print_str(str_ptr);

  let js_str = "normal str hello world from js，你好";
  let str_buffer_ptr = _malloc_str(100);
  console.log(`str_buffer_ptr: ${str_buffer_ptr.toString(16)}`);
  stringToUTF8(js_str,str_buffer_ptr,100);
  console.log(`get c str len: ${_get_c_str_len(str_buffer_ptr)}`);
  _free(str_buffer_ptr);
}