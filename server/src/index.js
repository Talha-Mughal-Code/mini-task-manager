const env = require('./config/env');
const { connectToDatabase } = require('./config/db');
const app = require('./app');

async function start() {
  try {
    await connectToDatabase();
    app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
