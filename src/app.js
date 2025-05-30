const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const multer = require('multer')
const upload = multer({
    dest: 'images'
})

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})

// app.use((req, res, next) => {
//     res.status(503).send('Server temporary unavailable')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app