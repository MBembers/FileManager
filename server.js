const express = require("express");
const formidable = require("formidable");
const hbs = require("express-handlebars");
const path = require("path");
const session = require("express-session");
const PORT = process.env.PORT || 3000;

var app = express();
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("static"));
app.use(session({ secret: "secret", resave: true, saveUninitialized: true }));
app.set("views", path.join(__dirname, "views"));
app.engine(
  "hbs",
  hbs({
    defaultLayout: "main.hbs",
    extname: ".hbs",
    partialsDir: "views/partials",
  })
);
app.set("view engine", "hbs");

app.listen(PORT, () => {
  console.log("server started on: " + PORT);
});

let filesArr = [];
let counter = 1;
const user_credentials = {
  username: "admin",
  password: "admin",
};

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  if (req.session.logged) {
    res.redirect("/upload");
  } else {
    res.render("login.hbs", { layout: "login.hbs" });
  }
});

app.post("/login", function (req, res) {
  if (
    user_credentials.username === req.body.username &&
    user_credentials.password === req.body.password
  ) {
    req.session.logged = true;
    res.redirect("/upload");
  } else {
    res.render("login.hbs", {
      layout: "login.hbs",
      context: "You have entered an invalid login or password",
    });
  }
});

app.get("/upload", (req, res) => {
  if (req.session.logged) {
    res.render("upload.hbs", { layout: "main.hbs" });
  } else res.redirect("/login");
});

app.get("/filemanager", (req, res) => {
  if (req.session.logged) {
    const ctx = filesArr.map((f) => {
      const url = "/assets/";
      if (f.type === "text/plain") f.icon_path = url + "txt.png";
      else if (f.type === "image/jpeg") f.icon_path = url + "jpg.png";
      else if (f.type === "image/png") f.icon_path = url + "png.png";
      else if (f.type === "application/pdf") f.icon_path = url + "pdf.png";
      else if (f.type === "application/x-zip-compressed")
        f.icon_path = url + "zip.png";
      else if (f.type === "text/plain") f.icon_path = url + "txt.png";
      else f.icon_path = url + "unknown.png";
      return f;
    });
    console.log(ctx);
    res.render("filemanager.hbs", {
      layout: "main.hbs",
      context: ctx,
    });
  } else res.redirect("/login");
});

app.post("/handleupload", function (req, res) {
  if (req.session.logged) {
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
      res.redirect("/filemanager");
    });
  } else res.redirect("/login");
});

app.post("/delete", (req, res) => {
  if (req.session.logged) {
    filesArr = filesArr.filter((f) => f.id != req.body.id);
    res.redirect("/filemanager");
  } else res.redirect("/login");
});

app.post("/download", (req, res) => {
  if (req.session.logged) {
    res.download(filesArr.find((x) => x.id == req.body.id).path);
  } else res.redirect("/login");
});

app.get("/reset", (req, res) => {
  if (req.session.logged) {
    filesArr = [];
    res.redirect("/filemanager");
  } else res.redirect("/login");
});

app.get("/info", (req, res) => {
  if (req.session.logged) {
    const ctx = filesArr.find((f) => f.id === parseInt(req.query.id));
    console.log(ctx);
    res.render("info.hbs", {
      layout: "main.hbs",
      context: ctx,
    });
  } else res.redirect("/login");
});
