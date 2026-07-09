const { Client } = require("@elastic/elasticsearch");

const ELASTICSEARCH_URL =
  process.env.ELASTICSEARCH_URL || "http://127.0.0.1:9200";
const ELASTICSEARCH_INDEX = process.env.ELASTICSEARCH_INDEX || "news";

const elasticClient = new Client({
  node: ELASTICSEARCH_URL
});

module.exports = {
  ELASTICSEARCH_INDEX,
  elasticClient
};

