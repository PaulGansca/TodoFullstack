//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Make todo list persist"
});

const item2 = new Item({
  name: "Celebrate exam results"
});

const item3 = new Item({
  name: "Revise Language Processors"
});

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {

  Item.find((err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (results.length === 0) {
        Item.insertMany(defaultItems, err => {
          if (err) {
            console.log(err);
          } else {
            console.log("Saved default items to db")
          }
        });
      }

      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  })

});

app.post("/", function (req, res) {

  const item = req.body.newItem;
  Item.create({
    name: item
  }, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Task created succesfully")
    }
  })
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  //select inputs that are checked
  const doneItem = Object.keys(req.body)[0];

  //use their name to find them in the db and delete
  Item.deleteOne({
    _id: doneItem
  }, (err) => {
    if (err) {
      console.log(err);
    } else {

      res.redirect("/");
    }
  });
});

app.get("/work", function (req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});