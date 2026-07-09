const dotenv = require("dotenv");
const { connectDatabase, disconnectDatabase } = require("../config/db");
const News = require("../models/News");
const seedNews = require("../data/seedNews");
const { ensureNewsIndex, replaceNewsIndex } = require("../services/searchService");

dotenv.config();

const runSeed = async () => {
  try {
    await connectDatabase();
    await ensureNewsIndex();
    await News.deleteMany({});
    const insertedNews = await News.insertMany(seedNews);
    await replaceNewsIndex(insertedNews);
    console.log(`Seeded ${seedNews.length} India-focused news records`);
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    await disconnectDatabase();
    process.exit(1);
  }
};

runSeed();
