const crypto = require('crypto');
const fs = require('fs');

const generateHash = (filePath) => {
	const fileBuffer = fs.readFileSync(filePath);
	const hashSum = crypto.createHash('sha256');
	hashSum.update(fileBuffer);

	const hex = hashSum.digest('hex');

	console.log(hex);

	return hex;
};

module.exports = generateHash;
