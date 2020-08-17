const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();
let posts = require(".routes/posts");
let api = require("./routes/api");
const Model = require(path.join(__dirname, "./server"));
app.use(express.static(__dirname + "/public/"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const fs = require("fs");


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

app.get("/api", (req, res)=>{
    Model.find({}, (err, data)=>{
      if(!err){
        res.json(data)
      }
    })
})

app.route("/posts").get((req, res) => {
  Model.find((err, results) => {
    if (!err) {
      res.render("posts", {
        posts: results,
      });
      
    } else {
      res.send(err);
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

  // res.end();
});

app.listen(process.env.PORT || 5000, () => console.log("Server Running on 5000"));
