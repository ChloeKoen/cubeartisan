// run with: node --max-old-space-size=8192 populate_analytics.js
// will oom without the added tag
// Load Environment Variables
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import carddb from '@cubeartisan/server/serverjs/cards.js';
import CardRating from '@cubeartisan/server/models/cardrating.js';
import connectionQ from '@cubeartisan/server/serverjs/mongoConnection.js';

const BATCH_SIZE = 1000;

const updateEmbeddings = async (names, embeddings) => {
  const ratings = await CardRating.find({ name: { $in: names } });
  ratings.forEach((rating) => {
    rating.embedding = embeddings[names.indexOf(rating.name)];
  });

  await Promise.all(ratings.map((rating) => rating.save()));
};

(async () => {
  await Promise.all([carddb.initializeCardDb('private', true), connectionQ]);
  const ratings = await CardRating.find({}, 'name elo embedding').lean();
  for (let i = 0; i < ratings.length; i += BATCH_SIZE) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(`${process.env.FLASKROOT}/embeddings/`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: ratings.slice(i, i + BATCH_SIZE).map((card) => card.name.toLowerCase()),
        }),
      });
      if (response.ok) {
        // eslint-disable-next-line no-await-in-loop
        const synergies = await response.json();
        await updateEmbeddings(
          ratings.slice(i, i + BATCH_SIZE).map((card) => card.name),
          synergies,
        );
        console.log(`Finished ${Math.min(ratings.length, i + BATCH_SIZE)} of ${ratings.length} embeddings.`);
      } else {
        console.log(`Could not get embeddings batch ${i / BATCH_SIZE}`);
      }
    } catch (err) {
      console.error(err);
    }
  }
  await mongoose.disconnect();
  console.log('done');
  process.exit();
})();
