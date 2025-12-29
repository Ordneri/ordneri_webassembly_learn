const express = require('express')
const app = express()
const PORT = 8881

app.use(express.static('public'))
if (process.argv.length > 2) {
    const name = process.argv[2];
    app.listen(PORT, () => {
        console.log(`Website started on : http://localhost:${PORT}/html/${name}.html`);
      });
} else {
    console.log("Usage: node run.js <name>");
}