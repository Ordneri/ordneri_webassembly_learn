RM = Remove-Item 
additional = ""
all:
	ifdef calwra
		additional = additional -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]'
	endif
	ifdef fremal
		additional = additional -s EXPORTED_RUNTIME_METHODS='["malloc","free"]'
	endif

md.js md.wasm:
	em++ -o md.js md.cpp -s EXPORTED_RUNTIME_METHODS='["cwrap","ccall"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1  -s 'EXPORT_NAME="mdModule"'


cpp:cpp/src/$(name).cpp
	em++ cpp/src/$(name).cpp -o cpp/wasm/$(name).js $(additional)

cc:cpp/src/$(name).cc
	emcc cpp/src/$(name).cc -o cpp/wasm/$(name).js $(additional)


clean:
	$(RM) public/scripts/cpp/out.js,public/scripts/cpp/out.wasm
# -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' md.cpp -o md.js -s 'EXPORT_NAME="mdModule"' -s MODULARIZE=1 -s EXPORTED_FUNCTIONS="['_init','_setValue','_getProcessedValue']"