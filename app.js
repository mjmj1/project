const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
// const upload = multer({ dest: "uploads/" });
const app = express();

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, res, cb) {
            cb(null, "./workspace/images");
        },
        filename: function (req, file, cb) {
            let ext = path.extname(file.originalname);
            let newName = Date.now();

            cb(null, newName + ext);
        },
    }),
    limits: {
        files: 5,
    },
});

app.listen(8080, function () {
    console.log("express server on : 8080");
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/workspace"));
app.use(express.static(__dirname + "/images"));

app.post("/upload-multiple", upload.array("imgUp", 5), (req, res) => {
    let urlArr = new Array();

    for (let i = 0; i < req.files.length; i++) {
        urlArr.push(`/workspace/images/${req.files[i].filename}`);
        console.log(urlArr[i]);

        try {
            sharp(req.files[i].path)
                .resize({ width: 400, height: 400 })
                .withMetadata()
                .toBuffer((e, buffer) => {
                    if (e) throw err;
                    fs.writeFile(req.files[i].path, buffer, (e) => {
                        if (e) throw e;
                    });
                });
        } catch (e) {
            console.log(err);
        }

        app.get(`/img${i + 1}`, (req, res) => {
            res.sendFile(__dirname + urlArr[i]);
        });
    }
    res.redirect("/");
});
