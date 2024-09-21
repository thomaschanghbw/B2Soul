import type { VectorizedItem } from "@prisma/client";
import fs from "fs";

import { prisma } from "@/server/init/db";
import { vectorModel } from "@/server/services/vector/model";

type Verse = {
  verse_id: string;
  verse_text: string;
  book?: string;
  translation?: string;
};

async function extractAndEmbed(
  filePath: string,
  collection: string,
  translation: string
) {
  const fileContent = fs.readFileSync(filePath, `utf-8`);
  const verses = JSON.parse(fileContent) as Verse[];

  const vectorizedItems: VectorizedItem[] = [];
  for (const verse of verses) {
    const vectorizedItem = await prisma.vectorizedItem.create({
      data: {
        collection,
        book: verse.book,
        verse: verse.verse_id,
        translation,
        content: verse.verse_text,
      },
    });
    vectorizedItems.push(vectorizedItem);
    console.log(`bi`, vectorizedItem);
    console.log(`Created vectorized item for ${verse.verse_id}`);
    const embedding = await vectorModel.getEmbedding({
      content: verse.verse_text,
    });
    await vectorModel.updateEmbedding(vectorizedItem.id, embedding);
    break;
  }
}

async function main() {
  const biblePath = `./notebooks/bible.json`;
  const quranPath = `./notebooks/quran.json`;
  // const buddhistTextsPath = `./notebooks/buddhist_texts.json`;

  await extractAndEmbed(biblePath, `Bible`, `King James Version`);
  await extractAndEmbed(quranPath, `Quran`, `Muhammad Asad`);
  // await extractAndEmbed(buddhistTextsPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
