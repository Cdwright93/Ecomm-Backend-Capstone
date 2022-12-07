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

/* GET users listing. */
router.get("/", function (req, res, next) {
	res.send("respond with a resource");
});

//get user by email
router.get("/email/:email", async (req, res) => {
	const { email } = req.params;
	const user = await db().collection("users").findOne({
		email: email,
	});
	try {
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});

//get user by id
router.get("/id/:id", async (req, res) => {
	const { id } = req.params;
	const user = await db().collection("users").findOne({
		_id: id,
	});
	try {
		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
});



router.post("/register", async (req, res, next) => {
	const { email, password, firstname, lastname } = req.body;
	const hashedPassword = await hash(password, 5);
	const user = {
		_id: uuid(),
		email,
		password: hashedPassword,
		firstname,
		lastname,
		subscribed: {
			status: false,
			date: null,
			tier: null,
			address: null,
		},
	};
	await db().collection("users").insertOne(user);
	res.json(user);
});

//login with email and password and get a token
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	const user = await db().collection("users").findOne({
		email,
	});
	if (!user) {
		return res.status(400).json({
			success: false,
			error: "User not found",
		});
	}
	const validPassword = await compare(password, user.password);
	if (!validPassword) {
		return res.status(400).json({
			error: "Invalid password",
		});
	}
	const userdata = {
		_id: user._id,
		email: user.email,
		firstname: user.firstname,
		lastname: user.lastname,
		subscribed: user.subscribed,
	};
	const token = sign(
		{
			Date: new Date(),
			userdata,
		},
		process.env.JWT_SECRET_KEY,
		{
			expiresIn: "24h",
		}
	);
	res.json({
		success: true,
		token,
	});
});
module.exports = router;
