

const Joi = require('joi');
const fs = require('fs');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const { BACKEND_SERVER_PATH } = require('../Config/index');
const BlogDTO = require('../dto/blog');
const BlogDetailsDTO = require('../dto/blogDatails');
const commentController= require('../controller/commentController');

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      content: Joi.string().required(),
      photo: Joi.string().required(),
    });

    try {
      const { error } = createBlogSchema.validate(req.body);
      if (error) {
        throw new Error(error.details[0].message);
      }

      const { title, author, content, photo } = req.body;

      // Read the image data as a buffer from the base64 data URI
      const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');

      // Generate a random name for the image
      const imagePath = `${Date.now()}-${author}.png`;

      // Save the image locally
      fs.writeFileSync(`storage/${imagePath}`, buffer);

      // Save the blog in the database
      const newBlog = new Blog({
        title,
        author,
        content,
        photopath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });

      await newBlog.save();

      // Convert the blog object to a DTO for the response
      const blogDTO = new BlogDTO(newBlog);

      return res.status(201).json({ Blog: blogDTO });
    } catch (error) {
      return next(error);
    }
  },




//end of create blog



async getAll(req,res,next){


    try {
        // Fetch all blogs from the database
        const blogs = await Blog.find({});
    
        // Create an array to store the DTOs of all blogs
        const blogsDTO = [];
        for (let i = 0; i < blogs.length; i++) {
          // Create a new DTO instance for each blog and push it to the blogsDTO array
          const dto = new BlogDTO(blogs[i]);
          blogsDTO.push(dto);
        }
    
        // Return the blogsDTO array in the response
        return res.status(200).json({ blogs: blogsDTO });
      } catch (error) {
        // Pass the error to the error-handling middleware using the 'next' function
        next(error);
      }

},
//end of get all




async getById(req, res, next) {
    // Validate id
    const getByIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });

    const { error } = getByIdSchema.validate(req.params);

    if (error) {
      return next(error);
    }

    const { id } = req.params;

    try {
      const blog = await Blog.findOne({ _id: id }).populate('author');

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      const blogDTO = new BlogDetailsDTO(blog);

      return res.status(200).json({ blog: blogDTO });
    } catch (error) {
      return next(error);
    }
  },
//end of getById


async update(req, res, next) {
    //validate
    const UpdateBlogSchema = Joi.object({
      title: Joi.string(),
      content: Joi.string(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      blogId: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string(),
    });
  
    const { error } = UpdateBlogSchema.validate(req.body);
    if (error) {
      return next(error);
    }
  
    const { title, content, author, blogId, photo } = req.body;
  
    let blog;
  
    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }
  
    if (photo) {
      // Delete previous photo
      const previousPhoto = blog.photopath.split('/').pop();
      fs.unlinkSync(`storage/${previousPhoto}`);
  
      // Read the image data as a buffer from the base64 data URI
      const buffer = Buffer.from(photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ''), 'base64');
  
      // Generate a random name for the image
      const imagePath = `${Date.now()}-${author}.png`;
  
      // Save the image locally
      fs.writeFileSync(`storage/${imagePath}`, buffer);
  
      // Update blog with new photo
      await Blog.updateOne(
        { _id: blogId },
        { title, content, photopath: `${BACKEND_SERVER_PATH}/storage/${imagePath}` }
      );
    } else {
      // Update blog without changing the photo
      await Blog.updateOne({ _id: blogId }, { title, content });
    }
  
    return res.status(200).json({ message: 'Blog updated!' });
  },
  

// end of update
async delete(req,res,next){

//validate id
//delete blog
//delete comments


const deleteBlogSchema = Joi.object({
    id: Joi.string().regex(mongodbIdPattern).required(),
  });
  
  const { error } = deleteBlogSchema.validate(req.params);
  const { id } = req.params;
  
  // Delete blog and comments
  try {
    await Blog.deleteOne({ _id: id });
    await Comment.deleteMany({ blog: id });
  } catch (error) {
    return next(error);
  }
  
  return res.status(200).json({ message: 'Blog Deleted' });
    
    





},















}
module.exports= blogController;