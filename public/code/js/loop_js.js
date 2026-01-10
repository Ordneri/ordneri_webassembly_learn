Module = {}
Module.onRuntimeInitialized = function() {
  Module.setStatus = function(status){
    console.log(status);
  }
  Module.statusMessage = "user defined statusMessage";
  push_block_js = function(){
    console.log('[JavaScript] push 2 blocks');
    _push_block(2);
  }
  startloop_js = function(mode){
    console.log(`[JavaScript] start loop with mode ${mode}`);
    try{
        ccall('startloop', null, ['string','number'], ['args from html', mode]);
    }catch(err){
        console.log('[JavaScript] start loop error:', err);
    }
  }
  stoploop_js = function(){
    console.log('[JavaScript] stop loop');
    _stoploop();
  }

}