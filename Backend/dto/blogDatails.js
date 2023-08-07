class BlogDetailsDTO {
    constructor(blog) {
      this._id = blog._id;
     
      this.content = blog.content;
      this.title = blog.title;
      this.photo = blog.photopath; // Assuming that the property name is 'photopath' in the 'blog' object
      this.createdAt = blog.createdAt.toISOString();
      this.authorname= blog.author.name;
      this.authorUsername= blog.author.username;
    }
  }
  
  module.exports = BlogDetailsDTO;