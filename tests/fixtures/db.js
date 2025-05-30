const mongoose = require("../../src/db/mongoose");
const jwt = require("jsonwebtoken");
const User = require("../../src/models/user");
const Task = require('../../src/models/task')
const userOneId = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'My Name',
    email: 'my@email.com',
    password: 'mypashhhsword1!2)#@!$E',
    tokens: [
        {
            token: jwt.sign({ _id: userOneId}, process.env.JWT_SECRET)
        }
    ]
}

const userTwoId = new mongoose.Types.ObjectId()
const userTwo = {
    _id: userTwoId,
    name: 'NOT My Name',
    email: 'notmy@email.com',
    password: 'myp2222rd1!2)#@!$E',
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId}, process.env.JWT_SECRET)
        }
    ]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task One',
    owner: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task Two',
    completed: true,
    owner: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Task Three',
    completed: true,
    owner: userTwoId
}

const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOneId,
    userOne,
    userTwo,
    setupDatabase,
    taskOne
}