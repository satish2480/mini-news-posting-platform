const { elasticClient, ELASTICSEARCH_INDEX } = require("../config/elasticsearch");

let elasticAvailable = false;

const ensureNewsIndex = async () => {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: ELASTICSEARCH_INDEX
    });

    if (!indexExists) {
      await elasticClient.indices.create({
        index: ELASTICSEARCH_INDEX,
        mappings: {
          properties: {
            headline: { type: "text" },
            content: { type: "text" },
            category: { type: "keyword" },
            imageUrl: { type: "keyword", index: false },
            sourceName: { type: "keyword" },
            sourceUrl: { type: "keyword", index: false },
            timestamp: { type: "date" }
          }
        }
      });
    }

    elasticAvailable = true;
    console.log("Elasticsearch ready");
  } catch (error) {
    elasticAvailable = false;
    console.error("Elasticsearch initialization failed:", error.message);
  }
};

const recreateNewsIndex = async () => {
  try {
    const indexExists = await elasticClient.indices.exists({
      index: ELASTICSEARCH_INDEX
    });

    if (indexExists) {
      await elasticClient.indices.delete({
        index: ELASTICSEARCH_INDEX
      });
    }

    await elasticClient.indices.create({
      index: ELASTICSEARCH_INDEX,
      mappings: {
        properties: {
          headline: { type: "text" },
          content: { type: "text" },
          category: { type: "keyword" },
          imageUrl: { type: "keyword", index: false },
          sourceName: { type: "keyword" },
          sourceUrl: { type: "keyword", index: false },
          timestamp: { type: "date" }
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

const isElasticsearchAvailable = () => elasticAvailable;

const mapNewsDocument = (newsItem) => ({
  headline: newsItem.headline,
  content: newsItem.content,
  category: newsItem.category,
  imageUrl: newsItem.imageUrl || "",
  sourceName: newsItem.sourceName || "",
  sourceUrl: newsItem.sourceUrl || "",
  timestamp: newsItem.timestamp
});

const indexNewsItem = async (newsItem) => {
  if (!elasticAvailable) {
    return;
  }

  await elasticClient.index({
    index: ELASTICSEARCH_INDEX,
    id: String(newsItem._id),
    document: mapNewsDocument(newsItem),
    refresh: "wait_for"
  });
};

const replaceNewsIndex = async (newsItems) => {
  if (!elasticAvailable) {
    return;
  }

  await recreateNewsIndex();

  if (newsItems.length === 0) {
    return;
  }

  const operations = newsItems.flatMap((item) => [
    {
      index: {
        _index: ELASTICSEARCH_INDEX,
        _id: String(item._id)
      }
    },
    mapNewsDocument(item)
  ]);

  await elasticClient.bulk({
    refresh: true,
    operations
  });
};

const searchNews = async ({
  search,
  category,
  sourceName,
  startDate,
  endDate,
  sort,
  page,
  limit
}) => {
  const must = [];
  const filter = [];

  if (search) {
    must.push({
      multi_match: {
        query: search,
        fields: ["headline^3", "content", "category^2"],
        fuzziness: "AUTO"
      }
    });
  }

  if (category) {
    filter.push({
      term: {
        category: category
      }
    });
  }

  if (sourceName) {
    filter.push({
      term: {
        sourceName: sourceName
      }
    });
  }

  if (startDate || endDate) {
    const range = {};

    if (startDate) {
      range.gte = startDate;
    }

    if (endDate) {
      range.lte = `${endDate}T23:59:59.999Z`;
    }

    filter.push({
      range: {
        timestamp: range
      }
    });
  }

  const response = await elasticClient.search({
    index: ELASTICSEARCH_INDEX,
    from: (page - 1) * limit,
    size: limit,
    query: {
      bool: {
        must: must.length ? must : [{ match_all: {} }],
        filter
      }
    },
    sort: [{ timestamp: { order: sort === "oldest" ? "asc" : "desc" } }]
  });

  const total = typeof response.hits.total === "number"
    ? response.hits.total
    : response.hits.total?.value || 0;

  return {
    items: response.hits.hits.map((hit) => ({
      _id: hit._id,
      ...hit._source
    })),
    total
  };
};

module.exports = {
  ensureNewsIndex,
  indexNewsItem,
  isElasticsearchAvailable,
  replaceNewsIndex,
  searchNews
};
