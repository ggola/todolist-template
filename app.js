//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const format = require(__dirname + "/formatItems.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// connect mongoose with url of mongo (here localhost)
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true, useFindAndModify: true
});

// items schema
const itemsSchema = new mongoose.Schema({
  name: String,
  list: String
});
// Item model
const Item = mongoose.model("Item", itemsSchema);

// Add Defualt items
const item1 = new Item({
  name: "Welcome to your todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<-- Hit this to delete an item"
});
const defaultItems = [item1, item2, item3];
const defaultItemsIds = [];

// List schema
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

// .GET /
app.get("/", function(req, res) {
  const day = date.getDate();
  // READ Items
  Item.find(function(err, itemsFound) {
    // Check if any item is there
    if (itemsFound.length === 0) {
      Item.insertMany(defaultItems, function(err, itemsAdded) {
        // Store default items ids to be able to remove when adding first new item
        itemsAdded.forEach(function(itemAdded) {
          defaultItemsIds.push(itemAdded._id);
        })
        res.redirect("/");
      });
    } else {
      // Render the items found (not default items)
      const itemsFormatted = format.formatItem(itemsFound);
      res.render("list", {listTitle: day, newListItems: itemsFormatted});
    }
  })
});

// .POST /
app.post("/", function(req, res) {
  // Remove all default items as soon as first item is added
  defaultItemsIds.forEach(function(itemId) {
    Item.findByIdAndRemove(itemId, function(err){});
  });
  // Add new item
  const listName = req.body.listName;
  const item = new Item({
    name: req.body.newItem,
    list: listName.toLowerCase()
  });

  item.save();
  const day = date.getDate();
  if (listName === day) {
    res.redirect('/');
  } else {
    res.redirect('/' + listName.toLowerCase());
  }
});

// .POST /delete
app.post("/delete", function(req, res) {
  const itemId = req.body.checkBox;
  const listNameOrigin = req.body.listName;
  const day = date.getDate();

  Item.findByIdAndRemove(itemId, function(err) {
    if (listNameOrigin === day) {
      res.redirect('/');
    } else {
      res.redirect('/' + listNameOrigin.toLowerCase());
    }
  });
});

// .GET /dynamic
app.get("/:listName", function(req, res) {
  const listName = req.params.listName;

  List.findOne({name: listName.toLowerCase()}, function(err, listFound) {
    if (!listFound) {
      // Create and save the new list
      const list = new List({
        name: listName.toLowerCase(),
        items: defaultItems
      });
      list.save();
      res.redirect('/' + listName.toLowerCase());
    } else {
      // Find data for the list and show them
      Item.find({list: listName}, function(err, itemsFound){
        const listNameCap = listName.charAt(0).toUpperCase() + listName.slice(1)
        if (itemsFound.length === 0) {
          const listItems = defaultItems;
          res.render('list', {listTitle: listNameCap, newListItems: listItems});
        } else {
          const listItems = itemsFound;
          res.render('list', {listTitle: listNameCap, newListItems: listItems});
        }
      })
    }
  })
});

// Heroku port or 3000 for localhost
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server started");
});
