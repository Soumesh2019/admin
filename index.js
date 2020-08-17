const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const ejs = require("ejs");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const Model = require(path.join(__dirname, "./server"));
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


const storage = multer.diskStorage({
  destination: "./public/images/",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);

    if (ext !== ".png" && ext !== ".jpeg" && ext !== ".jpg") {
      return cb(new Error("Only Images are allowed"));
    }
    cb(null, true);
  },
}).array("photos", 3);

app.get("/", (req, res) => {
  res.render("index");
});

app.route("https://bollygallery.herokuapp.com/posts").post(upload, (req, res) => {
  let filename = req.files.map((file) => {
    return file.filename;
  });

  let filepath = req.files.map((file) => {
    return file.path;
  });

  const title = req.body.title;
  const date = new Date().toDateString();
  const content = req.body.content;

  const post = new Model({
    title: title,
    content: content,
    images: filename,
    uploadedOn: date,
    image_path: filepath
  });

  post.save((err, results) => {
    if (!err) {
      res.redirect("https://bollygallery.herokuapp.com/posts");
    } else {
      res.send(err);
    }
  });
});

app.listen(process.env.PORT || 3000, () => console.log("Running on 3000"));
