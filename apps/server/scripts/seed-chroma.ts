import { collection } from "~/lib/vector-database/chroma";

// Data about a friends group
const seedData = [
  {
    id: "1",
    content: "Laurine and Julian are both friends.",
  },
  {
    id: "2",
    content: "Laurine and Chris are both friends.",
  },
  {
    id: "3",
    content: "Julian and chris don't know each other.",
  },
];

await collection.upsert({
  documents: seedData.map((d) => d.content),
  ids: seedData.map((d) => d.id),
});
