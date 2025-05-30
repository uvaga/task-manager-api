const mongoose = require('../src/db/mongoose')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, setupDatabase} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should sign up a new user', async () => {
    let response = await request(app).post('/users').send({
        name: 'Andron',
        email: 'andronik@mail.ru',
        password: 'k94jdhq038hfbw'
    }).expect(201)

    let user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()
    expect(response.body.user.name).toBe('Andron')
    expect(response.body).toMatchObject({
        user: {
            name: 'Andron',
            email: 'andronik@mail.ru'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('k94jdhq038hfbw')
})

test('Should login existing user', async () => {
    let response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    let user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexisting user', async () => {
    await request(app).post('/users/login').send({
        email: 'lalala@mail.ru',
        password: 'mypashhhsword1!2)#@!$E'
    }).expect(401)
})

test('Should get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for user', async() => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Should delete account for user', async() => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    let user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for user', async() => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload my avatar', async() => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/matroskin___.jpg')
        .expect(200)

    let user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Mike'
        })
        .expect(200)
    let user = await User.findById(userOneId)
    expect(user.name).toBe('Mike')
})

test('Should not update invalid user fields', async() => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Minsk'
        })
        .expect(400)
})

afterAll(async () => {
    await mongoose.connection.close();
});
