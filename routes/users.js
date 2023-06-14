const router = require('express').Router();
const log4js = require('log4js');
const logger = log4js.getLogger('UsersLog');
const configs = require("../configs/config.json");
const UserSchema = require("../models/tipManagerModel.js");
const userDb = require("../db/userdb.js");
const jwtToken = require("../utils/jwtToken.js");
const uploadProfilePicture = require("../utils/uploadFile.js").uploadProfilePicture;
const validators = require("../utils/validators.js");
const emailService = require("../utils/email.js");


/**
 *  Description - Update Counter By Counter Name Function
 *  Parameters - counterName
 *  Success message 
 *  Error message 
**/
async function updateLoginStatus(emailId, loginStatus) {

	var json = {};
	json["isLogin"] = loginStatus;
	json["UTS"] = validators.getCurrentDate();

	var updatedetails = { $set: json };
	var updatethrough = { emailId: emailId };

	var updateUserDetails = await userDb.findOneAndUpdate(updatethrough, updatedetails);

	if (updateUserDetails.code == "11000") {
		logger.error("Details Already exists");
		return { status: false, statusCode: 400, message: "Details Already exists - " + emailId }
	}
	else if (updateUserDetails.message == "User not found") {
		logger.error("Internal server error");
		return { status: false, statusCode: 500, message: "Internal server error", data: updateUserDetails.message }
	}
	else {
		logger.info("Login status updated");
		return { status: true, statusCode: 200, message: "Login status updated" }
	}

}

/**
 *  Description - Registration and E-Mail Verifiaction API of User["MENTOR", "MENTEE"]
 *  API Type - POST API
 *  Parameters - required
 *  Success message - User Registered Successfully
 *  Error message - "No data found with error code 400"
**/
router.post('/signup', uploadProfilePicture, async function (req, res, next) {

	var username = req.body.username;
	var emailId = req.body.emailId;
	var password = req.body.password;
	var file = req.file;

	if (!username) {
		logger.error("User Name is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "User Name is mandatory" });
	}
	if (!emailId) {
		logger.error("E-Mail ID is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "E-Mail ID is mandatory" });
	}
	if (!file) {
		logger.error("Profile Picture is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "Profile Picture is mandatory" });
	}
	if (!password) {
		logger.error("Password is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "Password is mandatory" });
	}

	var findParam = { emailId: emailId };
	var findUser = await userDb.findOne(findParam);
	if (findUser.message == "User not found") {

		var newUser = UserSchema.userModel();
		newUser.username = username;
		newUser.emailId = emailId;
		newUser.password = password;
		newUser.isLogin = false;
		newUser.role = "USER";
		newUser.createdBy = emailId;
		newUser.updatedBy = emailId;
		newUser.CTS = validators.getCurrentDate();
		newUser.UTS = validators.getCurrentDate();

		var saveDetails = await userDb.save(newUser);
		if (saveDetails.code == "11000") {
			logger.error("Details already exist");
			return res.status(400).send({ status: false, statusCode: 400, message: "Details already exist" });
		}
		else if (saveDetails.message) {
			logger.error("Internal Server Error");
			return res.status(500).send({ status: false, statusCode: 500, message: "Internal Server Error", data: saveDetails.message });
		}
		else {

			var emailData = {};
			emailData.emailId = emailId;
			emailData.username = username;

			var sendemail = await emailService.sendEmail(emailData);
			if (!sendemail) {
				logger.error("Error while sending an E-Mail")
				return res.status(400).send({ status: false, statusCode: 400, message: "Error while sending an E-Mail", data: sendemail });
			}
			logger.info("User Registered Successfully");
			return res.status(200).send({ status: true, statusCode: 200, message: "User Registered Successfully" });
		}

	}
	else if (findUser.message) {
		logger.error("Internal Server Error");
		return res.status(500).send({ status: false, statusCode: 500, message: "Internal Server Error", data: findUser.message });
	}
	else {
		logger.error(`${emailId} is already registerd`);
		return res.status(400).send({ status: false, statusCode: 400, message: `${emailId} is already registerd` });
	}

});

/**
 *  Description - Login API of User
 *  API Type - POST API
 *  Parameters - required
 *  Success message - User logged In Successfully
 *  Error message - "No data found with error code 400"
**/
router.post("/login", async (req, res) => {

	var emailId = req.body.emailId;
	var password = req.body.password;

	if (!emailId) {
		logger.error("E-Mail ID is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "E-Mail ID is mandatory" });
	}
	if (!password) {
		logger.error("Password is mandatory");
		return res.status(400).send({ status: false, statusCode: 400, message: "Password is mandatory" });
	}

	var findParam = { emailId: emailId };
	var findUser = await userDb.findOne(findParam);
	if (findUser.message == "User not found") {
		logger.error("E-Mail ID mentioned is not Registered");
		return res.status(400).send({ status: false, statusCode: 400, message: "E-Mail ID mentioned is not Registered" });
	}
	else if (findUser.message) {
		logger.error("Internal Server Error");
		return res.status(500).send({ status: false, statusCode: 500, message: "Internal Server Error", data: findUser.message });
	}
	else {

		if (findUser.isLogin == true) {
			logger.error("User is already logged in");
			return res.status(400).send({ status: false, statusCode: 400, message: "User is already logged in" });
		}
		else {

			if (findUser.emailId != emailId || findUser.password != password) {
				logger.error("Invalid Credentials");
				return res.status(400).send({ status: false, statusCode: 400, message: "Invalid Credentials" });
			}
			else {

				var role = findUser.role;
				var loginStatus = true;

				var token = jwtToken.createJWTToken(emailId, role);
				await updateLoginStatus(emailId, loginStatus);

				logger.info("User logged in Successfully");
				return res.status(200).send({
					status: true, statusCode: 200, message: "User logged in Successfully",
					data: {
						username: findUser.username,
						token: token,
					}
				});

			}
		}

	}

});


module.exports = router;