const mongoose = require('mongoose')
const taskShema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

taskShema.pre('save', async function (next) {
    next()
})

const Task = mongoose.model('Task', taskShema)

module.exports = Task