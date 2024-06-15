const { SimpleDirectoryReader } = require("llamaindex/readers/SimpleDirectoryReader")
const { SentenceSplitter } = require("llamaindex")
const { Gemini, GeminiEmbedding, Settings, serviceContextFromDefaults } = require("llamaindex")
const { Document, VectorStoreIndex, QdrantVectorStore, ModalityType, CohereRerank } = require("llamaindex")
const dotenv = require("dotenv")
const { nodeParserFromSettingsOrContext } = require("llamaindex/Settings")

dotenv.config({path: './.env'})

const splitter = new SentenceSplitter({ chunkSize: 512, chunkOverlap: 51 })
const embed = new GeminiEmbedding()
Settings.embedModel = embed
const gemini = new Gemini({
  apiKey: process.env.GEMINI_API_KEY,
})
Settings.llm = gemini
const service = serviceContextFromDefaults({
  llm: gemini,
  embedModel: embed,
})
// Settings.embedModel = new GeminiEmbedding()
const vectorStore = new QdrantVectorStore({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});
/*Ingestion*/
//PDF Reader
async function loadDoc(){
  const reader = new SimpleDirectoryReader()
  const document = await reader.loadData('./doccument')
  return document
}
//Text splitter
async function text_splitter(){
  const splitresult = []
  const document = await loadDoc()
  document.forEach((doc) => {
    if(doc.getText() !== ''){
      const textsplitter = splitter.splitText(doc.getText())
      textsplitter.forEach((text) => {
        splitresult.push(text)
      })
    }
  })
  return splitresult
}
//Add document to Vector Database
async function VectorStore(){
  const doclist= []
  let i = 0
  const document = await text_splitter()
  document.forEach((doc) => {
    const docjson = new Document({ text: doc, id_: "doc" + i.toString})
    doclist.push(docjson)
    i++
  })
  const index = await VectorStoreIndex.fromDocuments(doclist, {
    serviceContext: service,
    vectorStores: {
      [ModalityType.TEXT]: vectorStore,
    }
  })
  return index
}
let index
let retriever
const Reranker = new CohereRerank({
  apiKey: process.env.COHERE_API_KEY,
  topN: 6,
})
VectorStore()
.then(resp =>{ 
  index = resp
})
.then(resp => {
  retriever = index.asRetriever()
  retriever.similarityTopK = 10
})



async function answer(user_query){
  const queryEngine = index.asQueryEngine({
    retriever: retriever,
    nodePostprocessors: [Reranker],
  })
  const query = user_query
  const results = await queryEngine.query({
    query,
  })
  return results
}

module.exports = {answer}
