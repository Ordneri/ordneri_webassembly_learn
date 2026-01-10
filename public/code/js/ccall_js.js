Module = {}
Module.onRuntimeInitialized = function() {
  const mult = Module.ccall('mult', 'number', ['number', 'number'],[6n, BigInt(0x100000000)]);
  console.log(mult);
  const sum = Module.cwrap('sum', 'number', ['array', 'number']);
  let count = 50;
  let buf = new ArrayBuffer(count << 2);
  let i8arr = new Int8Array(buf);
  let i32arr = new Int32Array(buf);
  for(let i = 0; i < count; i++){
    i32arr[i] = i+1;
  }
  console.log(sum(i8arr, count));
  Module.ccall('say', null, ['string'], ['hello world']);
}