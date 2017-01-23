var path = require("path");
module.exports = {
    context: path.resolve(__dirname, "tests"),
    entry: {
        bundle: "./src/bundle.test.ts"
    },
    output: {
        path: path.resolve(__dirname, "tests", "app"),
        filename: "[name].test.js"
    },
    resolve: {
        extensions: [".ts", ".css", ".js", ""]
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: "mocha!ts-loader"
            }
        ]
    }
}