require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const seedDatabase = require('./utils/seeder');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Seed initial data if needed
    await seedDatabase();

    // 3. Create HTTP & Socket server
    const server = http.createServer(app);
    initSocket(server);

    // 4. Start Listening
    server.listen(PORT, () => {
      console.log(`FoodDelight Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Socket.IO listening for real-time delivery tracking & updates`);
    });
  } catch (err) {
    console.error('Fatal Server Startup Error:', err);
    process.exit(1);
  }
};

startServer();

