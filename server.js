const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://romanReigns:txKsOEh4w2hZn8QC@bollycluster.qzrsv.mongodb.net/bollydb",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const postsSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
  },
  content: {
    type: String,
  },
  uploadedOn: String,
  image_path: {
    type: Array,
  },
});

module.exports = mongoose.model("Posts", postsSchema);
