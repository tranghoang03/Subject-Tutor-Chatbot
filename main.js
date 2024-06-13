const express = require("express")
const app = express()
const dotenv = require("dotenv")
const port = process.env.PORT_WEB || 8000
const path = require('path')
const {answer} = require('./RAG.js')

app.use(express.json())
app.set("view engine", "ejs")
dotenv.config({path: './.env'})
app.use('/img', express.static(path.join(__dirname, 'views/img')))
app.set('views', path.join(__dirname, 'views'));


// const splitter = new SentenceSplitter({ chunkSize: 512, chunkOverlap: 51 })
// const embed = new GeminiEmbedding()
// Settings.embedModel = embed
// const gemini = new Gemini({
//   apiKey: process.env.GEMINI_API_KEY,
// })
// Settings.llm = gemini
// const service = serviceContextFromDefaults({
//   llm: gemini,
//   embedModel: embed,
// })
// // Settings.embedModel = new GeminiEmbedding()
// const vectorStore = new QdrantVectorStore({
//   url: "http://localhost:6333",
// });
// /*Ingestion*/
// //PDF Reader
// async function loadDoc(){
//   const reader = new SimpleDirectoryReader()
//   const document = await reader.loadData('../SS2_Project/doccument')
//   return document
// }
// //Text splitter
// async function text_splitter(){
//   const splitresult = []
//   const document = await loadDoc()
//   document.forEach((doc) => {
//     if(doc.getText() !== ''){
//       const textsplitter = splitter.splitText(doc.getText())
//       textsplitter.forEach((text) => {
//         splitresult.push(text)
//       })
//     }
//   })
//   return splitresult
// }
// //Add document to Vector Database
// async function VectorStore(){
//   const doclist= []
//   let i = 0
//   const document = await text_splitter()
//   document.forEach((doc) => {
//     const docjson = new Document({ text: doc, id_: "doc" + i.toString})
//     doclist.push(docjson)
//     i++
//   })
//   const index = await VectorStoreIndex.fromDocuments(doclist, {
//     serviceContext: service,
//   })
//   return index
// }
// let index

// async function answer(user_query){
//   // const index = await VectorStore()
//   const retriever = await index.asRetriever()
//   retriever.similarityTopK = 10
//   const queryEngine = index.asQueryEngine()
//   const query = user_query
//   const results = await queryEngine.query({
//     query,
//   })
//   return results
// }
app.get("/",async (req, res) => {
  res.render("mainpage.ejs")
  // res.render("mainpage.ejs")
})

app.post("/", async (req, res) => {
  const user_query = req.body.query
  const traloi = await answer(user_query.toString())
  console.log(traloi)
  res.json({traloi: traloi})
})

app.listen(port, () => {
  console.log(`Email system app listening at http://localhost:${port}`);
})
