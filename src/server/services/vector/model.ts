import type { Prisma, VectorizedItem } from "@prisma/client";
import pgvector from "pgvector";

import { prisma } from "@/server/init/db";
import { openai } from "@/server/init/openai";
export const userModelDefaultInclude = {
  Companies: {
    include: {
      company: true,
    },
  },
};

export type UserWithDefaults = Prisma.UserGetPayload<{
  include: typeof userModelDefaultInclude;
}>;

class VectorModel {
  async getEmbedding({ content }: { content: string }): Promise<number[]> {
    const embedding = await openai.embeddings.create({
      model: `text-embedding-3-large`,
      input: content,
      encoding_format: `float`,
    });

    // embeddings.create can also take an array input and return an array of embeddings
    // For now we are just enforcing a single embedding
    return embedding.data[0]!.embedding;
  }

  async saveIndex(
    content: string,
    embedding: number[]
  ): Promise<VectorizedItem> {
    const embeddingSql = pgvector.toSql(embedding) as unknown as string;

    const item: VectorizedItem = await prisma.$queryRaw`
      INSERT INTO "VectorizedItem" (content, embedding)
      VALUES (${content}, ${embeddingSql}::vector)
      RETURNING id, content, embedding::text
    `;

    return item;
  }

  async nearestNeighbor({
    embedding,
    limit = 5,
  }: {
    embedding: number[];
    limit?: number;
  }): Promise<VectorizedItem[]> {
    const embeddingSql = pgvector.toSql(embedding) as unknown as string;

    const items: VectorizedItem[] = await prisma.$queryRaw`
      SELECT id, content, embedding::text
      FROM "VectorizedItem"
      ORDER BY embedding <-> ${embeddingSql}::vector
      LIMIT ${limit}
    `;
    return items;
  }
}

const vectorModel = new VectorModel();
export { vectorModel };
