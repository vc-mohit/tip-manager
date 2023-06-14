require('dotenv').config()
const mongoose = require('mongoose');
const url = process.env.DATABASE_URL || "mongodb://localhost:27017/tipManager";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Successfully connected to Database - ' + url))
