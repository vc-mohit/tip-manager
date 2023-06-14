const users = require("../models/tipManagerModel.js").userModel;

exports.save = async users => await users.save()
    .then(res => { return res; })
    .catch(err => { return err; });

exports.find = async findParam => await users.find(findParam)
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.findOne = async findParam => await users.findOne(findParam)
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.findOneAndUpdate = async (updatethrough, updatedetails) => await users.findOneAndUpdate(updatethrough, updatedetails,
    {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
    })
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.findOneAndDelete = async findParam => await users.findOneAndDelete(findParam)
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });

exports.updateOne = async (updatethrough, updatedetails) => await users.updateOne(updatethrough, updatedetails, { new: true })
    .then(res => { if (!res) { throw new Error('User not found') } else { return res; } })
    .catch(err => { return err; });
