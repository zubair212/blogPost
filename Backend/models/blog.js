const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Blog schema
const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  photopath: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, { timestamps: true });

// Create the Blog model from the schema
const Blog = mongoose.model('Blog', blogSchema, 'blogs');

module.exports = Blog;
