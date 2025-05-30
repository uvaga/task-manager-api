const request = require('supertest')
const mongoose = require('../src/db/mongoose')
const Task = require('../src/models/task')
const app = require('../src/app')
const {userOneId, userOne, userTwo, setupDatabase, taskOne} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
    let response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'From my test'
        })
        .expect(201)

    let task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Get tasks for user one', async() => {
    let response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)
})

test('Get tasks for user two', async() => {
    let response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(1)
})

test('Should fail to delete task one by second user', async () => {
    await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)

    let task = Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

afterAll(async () => {
    await mongoose.connection.close();
});