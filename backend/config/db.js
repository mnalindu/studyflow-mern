
const mongoose = require("mongoose");

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    // Check environment variable
    if (!mongoURI) {
      throw new Error(
        "MONGO_URI is missing in the .env file"
      );
    }

    // Connect to StudyFlow database
    await mongoose.connect(mongoURI, {
      dbName: "studyflow_db",
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Atlas connected successfully!");
    console.log(
      `Database Name: ${mongoose.connection.name}`
    );
  } catch (error) {
    console.error(
      "MongoDB Connection Error:",
      error.message
    );

    throw error;
  }
};

module.exports = connectDB;
