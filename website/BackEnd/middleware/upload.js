const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");

// Set up Multer GridFS storage
const storage = new GridFsStorage({
  url: "mongodb+srv://sharmamauli001:Sharma123@cluster0.nbi2l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",  // MongoDB URI
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const fileInfo = {
        filename: file.originalname,
        bucketName: "uploads",  // The GridFS collection name
      };
      resolve(fileInfo);
    });
  },
});

const upload = multer({ storage });  // This initializes the upload middleware
