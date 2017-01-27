#!/usr/bin/env node

import program from "commander";
import fs from "mz/fs";
import {resolve, dirname} from "path";
import pkg from "../package.json";
import {safeLoad as readYaml, safeDump as writeYaml} from "js-yaml";
import mkdirp from "mkdirp-promise";
import sync from "./sync";
import {createStore, combineReducers, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import terminalComponent from "./terminal/terminalComponent";
import watcherComponent from "./watcher/watcherComponent";
import rootReducer from "./reducer";
import {terminalCommand} from "./terminal/terminalActions";

const configDefault = resolve(process.env.HOME, ".streamplace", "sp-config.yaml");

const die = function(...args) {
  console.error(...args);
  process.exit(1);
};

const CONFIG_DEFAULT = {
  authServer: "https://stream.place"
};

// const {version} = JSON.parse(pkg);
export default program
  .version(pkg.version)
  .option("--sp-config <file>", "location of sp-config.yaml (default $HOME/.streamplace/sp-config.yaml)", configDefault);

const getConfig = function() {
  const {spConfig} = program;
  return fs.stat(spConfig)
  .catch((err) => {
    if (err.code !== "ENOENT") {
      throw new Error(err);
    }
    return mkdirp(dirname(spConfig)).then(() => {
      return fs.writeFile(spConfig, writeYaml(CONFIG_DEFAULT));
    });
  })
  .then(() => {
    return fs.readFile(spConfig, "utf8");
  })
  .then((data) => {
    return readYaml(data);
  });
};

const store = createStore(rootReducer, applyMiddleware(thunk));

program
  .command("sync")
  .description("Sync your plugin to the development server")
  .action(function(command, env) {
    getConfig()
    .then((config) => {
      terminalComponent(store);
      watcherComponent(store);
      store.dispatch(terminalCommand("sync"));
    })
    .catch(die);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
