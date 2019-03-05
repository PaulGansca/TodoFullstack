//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);
app.use(express.static("public"));
app.set("views", __dirname + "/views");
mongoose.connect("mongodb://localhost:27017/todolistDB", {
    useNewUrlParser: true,
    useFindAndModify: false
});

const itemsSchema = {
    name: String
};

const ROOT_LIST = "All Lists";

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

//ideas

const ideasSchema = {
    name: String,
    content: String
};

const Idea = mongoose.model("Idea", ideasSchema);

//clipboard

const linksSchema = {
    description: String,
    clipboard: String,
    date: Date
};

const Link = mongoose.model("Link", linksSchema);

const listSchema = {
    name: String,
    type: String,
    description: String,
    todos: [itemsSchema],
    ideas: [ideasSchema],
    clipboard: [linksSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    List.find((err, results) => {
        if (err) {
            console.log(err);
        } else {
            res.render("home", {
                listTitle: ROOT_LIST,
                newLists: results
            });
        }
    });
});

app.get("/createList", (req, res) => {
    res.render("createList");
});

app.post("/createList", (req, res) => {
    let listName = _.kebabCase(req.body.listName);
    let listType = req.body.listType;
    let listDescription = req.body.listDescription;

    List.findOne(
        {
            name: listName
        },
        (err, results) => {
            if (err) {
                res.send(err);
            } else if (!results) {
                //list doesn't exist so create one
                const list = new List({
                    name: listName,
                    type: listType,
                    description: listDescription
                });

                list.save();

                res.redirect(`/${listType}/${listName}`);
            } else {
                //show existing
                res.redirect(`/${listName}`);
                res.render(listType, {
                    listTitle: results.name,
                    newListItems: results.todos
                });
            }
        }
    );
});

app.get("/todolist/:customListName", (req, res) => {
    let customListName = _.kebabCase(req.params.customListName);

    List.findOne(
        {
            name: customListName,
            type: "todolist"
        },
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                //show existing
                res.render("todolist", {
                    listTitle: results.name,
                    newListItems: results.todos
                });
            }
        }
    );
});

app.get("/clipboard/:customListName", (req, res) => {
    let customListName = _.kebabCase(req.params.customListName);

    List.findOne(
        {
            name: customListName,
            type: "clipboard"
        },
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                //show existing
                res.render("clipboard", {
                    listTitle: results.name,
                    newListItems: results.clipboard
                });
            }
        }
    );
});

app.post("/todolist", function(req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    List.findOne(
        {
            name: listName
        },
        (err, results) => {
            results.todos.push(item);
            results.save();
            res.redirect(`/todolist/${listName}`);
        }
    );
});

app.post("/clipboard", (req, res) => {});

app.post("/delete", (req, res) => {
    //select inputs that are checked
    const doneItem = req.body.checkbox;
    const listName = req.body.listName;

    //use their name to find them in the db and delete
    if (listName === ROOT_LIST) {
        List.deleteOne(
            {
                _id: doneItem
            },
            err => {
                if (!err) {
                    res.redirect("/");
                }
            }
        );
    } else {
        List.findOneAndUpdate(
            {
                name: listName
            },
            {
                $pull: {
                    todos: {
                        _id: doneItem
                    }
                }
            },
            (err, results) => {
                if (!err) {
                    res.redirect(`/${listName}`);
                }
            }
        );
    }
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(3000, function() {
    console.log("Server started on port 3000");
});
