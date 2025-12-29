RM = Remove-Item 
additional = ""
all:
	ifdef calwra
		additional = additional -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]'
	endif
	ifdef fremal
		additional = additional -s EXPORTED_RUNTIME_METHODS='["malloc","free"]'
	endif
out-lib:public/scripts/cpp/src/try.cpp public/scripts/cpp/jsm.js
	em++ public/scripts/cpp/src/try.cpp --js-library public/scripts/script.js -o public/scripts/cpp/out.js

out:public/scripts/cpp/src/try.cpp
	em++ public/scripts/cpp/src/try.cpp -o public/scripts/cpp/out.js -s EXPORTED_RUNTIME_METHODS='HEAP32' -s EXPORTED_FUNCTIONS=['_malloc','_free']

md.js md.wasm:
	em++ -o md.js md.cpp -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1  -s 'EXPORT_NAME="mdModule"'

hello:cpp/src/hello.cc
	em++ cpp/src/hello.cc -o cpp/wasm/hello.js

cpp:cpp/src/$(name).cpp
	em++ cpp/src/$(name).cpp -o cpp/wasm/$(name).js $(additional)

cc:cpp/src/$(name).cc
	emcc cpp/src/$(name).cc -o cpp/wasm/$(name).js $(additional)

exportc:
	emcc -s EXPORTED_FUNCTIONS='["_add"]' cpp/src/export.c -o cpp/wasm/export.js 

clean:
	$(RM) public/scripts/cpp/out.js,public/scripts/cpp/out.wasm
# -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' md.cpp -o md.js -s 'EXPORT_NAME="mdModule"' -s MODULARIZE=1 -s EXPORTED_FUNCTIONS="['_init','_setValue','_getProcessedValue']"