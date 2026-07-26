import mongoose from 'mongoose'

const pageSchema = new mongoose.Schema({
  url: String,
  title: String,
  metaDescription: String,
  metaKeywords: String,
  wordCount: Number,
  topWords: [String],
}, { _id: false })

const errorSchema = new mongoose.Schema({
  url: String,
  error: String,
}, { _id: false })

const crawlResultSchema = new mongoose.Schema({
  domain: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  lastCrawled: { type: Date, default: Date.now },
  stats: {
    totalCrawled: Number,
    totalVisited: Number,
    totalErrors: Number,
    avgWordsPerPage: Number,
    pagesWithMeta: Number,
    pagesWithoutTitle: Number,
    pagesWithoutDesc: Number,
    pagesWithoutKeywords: Number,
  },
  globalKeywords: [{ word: String, count: Number }],
  globalTopWords: [String],
  errors: [errorSchema],
  pages: [pageSchema],
  isCompetitor: { type: Boolean, default: false },
}, { timestamps: true })

export default mongoose.model('CrawlResult', crawlResultSchema)
