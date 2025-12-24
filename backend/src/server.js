const http = require('http');
const dotenv = require('dotenv');
const app = require('./app');

dotenv.config();

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

function start() {
	server.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`);
	});
}

if (require.main === module) {
	start();
}

function gracefulShutdown(signal) {
	console.log(`Received ${signal}. Shutting down gracefully.`);
	server.close((err) => {
		if (err) {
			console.error('Error during server close', err);
			process.exit(1);
		}
		console.log('Closed out remaining connections.');
		process.exit(0);
	});

	setTimeout(() => {
		console.error('Forcing shutdown.');
		process.exit(1);
	}, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = server;

