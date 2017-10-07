const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');

dotenv.config();

const MONGO_URL = process.env.NODE_ENV === 'production'
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
const PORT = process.env.PORT ? process.env.PORT : 5000;

app.post('/register-attendance', (req, res) => {
	const options = { upsert: true, new: true, setDefaultsOnInsert: true };
	Attendance.findOneAndUpdate({}, {}, options, (err, doc) => {
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
	});
});

app.get('/', (req, res) => {
  Attendance.findOne({}, (err, doc) => {
  	if (err) res.send('An error occurred... T_T');
  	res.send(`つ ◕_◕ ༽つ  つ ◕_◕ ༽つ — "The current count is ${doc.total}."`);
  });
});

app.listen(5000, () => {
  console.log('Sophisticated counter app listening on port 5000!');
});