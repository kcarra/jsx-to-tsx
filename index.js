const fg = require("fast-glob");
const path = require("node:path");
const fs = require("node:fs");
const { chalk } = require("chalk");
const { Select } = require("enquirer");
const { prompt } = require("enquirer");

async function init() {
    const DEFAULT_PATH = "./";

    const { defaultPath } = await prompt({
        type: "input",
        name: "defaultPath",
        message: `Optional: Specify a file path, default path is ${chalk.cyan(
            DEFAULT_PATH
        )}`,
    });

    const files = fg.sync("./**/*.jsx");

    let jsxFilesToRename = [];

    files.forEach((jsxFile) => {
        const { dir, name } = path.parse(jsxFile);
        const tsFile = path.format({ dir, name, ext: ".tsx" });

        jsxFilesToRename.push(
            new Promise((resolve, reject) =>
                fs.rename(jsxFile, tsFile, (err) => {
                    if (err) reject(err);
                    resolve(`${jsxFile} => ${tsFile}`);
                })
            )
        );
    });

    const rename = () => {
        return Promise.all(jsxFilesToRename)
            .then((done) => {
                console.log("Done renaming files:", done);
            })
            .catch((err) => {
                throw err;
            });
    };

    const prompt = new Select({
        name: "run",

        message: `These files will be renamed: ${files}`,
        choices: ["Yes", "No"],
    });

    prompt.run().then(rename).catch(console.error);
}
