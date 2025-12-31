const express = require('express')
const app = express()
const PORT = 8881

app.use(express.static('public'))
app.listen(PORT, () => {
    console.log(`Website started on : http://localhost:${PORT}`);
  });