const tips = require("../models/tipManagerModel.js").tipModel;

exports.save = async tips => await tips.save()
    .then(res => { return res; })
    .catch(err => { return err; });

exports.find = async findParam => await tips.find(findParam)
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.findOne = async findParam => await tips.findOne(findParam)
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.findOneAndUpdate = async (updatethrough, updatedetails) => await tips.findOneAndUpdate(updatethrough, updatedetails,
    {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
    })
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.findOneAndDelete = async findParam => await tips.findOneAndDelete(findParam)
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.updateOne = async (updatethrough, updatedetails) => await tips.updateOne(updatethrough, updatedetails, { new: true })
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });
