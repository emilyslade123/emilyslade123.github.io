import { capitaliseEachWord } from './regex.js'
// Dataset: https://www.kaggle.com/datasets/new-york-city/nyc-rat-sightings

export const loadAndProcessData = () => 
    Promise.all([
        d3.json('./Data/new-york-city-boroughs.geojson'), 
        d3.csv('./Data/Rat sightings.csv')
    ])
    .then(([geoData, csvData]) => {
        csvData.forEach((d, i) => {
            // add new attributes
            d.date      = new Date(d['Created Date']);
            d.borough   = capitaliseEachWord(d['Borough'])
            d.lat       = +d['Latitude']
            d.lon       = +d['Longitude']
            d.id        = i
            
            // remove old attributes
            delete d['Created Date']
            delete d['Borough']
            delete d['Latitude']
            delete d['Longitude']
        })
        
        // Get the names of the 5 boroughs
        const boroughNames = csvData.map(d => d.borough).filter((d, i, a) => a.indexOf(d) === i)
        
        // Create a dictionary with coordinates:numberofsightings as the key:value pairs
        const latLonCounts = {};
        csvData.forEach((d, i) => {
            if (latLonCounts[d.lat + ',' + d.lon] === undefined) {
                latLonCounts[d.lat + ',' + d.lon] = {'count': 1, 'id': i, 'lat': d.lat, 'lon': d.lon, 'borough': d.borough}
            }
            else {
                latLonCounts[d.lat + ',' + d.lon]['count'] += 1;
            }
        })
        const latLonCountsArray = Object.values(latLonCounts)

        return [geoData, csvData, boroughNames, latLonCountsArray];
    })