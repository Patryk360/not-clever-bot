"use strict";
const rethinkdb = require("rethinkdb");
const express = require("express");
const http = require("http");
const path = require("path");
const start = async () => {
    const conn = await require("./database/connect.js").connect(rethinkdb);
    await require("./database/createTables.js").createTables(rethinkdb, conn);
    require("./backend/start.js")(express(), express, http, path, conn);
}
start();