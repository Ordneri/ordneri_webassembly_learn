const fs = require('fs');
if (process.argv.length > 2) {
    const name = process.argv[2];
    const html = `<html lang="zh-CN">
<head>
  <meta charset='utf-8' />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>
    WebAssembly
  </title>
</head>
<body>
  <div id="app">
    <h1>Hello WebAssembly</h1>
  </div>
  <script src="/code/cpp/wasm/${name}.js"></script>
</body>`
    fs.writeFileSync(`public/html/${name}.html`, html);
} else {
    console.log("Usage: node run.js <name>");
}