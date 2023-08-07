class CommentDTO {
    constructor(comment) {
      this._id = comment._id;
      this.id = comment._id;
      this.createdAt = comment.createdAt.toISOString();
      this.content = comment.content;
      this.authorUsername = comment.author.username; // Correct the reference to 'author.username'
    }
  }
  
  module.exports = CommentDTO;
  