// Load Environment Variables
import mongoose from 'mongoose';
import { setCubeType } from '../serverjs/cubefn';
import carddb from '../serverjs/cards';
import Cube from '../models/cube';

require('dotenv').config();

const batchSize = 100;

async function addVars(cube) {
  try {
    cube = setCubeType(cube, carddb);

    return cube.save();
  } catch (err) {
    console.error(err);
  }
  return -1;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URL);
  await carddb.initializeCardDb('private', true);

  const count = await Cube.countDocuments();
  const cursor = Cube.find().cursor();

  // batch them by batchSize
  for (let i = 0; i < count; i += batchSize) {
    const cubes = [];
    for (let j = 0; j < batchSize; j++) {
      try {
        if (i + j < count) {
          const cube = await cursor.next();
          if (cube) {
            cubes.push(cube);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    try {
      await Promise.all(cubes.map((cube) => addVars(cube)));
    } catch (err) {
      console.error(err);
    }

    console.log(`Finished: ${i} of ${count} cubes`);
  }
  mongoose.disconnect();
  console.log('done');
  process.exit();
})();
