const express = require('express')
const Task = require("../models/task");
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const task = new Task(
        {
            ...req.body,
            owner: req.user._id
        }
    )
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true|false
// GET /tasks?limit=10&skip=20
// GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    try {
        //let tasks = await Task.find({owner: req.user._id})
        let match = {}
        let sort = {}
        if (req.query.completed) {
            match.completed = req.query.completed === 'true'
        }
        if (req.query.sortBy) {
            let parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
        }
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })
        res.send(req.user.tasks)
    } catch(e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id
    try {
        let task = await Task.findOne({_id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    let updates = Object.keys(req.body)
    const keysAllowed = ['description', 'completed']
    let isAllowed = updates.every((key) => keysAllowed.includes(key))

    if (!isAllowed) {
        return res.status(400).send({error: 'Invalid key!'})
    }

    try {
        //let task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        //let task = await Task.findById(req.params.id)
        let task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        if (!task) {
            res.status(404).send()
        }
        updates.forEach((update) => {
            task[update] = req.body[update]
        })
        await task.save()

        res.send(task)
    } catch(e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    try {
        let task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router