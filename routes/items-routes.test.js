process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
let items = require("../fakeDb");

let snickers = { name: "snickers", price: 1.99 };
let reeses = { name: "reeses", price: 1.75 };
let skittles = { name: "skittles", price: 1.50 };
let noName = { price: 1.50 }
let noPrice = { name: "noprice" }

beforeEach(function () {
    snickers = { name: "snickers", price: 1.99 }
    items.push(snickers);
    items.push(reeses);
});

afterEach(function () {
    items.length = 0;
});

// GET /items - returns [{ name: "snickers", price: 1.99 }, { name: "reeses", price: 1.75 }]

describe("Get /items", function () {
    test("Gets a list of items", async function () {
        const resp = await request(app).get('/items');
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual([snickers, reeses]);
    });
});

// GET /items/snickers - returns [{ name: "snickers", price: 1.99 }] or an error if item doesn't exist in DB

describe("GET /items/${itemName}", function () {
    test("Get a specific item", async function () {
        const resp = await request(app).get(`/items/${snickers.name}`);
        expect(resp.statusCode).toBe(200);
        expect(resp.body).toEqual(snickers);
    });

    test("Get an error code when an item that does not exist is requested", async function () {
        const resp = await request(app).get('/items/apple');
        expect(resp.statusCode).toBe(400);
    });
});

// POST /items -  returns status 201 with { 'added': newItem } or 400 and proper errors when data sent is incomplete

describe("POST /items", function () {
    test("Posts an item and returns the item properly", async function () {
        const resp = await request(app).post(`/items`).send(skittles);
        expect(resp.statusCode).toBe(201);
        expect(resp.body).toEqual({ "added": skittles });
    });

    test("Returns proper error when trying to post without name or price", async function () {
        const resp = await request(app).post(`/items`).send();
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": "Name and Price is required" });
    }
    );

    test("Returns proper error when trying to post without name", async function () {
        const resp = await request(app).post(`/items`).send(noName);
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": "Name is required" });
    });

    test("Returns proper error when trying to post without price", async function () {
        const resp = await request(app).post(`/items`).send(noPrice);
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": "Price is required" });
    });
});

// PATCH /items/snickers - returns { 'updated': { 'name': item.name, 'price': item.price } } or a 400 status code  and correct error if item isn't in DB or no item is requested 

describe("PATCH /items/${itemName}", function () {
    const updatedData = { "name": "new snickers", "price": 2.45 }

    test("Patches and returns updated item", async function () {
        const resp = await request(app).patch('/items/snickers').send(updatedData);
        expect(resp.statusCode).toBe(200);

        const updatedSnickers = items.find(item => item.name === "new snickers");
        expect(resp.body).toEqual({ "updated": updatedSnickers });
    });

    test("Send proper error when patch sent to item not in DB", async function () {
        const resp = await request(app).patch('/items/apple').send(updatedData);
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": 'Item is not found' });
    });

    test("Send proper error when no item is sent in request", async function () {
        const resp = await request(app).patch('/items/').send(updatedData);
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": 'No item name parameter given' });
    });
});

// DELETE /items/snickers - returns { message: 'Deleted' } or a 400 status code and correct error if item isn't in DB or no item is requested 

describe("DELETE /items/snickers", function () {
    test("Patches and returns updated item", async function () {
        const resp = await request(app).delete('/items/snickers');
        expect(resp.statusCode).toBe(202);
        expect(resp.body).toEqual({ message: 'Deleted' });
    });

    test("Send proper error when patch sent to item not in DB", async function () {
        const resp = await request(app).delete('/items/apple');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": 'Item is not found' });
    });

    test("Send proper error when no item is sent in request", async function () {
        const resp = await request(app).delete('/items/');
        expect(resp.statusCode).toBe(400);
        expect(resp.body).toEqual({ "error": 'No item name parameter given' });
    });
});