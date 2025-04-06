const multer = require('multer');

// Store file in memory as buffer
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
