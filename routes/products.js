var express = require("express");
var router = express.Router();
const { db } = require("../mongo.js");
const { uuid } = require("uuidv4");
const { hash, compare } = require("bcryptjs");
const { sign, verify } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
const { endsWith } = require("lodash");
const { token } = require("morgan");
const e = require("express");
const { contains } = require("lodash");
require("dotenv").config();


// get all products... hmm

router.get("/", async (req, res) => {
    const products = await db().collection("products").find({}).toArray();
    try {
        if (products) {
            res.json(products);
        } else {
            res.status(404).json({ message: "Products not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get product by id

router.get("/id/:id", async (req, res) => {
    const { id } = req.params;
    const product = await db().collection("products").findOne({
        _id: id,
    });
    try {
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get product by name

router.get("/name/:name", async (req, res) => {
    const { name } = req.params;
    const product = await db().collection("products").findOne({
        name: name,
    });
    try {
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// post product
router.post("/add", async (req, res) => {
    const { name, price, description, image } = req.body;
    const product = {
        _id: uuid(),
        name,
        price,
        description,
        image
    };
    try {
        const newProduct = await db().collection("products").insertOne(product);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
);

// update product
router.put("/update/:id", async (req, res) => {
    const { id } = req.params;
    const { name, price, description, image } = req.body;
    const product = {
        name,
        price,
        description,
        image
    };
    try {
        const updatedProduct = await db().collection("products").updateOne({ _id: id
        }, { $set: product });
        res.status(201).json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
);

// delete product
router.delete("/delete/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await db().collection("products").deleteOne({ _id: id
        });
        res.status(201).json(deletedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
);

module.exports = router;
