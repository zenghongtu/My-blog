const fs = require("fs");
const path = require("path");

const default_path = path.join(__dirname, "content", "posts");

let title = process.argv[2] || "untitled";
let category = process.argv[3] || "思考";
let date = process.argv[4] || getDate();

function getDate() {
  let d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
}

const default_template = `---
title: ${title}
category: "${category}"
cover: 
author: Jason Zeng
---

`;

const post_dir = path.join(default_path, `${date}--${title}`);
const post_images_dir = path.join(post_dir, "images");
const post_path = path.join(post_dir, "index.md");

try {
  fs.mkdirSync(post_dir);
  fs.mkdirSync(post_images_dir);
  fs.writeFileSync(post_path, default_template);
  console.log("文件创建成功");
} catch (e) {
  console.log("文件创建失败");
  console.log(e);
}
