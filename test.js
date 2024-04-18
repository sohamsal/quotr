const fetch = require("node-fetch");
const express = require("express");
const app = express();
const port = 3001;
const googleplaces = require("googleplaces");
const apiKey = "AIzaSyA8UqKV9nCZFXwPp5aHKck7Bi2zi80hK3Q"; //sohams key
const places = new googleplaces(apiKey, "json");

app.use(express.json());

app.post("/", (req, res) => {
  const { zipCode, query } = req.body;

  const params = {
    location: zipCode,
    query: query,
    opennow: true,
  };

  const paramsString =
    "location " + params.location + " looking for " + params.query;
  console.log(paramsString);

  const locations = [];
  places.textSearch(params, async (error, response) => {
    if (error) {
      console.error(error);
      return;
    }

    const info = await getInfo(paramsString);
    const results = info.places.slice(0, 3);
    const locations = [];

    for (const result of results) {
      const id = result.id;
      const name = result.displayName.text;
      const address = result.formattedAddress;
      const phoneNumber = await getPhoneNumber(id);

      const location = {
        name: name,
        address: address,
        phoneNumber: phoneNumber,
      };

      locations.push(location);
    }

    console.log(locations);
    res.json(locations);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function getInfo(searchText) {
  const requestBody = {
    textQuery: searchText,
  };

  try {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "*",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    return "Error fetching data: " + error.message;
  }
}

async function getPhoneNumber(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number&key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK") {
      if (data.result.formatted_phone_number) {
        return data.result.formatted_phone_number;
      } else {
        return "Phone number not found for this place.";
      }
    } else {
      return "Error: " + data.status;
    }
  } catch (error) {
    return "Error fetching data: " + error.message;
  }
}
