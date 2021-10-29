import pkg from "../package.json";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import _ from "lodash";

const mySchema = importAsString("./schema.graphql");

var _context = null;

const resolvers = {
  Query: {},
  Mutation: {},
};

function CourierAPIStartUp(context) {
  _context = context;
  const { app, collections, rootUrl } = context;

  if (app.expressApp) {
    // enable files upload

    //add other middleware
    app.expressApp.use(cors());
    app.expressApp.use(bodyParser.json());
    app.expressApp.use(bodyParser.urlencoded({ extended: true }));
    app.expressApp.use(morgan("dev"));
    app.expressApp.post("/create-label", (req, res) => {
      try {
        console.log("req.body", req.body);
        let courier=req.body.courier;
        let raw=req.body.data;
        var myHeaders = new Headers();
        myHeaders.append("api-user", "landOfSneakers");
        myHeaders.append("api-token", "txyidcmonavpzgwh");
        myHeaders.append("Content-Type", "application/json");

        var requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        fetch(
          `https://production.courierapi.co.uk/api/couriers/v1/${courier}/create-label`,
          requestOptions
        )
          .then((response) => response.text())
          .then((result) => res.send(result))
          .catch((error) => console.log("error", error));
      } catch (err) {
        console.lofg("err", err);
        res.status(500).send(err);
      }
    });
  }

}

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "Courier-API",
    name: "Courier-API",
    version: pkg.version,
    functionsByType: {
      startup: [CourierAPIStartUp],
    },
    graphQL: {
      schemas: [mySchema],
      resolvers,
    },
  });
}
