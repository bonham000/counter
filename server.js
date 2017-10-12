const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');

dotenv.config();

const production = process.env.NODE_ENV === 'production';
const PORT = production ? process.env.PORT : 5000;
const MONGO_URL = production
	? process.env.MONGO_PROD_URL
	: process.env.MONGO_URL;

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_URL, {
	useMongoClient: true,
});

const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
	total: {
	  type:  Number,
	  default: 0,
	}
});

const Attendance = mongoose.model('Attendance', AttendanceSchema);

const app = express();

app.post('/register-attendance', (req, res) => {
	const options = { upsert: true, new: true, setDefaultsOnInsert: true };
	Attendance.findOneAndUpdate({}, {}, options, (err, doc) => {
		if (doc) {
			doc.total++;
			doc.save(err => {
			  if (err) {
			    console.log('There was an error updating the count...');
			    console.log(err);
			    res.status(500);
			  } else {
			    console.log('Count updated!');
			    res.end();
			  }
			});
		}
		res.end();
	});
});

const calculateDayRange = () => {
	const oneDay = 24 * 60 * 60 * 1000;
	const startDate = new Date(2017, 9, 8);
	const currentDate = new Date();
	return Math.floor(
		Math.abs(
			(startDate.getTime() - currentDate.getTime()) / (oneDay)
		)
	);
}

app.get('/get-count', (req, res) => {
	  Attendance.findOne({}, (err, doc) => {
  	if (err) res.send('An error occurred... T_T');
  	if (!doc) {
  		res.send('No one visited yet... very depressing. (っ- ‸ – ς)');
  	} else {
			const { total } = doc;
			const average = Math.floor(total / calculateDayRange());
  		res.send(`
				つ ◕_◕ ༽つ  つ ◕_◕ ༽つ ~~~ "The current count is ${total}" ~~~ (started on Oct. 8, 2017 — about ${average} hits per day).
			`);
  	}
  });
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, () => {
  console.log(`Sophisticated counter app listening on port ${PORT}!`);
});
