const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const ejs = require("ejs");
const path = require("path");
const app = express();
const Model = require(path.join(__dirname, "./server"));
const fs = require('fs');
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use("/uploads", express.static("uploads"));


const storage = multer.diskStorage({
  destination: "./uploads/",
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

function deleteFiles(files, callback) {
  var i = files.length;
  files.forEach(function (filepath) {
    fs.unlink(filepath, function (err) {
      i--;
      if (err) {
        callback(err);
        return;
      } else if (i <= 0) {
        callback(null);
      }
    });
  });
}

app.get("/", (req, res) => {
  res.render("index");
});

app
  .route("/posts")
  .get((req, res) => {
    Model.find((err, results) => {
      if (!err) {
        res.render("posts", {
          posts: results,
        });
      } else {
        res.send(err);
      }
    });
  })
  .post(upload, (req, res) => {
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
      uploadedOn: date,
      image_path: filepath,
    });

    post.save((err, results) => {
      if (!err) {
        res.redirect("/posts");
      } else {
        res.send(err);
      }
    });
  });

app.get("/api", (req, res) => {
  Model.find({}, (err, data) => {
    if (!err) {
      res.json(data);
    }
  });
});

app.post("/posts/:posts_id", (req, res) => {
  const fieldname = req.body.field_name;
  const id = fieldname.shift();
  let pathArray = fieldname.toString().split(",");

  Model.deleteOne({ _id: id }, (error) => {
    if (!error) {
      deleteFiles(pathArray, function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/posts");
        }
      });
    } else {
      res.send(error);
    }
  });
});

app.listen(process.env.PORT || 5000, () => console.log("Running on 3000"));
