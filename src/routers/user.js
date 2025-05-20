const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail, sendCancelEmail} = require('../emails/account')
const router = new express.Router()

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        let token = await user.genJwt()
        res.status(201).send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        let user = await User.findByCredentials(req.body.email, req.body.password)
        let token = await user.genJwt()
        res.send({user, token})
    } catch(e) {
        console.log(e)
        res.status(401).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
      try {
          req.user.tokens = []
          await req.user.save()

          res.send()
      } catch (e) {
          res.status(500).send(e)
      }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        let user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch(e) {
        res.status(500).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {
    try {
        let updates = Object.keys(req.body)
        const allowedKeys = ['name', 'email', 'password', 'age', 'occupation']
        let isAllowed = updates.every((key) => allowedKeys.includes(key))
        if (!isAllowed) {
            return res.status(400).send({error: 'Invalid key!'})
        }

        let user = req.user

        updates.forEach((update) => {
            user[update] = req.body[update]
        })
        await user.save()

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.deleteOne()
        sendCancelEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

const upload = multer({
    limits: {
        fileSize: 1024000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/(jpe?g|png)$/i)) {
            cb(new Error('Please upload image file'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    let buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    console.log(error)
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        let user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        console.log(e)
        res.status(404).send()
    }
})

module.exports = router