const csv = require('csvtojson');
const fs = require('fs');
const { parseAsync } = require('json2csv');
const formatChip007Keys = require('./utils/helpers/formatChip007Keys');
const generateHash = require('./utils/helpers/getHashFromfile');

console.log('Process argv: ', process.argv);

// get output file from console input
const filePath = process.argv[2];
const JSON_OUTPUT = 'CHIP-0007-output.json';
const CSV_OUTPUT = `${filePath.split('.')[0]}.output.csv`;

if (!filePath) {
	console.error('Please specify file path');
}

(async function () {
	// convert csv to json array
	let jsonArray;

	try {
		jsonArray = await csv().fromFile(filePath);
	} catch (error) {
		console.log('Error: ', error.message);
		return;
	}
	const newArr = [];

	// add format key to json
	for (let obj of jsonArray) {
		// check required fields from Chia CHIP-0007 Docs

		obj = {
			format: 'CHIP-0007',
			...obj,
		};
		// convert all uppercase and spaced keys to lowercase snake-case
		const formattedObj = formatChip007Keys(obj);
		console.log('Formatted object: ', formattedObj);

		// check required chip-0007 properties according to chia docs, see https://github.com/Chia-Network/chips/blob/metadata-schema/assets/chip-0007/schema.json
		if (!formattedObj.name || !formattedObj.description) {
			console.error(
				'Please ensure your csv file has a "Name" and "Description" field'
			);
			return;
		}
		newArr.push(formattedObj);
	}

	console.log(newArr);

	// create json file
	fs.writeFile(
		JSON_OUTPUT,
		JSON.stringify(newArr),
		{ encoding: 'utf8' },
		async (err) => {
			if (err) {
				console.error('Error occured: ', err);
				return;
			}
			console.log('file written successfully');

			// calculate sha256 hash of json file
			const hash = generateHash(JSON_OUTPUT);
			console.log('Generated hash: ', hash);

			// append hash to each json object and create column in csv
			for (let obj of jsonArray) {
				obj['Hash'] = hash;
			}

			// create csv string
			const csvOutput = await parseAsync(jsonArray);

			// write csv string to file
			fs.writeFile(CSV_OUTPUT, csvOutput, { encoding: 'utf8' }, (err2) => {
				if (err2) {
					console.error('Error occured: ', err2);
					return;
				}

				console.log('Output CSV generated successfully');
			});
		}
	);
})();
