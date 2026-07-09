const dotenv = require("dotenv");
const { connectDatabase } = require("./config/db");
const News = require("./models/News");
const seedNews = require("./data/seedNews");
const {
  ensureNewsIndex,
  isElasticsearchAvailable,
  replaceNewsIndex
} = require("./services/searchService");

dotenv.config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDatabase().then(async () => {
  await ensureNewsIndex();
  const existingCount = await News.countDocuments();

  if (existingCount === 0) {
    const insertedNews = await News.insertMany(seedNews);
    await replaceNewsIndex(insertedNews);
    console.log(`Auto-seeded ${seedNews.length} news records`);
  } else if (isElasticsearchAvailable()) {
    const allNews = await News.find().lean();
    await replaceNewsIndex(allNews);
    console.log(`Indexed ${allNews.length} news records in Elasticsearch`);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
