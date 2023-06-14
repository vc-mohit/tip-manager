require('dotenv').config()
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const fs = require('fs');
const log4js = require('log4js');
const logger = log4js.getLogger('App');
const PORT = process.env.PORT || 4500;
const jwtToken = require("./utils/jwtToken.js");
const jwtSecret = process.env.JWT_SECRET;
const bearerToken = require('express-bearer-token');

// Configure Logger
log4js.configure({
	appenders: { TipManager: { type: 'dateFile', filename: 'tip_manager_log.log', pattern: '.yyyy-MM-dd', compress: true } },
	categories: { default: { appenders: ['TipManager'], level: 'debug' } }
});

// Configure bodyParser and CORS Policy
app.options('*', cors());
app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: false }));

// Connect to MongoDB via Mongoose
require("./db/mongooseconnection.js");

// Configure JWT
app.set('secret', jwtSecret);
app.use(bearerToken());
app.use(async function (req, res, next) {

	if ((req.path.match("/users/signup")) || (req.path.match("/users/login"))
	) {
		return next();
	}
	else {
		var token = req.token;
		var jwtValue = await jwtToken.verifyJWTToken(token, app.get('secret'));
		if (!jwtValue) {
			return res.status(400).send({ status: false, statusCode: 400, message: 'Failed to Authenticate Token' });
		}
		else {
			req.emailId = jwtValue.emailId;
			req.role = jwtValue.role;
			return next();
		}

	}

});

// Routes
const users = require('./routes/users.js');
app.use('/users', users);

const tip = require('./routes/tip.js');
app.use('/tip', tip);

// Application Index API 
app.get('/', function (req, res) {
	logger.info(`App starting on port: ${PORT}`);
	res.status(200).send({ status: true, statusCode: 200, message: `App starting on port: ${PORT}` });
});

/**
 *  Description - Get Profile Pic by Passing Email ID
 *  API Type - GET API
 *  Parameters - required
 *  Success message - 
 *  Error message - 
**/
app.get('/public/user/:emailId', function (req, res) {

	var emailId = req.params.emailId;
	if (!emailId) {
		logger.error("E-Mail ID is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "E-Mail ID is mandatory" });
	}

	var filePath = __dirname + "/public/user/" + emailId + ".jpg";

	fs.readFile(filePath, function (err, data) {
		if (err) return res.status(400).send({ status: 400, statusCode: false, message: err.message, data: err });
		return res.sendFile(filePath);
	})

});

// Listen app on given port
app.listen(PORT, function () {
	logger.info(`App starting on port: ${PORT}`);
	console.log(`App starting on port: ${PORT}`);
});