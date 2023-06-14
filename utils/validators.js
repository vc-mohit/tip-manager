const moment = require('moment');
const configs = require("../configs/config.json");

// Get Current Data of System
function getCurrentDate() {
    var date = moment(new Date());
    date = moment().format(configs.format_config.DATE_FORMAT, date);
    return date;
}

// Get Count and Highest Occurance of an element in an Array
function countAndHighestOccurance(arr = []) {
    let item = arr[0];
    let ocurrencesMap = {};
    for (let i in arr) {
        const current = arr[i];
        if (ocurrencesMap[current]) ocurrencesMap[current]++;
        else ocurrencesMap[current] = 1;
        if (ocurrencesMap[item] < ocurrencesMap[current]) item = current;
    }
    return {
        item: item,
        ocurrences: ocurrencesMap[item]
    };
}

exports.getCurrentDate = getCurrentDate;
exports.countAndHighestOccurance = countAndHighestOccurance;
