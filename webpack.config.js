// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const webpack = require("webpack");
const dotenv = require("dotenv");

dotenv.config();

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        open: true,
        host: "localhost",
    },
    devtool: false,
    ignoreWarnings: [/source-map-loader/, /simple-peer/],
    resolve: {
        fallback: {
            process: require.resolve("process/browser"),
            util: require.resolve("util/"),
            buffer: require.resolve("buffer/"),
            events: require.resolve("events/"),
            stream: require.resolve("stream-browserify"),
            path: require.resolve("path-browserify"),
            constants: require.resolve("constants-browserify"),
            string_decoder: require.resolve("string_decoder/"),
            assert: require.resolve("assert/"),
            tty: false,
            fs: false,
            net: false,
            dgram: false,
        },
    },
    externals: {
        "simple-peer": "SimplePeer",
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),

        new MiniCssExtractPlugin(),

        new webpack.ProvidePlugin({
            Buffer: ["buffer", "Buffer"],
            process: "process/browser",
            EventEmitter: ["events", "EventEmitter"],
        }),

        new webpack.DefinePlugin({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
            "process.env.REACT_APP_SERVER_BASE_URL": JSON.stringify(
                process.env.REACT_APP_SERVER_BASE_URL || "http://localhost:8080",
            ),
            "process.env.REACT_APP_CLIENT_BASE_URL": JSON.stringify(
                process.env.REACT_APP_CLIENT_BASE_URL || "http://localhost:3000",
            ),
            "process.env.REACT_APP_SOCKET_URL": JSON.stringify(
                process.env.REACT_APP_SOCKET_URL || "http://localhost:5678",
            ),
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [stylesHandler, "css-loader", "postcss-loader"],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: "asset",
            },
            {
                test: /\.(?:js|mjs|cjs)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/preset-env", { targets: "defaults" }]],
                    },
                },
            },
        ],
    },
};

module.exports = () => {
    if (isProduction) {
        config.mode = "production";

        config.plugins.push(new WorkboxWebpackPlugin.GenerateSW());
    } else {
        config.mode = "development";
    }
    return config;
};
