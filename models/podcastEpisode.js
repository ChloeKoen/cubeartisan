import mongoose from 'mongoose';

// Blog schema
const podcastEpisodeSchema = mongoose.Schema({
  title: String,
  podcastname: String,
  description: String,
  podcast: String,
  source: String,
  owner: String,
  image: String,
  date: Date,
  guid: String,
  link: String,
  username: {
    type: String,
    default: 'User',
  },
});

podcastEpisodeSchema.index({
  owner: 1,
});

export default mongoose.model('PodcastEpisode', podcastEpisodeSchema);
