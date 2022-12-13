/**
 * This is the main server script that provides the API endpoints
 * The script uses the database helper in /src
 * The endpoints retrieve, update, and return data to the page handlebars files
 *
 * The API returns the front-end UI handlebars pages, or
 * Raw json if the client requests it with a query parameter ?raw=json
 */

// Utilities we need
const path = require("path");
const axios = require("axios");
const ixelles = require("./ixelles.js");

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

async function getDateJson(aptType) {
  const nextDate = await ixelles.getNextDate(ixelles.appointmentTypes.abc);
  const lastUpdated = Date().toString().split(" GMT")[0];
  return { nextDate, lastUpdated };
}

// These are the routes for the two types of appointments
fastify.get("/nextDate/abc", async (request, reply) =>
  getDateJson(ixelles.appointmentTypes.abc)
);

fastify.get("/nextDate/premier", async (request, reply) =>
  getDateJson(ixelles.appointmentTypes.premier)
);

fastify.get("/", async (request, reply) => {
  return reply.view("/src/pages/index.hbs");
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
