/**
 * This is the main server script that provides the API endpoints
 * The script uses the database helper in /src
 * The endpoints retrieve, update, and return data to the page handlebars files
 *
 * The API returns the front-end UI handlebars pages, or
 * Raw json if the client requests it with a query parameter ?raw=json
 */

// Utilities we need
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const ixelles = require("./ixelles.js")

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

// We use a module for handling database operations in /src
// const data = require("./src/data.json");
// const db = require("./src/" + data.database);

const baseUrl =
  "https://rdv-afs.ixelles.be/qmaticwebbooking/rest/schedule/branches/";
const branch =
  "2a94f84c6d99376986e4fc91342dad52dd69ec2b1fffb14fef79a1c50738e3db";

function constructURL(branch, servicePublicId, customSlotLength) {
  return `${baseUrl}${branch}/dates;servicePublicId=${servicePublicId};customSlotLength=${customSlotLength}`;
}

function getABCUrl() {
  /// Demande d'obtention d'un titre de séjour (A, B, C, D, EU, EU+,, F, F+, H, , I, J, K, L, M)
  const servicePublicId =
    "21b59b2bbbbdc01547bb693e0b815f5e49fd14d96734bbc79331422f285f7ad9";
  const customSlotLength = "10";
  return constructURL(branch, servicePublicId, customSlotLength);
}

function getPremierUrl() {
  /// Première inscription d'un citoyen non membre de l'UE
  const servicePublicId =
    "8562bfb3c40332a888ceca9d7e8f2922b911f7e17dbf25268b3b5ea706b79d71";
  const customSlotLength = "15";
  return constructURL(branch, servicePublicId, customSlotLength);
}


async function getNextDate(url) {
  try {
    const response = await axios.get(url);
    console.log(response);
    const nextDate = response.data[0].date;
    console.log(nextDate);
    return nextDate;
  } catch (error) {
    console.error(error);
  }
}

// Declare a route
fastify.get("/nextDate/abc", async (request, reply) => {
  const nextDate = await getNextDate(getABCUrl());
  const lastUpdated = Date().toString().split(" GMT")[0];
  return { nextDate, lastUpdated };
});


// Declare a route
fastify.get("/nextDate/premier", async (request, reply) => {
  const nextDate = await getNextDate(getPremierUrl());
  const lastUpdated = Date().toString().split(" GMT")[0];
  return { nextDate, lastUpdated };
});

/**
 * Home route for the app
 *
 * Return the poll options from the database helper script
 * The home route may be called on remix in which case the db needs setup
 *
 * Client can request raw data using a query parameter
 */
fastify.get("/", async (request, reply) => {
  /* 
  Params is the data we pass to the client
  - SEO values for front-end UI but not for raw data
  */
  let params = request.query.raw ? {} : { seo: seo };

  // Send the page options or raw JSON data if the client requested it
  return request.query.raw
    ? reply.send(params)
    : reply.view("/src/pages/index.hbs", params);
});


// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
    fastify.log.info(`server listening on ${address}`);
  }
);
