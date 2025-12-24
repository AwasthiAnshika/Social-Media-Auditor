const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (req, res) => {
	res.json({
		success: true,
		message: 'Service is healthy',
		data: { status: 'up' },
		meta: { uptime: process.uptime() },
	});
});

app.use((req, res) => {
	res.status(404).json({ success: false, message: 'Not Found' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	console.error(err);
	res.status(err.status || 500).json({
		success: false,
		message: err.message || 'Internal Server Error',
	});
});

module.exports = app;

