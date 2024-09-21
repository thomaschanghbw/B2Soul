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

async function getCollectionMap(collection: string, translation: string) {
  //Get existing items.
  const existingItems: VectorizedItem[] = await prisma.$queryRaw`
    SELECT id, content, collection, book, verse, translation, embedding_512::text
    FROM "VectorizedItem"
    WHERE collection = ${collection}
    AND translation = ${translation}
  `;

  const existingItemMap = new Map<string, VectorizedItem>();
  for (const item of existingItems) {
    existingItemMap.set(`${item.book}-${item.verse}`, item);
  }
  console.log(`Existing items:`, existingItemMap.size);

  return existingItemMap;
}

async function extractAndEmbed(
  filePath: string,
  collection: string,
  translation: string
) {
  const fileContent = fs.readFileSync(filePath, `utf-8`);
  const verses = JSON.parse(fileContent) as Verse[];

  const existingItemMap = await getCollectionMap(collection, translation);

  //Create new items.
  for (let i = 0; i < verses.length; i += 100) {
    const data: Pick<
      VectorizedItem,
      `book` | `verse` | `content` | `collection` | `translation`
    >[] = [];
    for (const verse of verses.slice(i, i + 100)) {
      if (!verse) {
        continue;
      }

      let book, verseId;
      if (collection === `Bible`) {
        const bookMatch = verse.verse_id.match(/^[^\d]+/);
        book = bookMatch ? bookMatch[0].trim() : ``;
        verseId = verse.verse_id.replace(book, ``).trim();
      } else if (collection === `Quran`) {
        book = verse.verse_id.split(`:`)[0];
        verseId = verse.verse_id.split(`:`)[1];
      } else {
        book = verse.book;
        verseId = verse.verse_id;
      }

      const key = `${book}-${verseId}`;
      if (existingItemMap.has(key)) {
        // console.log(`Vectorized item already exists for ${verse.verse_id}`);
        continue;
      }

      data.push({
        collection,
        book: book ?? null,
        verse: verseId ?? null,
        translation,
        content: verse.verse_text,
      });
    }

    if (data.length === 0) {
      continue;
    }

    const vectorizedItems = await prisma.vectorizedItem.createMany({
      data,
    });
    console.log(`Created ${vectorizedItems.count} items`);
    console.log(`First item: ${data[0]?.content}`);
  }

  //Update embeddings.
  const newItems = await getCollectionMap(collection, translation);

  const batchSize = 100;
  const itemsToProcess = Array.from(newItems.entries());

  for (let i = 0; i < itemsToProcess.length; i += batchSize) {
    const batch = itemsToProcess.slice(i, i + batchSize);
    const itemsNeedingEmbedding = batch.filter(
      ([_, item]) =>
        !(item as VectorizedItem & { embedding_512?: number[] })?.embedding_512
    );

    if (itemsNeedingEmbedding.length > 0) {
      const contents = itemsNeedingEmbedding.map(([_, item]) => item.content);
      const embeddings = await vectorModel.getEmbeddings(contents);
      console.log(`Got embeddings for ${contents.length} items`);

      for (let j = 0; j < itemsNeedingEmbedding.length; j++) {
        const [_key, item] = itemsNeedingEmbedding[j] ?? [];
        if (!item) {
          console.error(`No item for embedding ${j}`);
          continue;
        }
        const embedding = embeddings[j];
        if (!embedding) {
          console.error(`No embedding for item ${item.id}`);
          continue;
        }
        await vectorModel.updateEmbedding(item.id, embedding);
        console.log(`Added embedding for item ${item.id}`);
      }
    }

    console.log(
      `Processed batch ${i / batchSize + 1} of ${Math.ceil(itemsToProcess.length / batchSize)}`
    );
  }
}

async function main() {
  const biblePath = `./notebooks/bible.json`;
  const quranPath = `./notebooks/quran.json`;

  await extractAndEmbed(biblePath, `Bible`, `King James Version`);
  await extractAndEmbed(quranPath, `Quran`, `Muhammad Asad`);

  // const items = await vectorModel.getEmbeddings([
  //   `In the beginning God created the heaven and the earth.`,
  //   `And God said, Let there be light: and there was light.`,
  // ]);
  // console.log(items);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
