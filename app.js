var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
require("dotenv").config();
var { mongoConnect } = require("./mongo.js");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

mongoConnect();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productsRouter = require("./routes/products");


var app = express();

app.use(cors());
app.options("*", cors());
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);
app.post("/create-checkout-session", async (req, res) => {
	try {
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: req.body.name,
						},
						unit_amount: req.body.price * 100,
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: "http://localhost:3000/",
			cancel_url: "http://localhost:4000/cancel",
		})
		res.json({ url: session.url });
	} catch (error) {
		console.log(error);
	}
});

// app.use("/blogs", blogsRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

module.exports = app;
