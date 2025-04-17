import { ChromaClient } from "chromadb";
const client = new ChromaClient();

const collection = await client.createCollection({
  name: "test",
});

await collection.upsert({
  documents: [
    "Laurine is gay.",
    "Julian is the gayest.",
    "Chris is not openly gay.",
  ],
  ids: ["1", "2", "3"],
});
