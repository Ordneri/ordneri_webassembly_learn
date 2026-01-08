function func() {
  var mefunc = func;
  if(mefunc.bufferSize === undefined){
    console.log("mefunc.bufferSize is undefined");
    mefunc.bufferSize = 0;
  }
  console.log(mefunc.bufferSize);
}
func();
func();