const mongoose = require('mongoose');
const validators = require("../utils/validators.js");

let tipManagerSchema = new mongoose.Schema({
	username: { type: String, default: "" },
	emailId: { type: String, required: true, unique: true, default: "" },
	password: { type: String, default: "" },
	isLogin: { type: Boolean, default: false },
	role: { type: String, default: "" },
	createdBy: { type: String, default: "" },
	updatedBy: { type: String, default: "" },
	CTS: { type: String, default: validators.getCurrentDate() },
	UTS: { type: String, default: validators.getCurrentDate() },
})

let tipSchema = new mongoose.Schema({
	emailId: { type: String, required: true, default: "" },
	placeName: { type: String, default: "" },
	placeAddress: { type: String, default: "" },
	totalAmount: { type: Number, default: 0 },
	tipPercentage: { type: Number, default: 0 },
	tipAmount: { type: Number, default: 0 },
	createdBy: { type: String, default: "" },
	updatedBy: { type: String, default: "" },
	CTS: { type: String, default: validators.getCurrentDate() },
	UTS: { type: String, default: validators.getCurrentDate() },
})

var userModel = mongoose.model('Users', tipManagerSchema, 'users');
var tipModel = mongoose.model('Tips', tipSchema, 'tip');

module.exports = { userModel, tipModel }
