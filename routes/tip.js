const router = require('express').Router();
const log4js = require('log4js');
const moment = require('moment');
const logger = log4js.getLogger('TipsLog');
const configs = require("../configs/config.json");
const TipSchema = require("../models/tipManagerModel.js");
const tipsDb = require("../db/tipsdb.js");
const validators = require("../utils/validators.js");


/**
 *  Description - Calculate Tip Percentage and Save data in DB
 *  API Type - POST API
 *  Parameters - required
 *  Success message - 
 *  Error message - 
**/
router.post("/calculate", async function (req, res) {

    var emailId = req.emailId;
    if (!emailId) {
        logger.error("Invalid Token");
        return res.status(400).send({ status: false, statusCode: 400, message: "Invalid Token" });
    }

    var placeName = req.body.placeName;
    var placeAddress = req.body.placeAddress;
    var totalAmount = req.body.totalAmount;
    var tipPercentage = req.body.tipPercentage;

    if (!emailId) {
        logger.error("E-Mail ID is mandatory");
        return res.status(400).send({ status: false, statusCode: 400, message: "E-Mail ID is mandatory" });
    }
    if (!placeName) {
        logger.error("Place Name is mandatory");
        return res.status(400).send({ status: false, statusCode: 400, message: "Place Name is mandatory" });
    }
    if (!placeAddress) {
        logger.error("Place Address is mandatory");
        return res.status(400).send({ status: false, statusCode: 400, message: "Place Address is mandatory" });
    }
    if (!totalAmount) {
        logger.error("Total Amount is mandatory");
        return res.status(400).send({ status: false, statusCode: 400, message: "Total Amount is mandatory" });
    }
    if (!tipPercentage) {
        logger.error("Tip Percentage is mandatory");
        return res.status(400).send({ status: false, statusCode: 400, message: "Tip Percentage is mandatory" });
    }

    var newTip = TipSchema.tipModel();
    newTip.emailId = emailId;
    newTip.placeName = placeName;
    newTip.placeAddress = placeAddress;
    newTip.totalAmount = totalAmount;
    newTip.tipPercentage = tipPercentage;
    newTip.tipAmount = (totalAmount / 100) * tipPercentage;
    newTip.createdBy = emailId;
    newTip.updatedBy = emailId;
    newTip.CTS = validators.getCurrentDate();
    newTip.UTS = validators.getCurrentDate();

    var saveDetails = await tipsDb.save(newTip);
    if (saveDetails.code == "11000") {
        logger.error("Details already exist");
        return res.status(400).send({ status: false, statusCode: 400, message: "Details already exist" });
    }
    else if (saveDetails.message) {
        logger.error("Internal Server Error");
        return res.status(500).send({ status: false, statusCode: 500, message: "Internal Server Error", data: saveDetails.message });
    }
    else {
        logger.info("Tips saved successfully");
        return res.status(200).send({ status: true, statusCode: 200, message: "Tips saved successfully", tip: newTip.tipAmount });
    }

});

/**
 *  Description - Get All Saved Tips
 *  API Type - GET API
 *  Parameters - required
 *  Success message - 
 *  Error message - 
**/
router.get("/getalltips", async function (req, res) {

    var emailId = req.emailId;
    if (!emailId) {
        logger.error("Invalid Token");
        return res.status(400).send({ status: false, statusCode: 400, message: "Invalid Token" });
    }

    var findParam = { emailId: emailId };
    var findTips = await tipsDb.find(findParam);
    if (findTips.message == "User not found" || findTips.length == 0) {
        logger.error("Tips Not Found");
        return res.status(400).send({ status: false, statusCode: 400, message: "Tips Not Found" });
    }
    else if (findTips.message) {
        logger.error("Internal Server Error");
        return res.status(500).send({ status: false, statusCode: 500, message: "Internal Server Error", data: findTips.message });
    }
    else {
        logger.info("All Tips fetched successfully");
        return res.status(200).send({
            status: true, statusCode: 200, message: "All Tips fetched successfully",
            totalTips: findTips.length, data: findTips
        });
    }

});

/**
 *  Description - Get All Saved Tips according to Filters
 *  API Type - GET API
 *  Parameters - required
 *  Success message - 
 *  Error message - 
**/
router.get("/", async function (req, res) {

    var emailId = req.emailId;
    if (!emailId) {
        logger.error("Invalid Token");
        return res.status(400).send({ status: false, statusCode: 400, message: "Invalid Token" });
    }

    var analyticsType = req.query.analyticsType;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;

    var formatStartDate = moment(startDate, 'DD-MM-YYYY HH:mm:ss').format(configs.format_config.DATE_FORMAT);
    var formatEndDate = moment(endDate, 'DD-MM-YYYY HH:mm:ss').format(configs.format_config.DATE_FORMAT);

    var findTips = await TipSchema.tipModel.find({
        emailId: emailId,
        CTS: {
            $gte: formatStartDate,
            $lt: formatEndDate
        }
    }).exec();

    // var findParam = { emailId: emailId }
    // var findTips = await TipSchema.tipModel.find(findParam);
    if (findTips.message == "User not found" || findTips.length == 0) {
        logger.error("Tips Not Found");
        return res.status(400).send({ status: false, statusCode: 400, message: "Tips Not Found" });
    }
    else if (findTips.message) {
        logger.error("Internal Server Error");
        return res.status(500).send({ status: false, statusCode: 500, message: "Internal Server Error", data: findTips.message });
    }
    else {

        var allTips = [];
        var tipsLength = findTips.length;

        if (analyticsType == "tipPercentage") {

            for (var i = 0; i < tipsLength; i++) {
                allTips.push(findTips[i].tipPercentage);
                var maxTip = await validators.countAndHighestOccurance(allTips);
            }

            logger.info("All Tips fetched successfully according to Tips Percentage");
            return res.status(200).send({
                status: true, statusCode: 200, message: "All Tips fetched successfully according to Tips Percentage",
                data: {
                    tipPercentage: maxTip.item,
                    noOfTimes: maxTip.ocurrences
                }
            });

        }

        if (analyticsType == "mostVisitedPlaces") {

            for (var j = 0; j < tipsLength; j++) {
                allTips.push(findTips[j].placeName);
                var maxPlace = await validators.countAndHighestOccurance(allTips);
            }

            logger.info("All Tips fetched successfully according to Most Visited Places");
            return res.status(200).send({
                status: true, statusCode: 200, message: "All Tips fetched successfully according to Most Visited Places",
                data: {
                    mostVisitedPlaces: maxPlace.item,
                    noOfTimes: maxPlace.ocurrences
                }
            });

        }

        if (analyticsType == "") {

            for (var k = 0; k < tipsLength; k++) {
                allTips.push({
                    placeName: findTips[k].placeName,
                    totalAmount: findTips[k].totalAmount,
                    tipAmount: findTips[k].tipAmount
                });
            }

            logger.info("All Tips fetched successfully according to Tips Percentage");
            return res.status(200).send({
                status: true, statusCode: 200, message: "All Tips fetched successfully according to Tips Percentage",
                totalPlaces: allTips.length, data: allTips
            });

        }

    }

});

module.exports = router;