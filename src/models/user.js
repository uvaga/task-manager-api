const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
        }
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        type: Buffer
    }
},
    {
        timestamps: true
    }
)

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.genJwt = async function() {
    let user = this
    let token = jwt.sign({_id: user._id}, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.methods.toJSON = function() {
    let user = this
    let userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials = async (email, password) => {
    let user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    let isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function(next) {
    let user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

userSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    const filter = this.getFilter();
    await Task.deleteMany({owner: filter._id})

    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User