const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;

const connectDatabase = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: "mini-news-platform"
        }
      });
      mongoUri = memoryServer.getUri();
      console.log("Using in-memory MongoDB instance");
    }

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};
