const express = require("express")
const router = new express.Router()
const ExpressError = require("../expressError")
const items = require("../fakeDb")

// GET /items - this should render a list of shopping items.
// Here is what a response looks like: [{"name": "popsicle", "price": 1.45}, {"name":"cheerios", "price": 3.40}]

router.get('/', (req, res) => {
    res.json(items)
})

// POST /items - this route should accept JSON data and add it to the shopping list.
// Here is what a sample request/response looks like: {"name":"popsicle", "price": 1.45} => {"added": {"name": "popsicle", "price": 1.45}}

router.post('/', (req, res, next) => {
    try {
        if (!req.body.name & !req.body.price) {
            throw new ExpressError("Name and Price is required", 400)
        } else if (!req.body.name) {
            throw new ExpressError("Name is required", 400)
        } else if (!req.body.price) {
            throw new ExpressError("Price is required", 400)
        }

        const newItem = { name: req.body.name, price: req.body.price };
        items.push(newItem);
        return res.status(201).json({ 'added': newItem })
    } catch (error) {
        return next(error)
    }
})

// GET /items/:name - this route should display a single item’s name and price.
// Here is what a sample response looks like: {"name": "popsicle", "price": 1.45}

router.get('/:name', (req, res, next) => {
    try {
        const foundItem = items.find(item => item.name === req.params.name)
        if (foundItem === undefined) {
            throw new ExpressError("Item is not found", 400)
        }

        return res.json(foundItem)

    } catch (error) {
        return next(error)
    }
})

// PATCH /items/:name, this route should modify a single item’s name and/or price.
// Here is what a sample request/response looks like: {"name":"new popsicle", "price": 2.45} => {"updated": {"name": "new popsicle", "price": 2.45}}

router.patch('/:name', (req, res, next) => {
    try {
        const foundItem = items.find(item => item.name === req.params.name)

        if (foundItem === undefined) {
            throw new ExpressError("Item is not found", 400)
        }

        foundItem.name = req.body.name
        foundItem.price = req.body.price

        return res.json({ 'updated': { 'name': foundItem.name, 'price': foundItem.price } })
    } catch (error) {
        return next(error)
    }
})

// DELETE /items/:name - this route should allow you to delete a specific item from the array.
// Here is what a sample response looks like: {message: "Deleted"}

router.delete('/:name', (req, res, next) => {
    try {
        const foundItem = items.find(item => item.name === req.params.name)
        console.log('***********', items)

        if (foundItem === undefined) {
            throw new ExpressError("Item is not found", 400)
        }

        items.splice(items.indexOf(foundItem), 1)
        return res.status(202).json({ message: 'Deleted' })
    } catch (error) {
        return next(error)
    }
})

// Found this method to handle non-existent requests.  This was a solution to the issue where if the Patch or Delete routes were called without a name parameter, it would just timeout.

router.all('*', (req, res, next) => {
    try {
        if (!req.params.name) {
            throw new ExpressError("No item name parameter given", 400)
        }
    } catch (error) {
        return next(error)
    }
})

module.exports = router;