import pkg from "../package.json";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import _ from "lodash";
import request  from 'request';
import addLabelToOrder from "./utils/addLabelToOrder.js"

const mySchema = importAsString("./schema.graphql");

var _context = null;

const resolvers = {
  Order:{
    async shipmentLabel(parent, args, context, info){
       console.log("shipmentLabel",parent);
      return parent.shipmentLabel;
    }
  },
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
    app.expressApp.post("/create-label",  (req, res) => {
      try {
        let courier=req.body.courier;
        let raw=req.body.data;
        let referenceId=req.body.referenceId;
        var options = {
          'method': 'POST',
          'url': `https://production.courierapi.co.uk/api/couriers/v1/${courier}/create-label`,
          'headers': {
            'api-user': 'landOfSneakers',
            'api-token': 'txyidcmonavpzgwh',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(raw)
        
        };
        request(options,async function (error, response) {
          if (error) { res.status(500).send(error);throw new Error(error);}
          // console.log(response.body);
          let labelStatus= await addLabelToOrder(context,{referenceId,label:JSON.parse(response.body)})
          console.log("labelStatus",labelStatus)
          res.send(JSON.parse(response.body))
        });
        
      } catch (err) {
        console.log("err", err);
        res.status(500).send(err);
      }
    });
    app.expressApp.post("/get-tracking", (req, res) => {
      try {
        console.log("req.body", req.body);
        let tracking_request_id=req.body.tracking_request_id;
        let tracking_request_hash=req.body.tracking_request_hash;
        var options = {
          'method': 'POST',
          'url': 'https://production.courierapi.co.uk/api/couriers/v1/get-tracking',
          'headers': {
            'api-user': 'landOfSneakers',
            'api-token': 'txyidcmonavpzgwh',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "tracking_request_id": tracking_request_id,
            "tracking_request_hash": tracking_request_hash
          })        
        };
        request(options, function (error, response) {
          if (error) { res.status(500).send(error);throw new Error(error);}
          console.log(response.body);
          res.send(JSON.parse(response.body))
        });
        
      } catch (err) {
        console.log("err", err);
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
