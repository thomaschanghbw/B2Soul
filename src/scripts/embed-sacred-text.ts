import fs from "fs";
import path from "path";
import { VoyageAIClient } from "voyageai";

type Verse = {
  verse_id: string;
  verse_text: string;
  book?: string;
  translation?: string;
};

const client = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });

async function extractAndEmbed(
  filePath: string
  //   collection: string,
  //   translation: string
) {
  const fileContent = fs.readFileSync(filePath, `utf-8`);
  const verses = JSON.parse(fileContent) as Verse[];

  for (const verse of verses) {
    const response = await client.embed({
      input: [verse.verse_text],
      model: `model`,
    });
    console.log(response);

    // await prisma.vectorizedItem.create({
    //   data: {
    //     collection,
    //     book: verse.book,
    //     verse: verse.verse_id,
    //     translation,
    //     content: verse.verse_text,
    //     // embedding: response.embeddings[0],
    //   },
    // });
  }
}

async function main() {
  const biblePath = path.join(__dirname, `../../notebooks/bible.json`);
  const quranPath = path.join(__dirname, `../../notebooks/quran.json`);
  const buddhistTextsPath = path.join(
    __dirname,
    `../../notebooks/buddhist_texts.json`
  );

  await extractAndEmbed(biblePath);
  await extractAndEmbed(quranPath);
  await extractAndEmbed(buddhistTextsPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
