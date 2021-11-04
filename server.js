var express = require("express");
const path = require("path");
var app = express();
var formidable = require("formidable");
var hbs = require("express-handlebars");
app.use(express.static("static"));
const PORT = 3000;
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine("hbs", hbs({ defaultLayout: "main.hbs" })); // domyślny layout, potem można go zmienić
app.set("view engine", "hbs");
app.listen(PORT, () => {
  console.log("server started on: " + PORT);
});
let filesArr = [];
let counter = 1;
app.get("/login", function (req, res) {
  res.render("login.hbs", { layout: "login.hbs" });
});

app.get("/home", (req, res) => {
  res.render("home.hbs", { layout: "main.hbs" });
});

app.get("/upload", (req, res) => {
  res.render("upload.hbs", { layout: "main.hbs" });
});

app.get("/filemanager", (req, res) => {
  res.setHeader("Content-type", "application/json");
  res.send(JSON.stringify(filesArr, null, 4));
});

app.post("/handleupload", function (req, res) {
  let form = formidable({});
  form.multiples = true;
  form.uploadDir = __dirname + "/static/upload/"; // folder do zapisu zdjęcia
  form.keepExtensions = true; // zapis z rozszerzeniem pliku
  form.parse(req, function (err, fields, files) {
    console.log("----- fields sent ------");
    console.log(fields);

    console.log("----- files sent ------");
    if (!Array.isArray(files.filesupload))
      files.filesupload = [files.filesupload];
    files.filesupload.forEach((file) => {
      filesArr.push({
        id: counter,
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.type,
        date: Date.now(),
      });
      counter += 1;
    });
    console.log(JSON.stringify(files.filesupload, null, 4));
    res.redirect("/upload");
  });
});
