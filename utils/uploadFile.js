const multer = require("multer");
const path = require("path");

var uploadProfilePicture = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/user/');
        },
        filename: function (req, file, cb) {
            var extname = path.extname(file.originalname).toLowerCase();
            var emailId = req.body.emailId;
            var fullPath = emailId + extname;
            cb(null, fullPath);
        }
    }),
    limits: { fileSize: 5000000 }, // In bytes: 5000000 bytes = 5 MB
}).single('profilePicture');

exports.uploadProfilePicture = uploadProfilePicture;
