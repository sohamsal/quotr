const { Client } = require('@googlemaps/google-maps-services-js');

async function getPlaces(zipCode, radius, type) {
    try {
        const client = new Client({});
        
        // Send a nearby search request to the Google Places API
        const response = await client.placesNearby({
            params: {
                location: zipCode,
                radius: radius,
                type: type,
                key: 'YOUR_API_KEY' // Replace with your actual Google Places API key
            }
        });

        // Extract relevant information from the response
        const places = response.data.results.map(place => ({
            name: place.name,
            phone: place.formatted_phone_number,
            website: place.website
        }));

        return places;
    } catch (error) {
        console.error('Error fetching places:', error);
        throw error;
    }
}

// Example usage
const zipCode = '12345';
const radius = 10000; // radius in meters
const type = 'restaurant'; // example type

getPlaces(zipCode, radius, type)
    .then(places => {
        console.log('Places:', places);
    })
    .catch(error => {
        console.error('Error:', error);
    });
