const fs = require('fs');
if (process.argv.length > 2) {
    const name = process.argv[2];
    const withjs  = process.argv.includes("--js");
    const html = `<html lang="zh-CN">
<head>
  <meta charset='utf-8' />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" href="data:,">
  <title>
    WebAssembly
  </title>
</head>
<body>
  <div id="app">
    <h1>Hello WebAssembly</h1>
  </div>
  ${withjs ? `<script src="/code/js/${name}_js.js"></script>` : ""}
  <script src="/code/cpp/wasm/${name}.js"></script>
</body>`
    fs.writeFileSync(`public/html/${name}.html`, html);
} else {
    console.log("Usage: node run.js <name>");
}