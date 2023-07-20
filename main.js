import { boroughMap } from './boroughMap.js'
import { loadAndProcessData } from './loadAndProcessData.js'
import { dropdownOptions } from './dropdownOptions.js'
import { sliderOptions } from './sliderOptions.js'
import { validId } from './regex.js'
import { months } from './dates.js'

// ------- Initialise the canvas -------

const svg = d3.select('#svgGeographical');
const width  = +svg.attr('width');
const height = +svg.attr('height');

// ------- Initialise global data variables -------

let boroughsGeoJson;
let boroughNames;
let locationTypes;
let ratSightings;
let latLonCounts;
let colourScale;

// ------- Initialise the dropdown menu -------

let showMonthly;
let showAggregated;
let aggregateMin;
let aggregateMax;
let aggregateValue = 5;

const options = ['Monthly values', 'Aggregated values'];
let selectedOption = options[0];

const updateShowVars = () => {
    if (selectedOption == options[0]) {
        showMonthly = true;
        showAggregated = false;
        toggleSliderHidden(true);
    }
    else if (selectedOption == options[1]) {
        showMonthly = false;
        showAggregated = true;
        toggleSliderHidden(false);
    }
}

const toggleSliderHidden = (hidden) => {
    d3.select('#slider').property('hidden', hidden);
}

const onOptionSelected = event => {
    selectedOption = event.target.value;
    updateShowVars();
    updateVis();
}

// -------Initialise the slider -------

const onSliderChanged = (event, d) => {
    aggregateValue = +event.target.value;
    updateVis();
}

// ------- Initialise zooming functionality -------

let zoomingIn = false;
let zoomingOut = false;
let zoomedIn = false;

let zoomingIntoBorough = '';
let zoomingOutOfBorough = '';

const onBoroughClicked = (event, d) => {
    if (zoomedIn) {
        zoomingIn = false;
        zoomingOut = true;
        zoomingOutOfBorough = d;
        zoomingIntoBorough = '';
    }
    else {
        zoomingIn = true;
        zoomingOut = false;
        zoomingOutOfBorough = '';
        zoomingIntoBorough = d;
    }
    zoomedIn = !zoomedIn;
    updateVis();
    zoomingIn = false;
    zoomingOut = false;
}

// ------- Initialise linked highlighting  -------

export let month = 'September';
export let year = '2017';

export const linkedHighlighting = (selectedMonth, selectedYear) => {
    if (showMonthly) {
        month = selectedMonth;
        year = selectedYear;
        updateVis();
    }
}

// ------- Evaluate non-updating code -------

const evalOnce = () => {
    colourScale = d3
        .scaleOrdinal()
        .domain(boroughNames)
        .range(d3.schemeSet1);
        
    d3.selectAll('#divGeographical > .info').html(`
    This graph shows the location of New York City rat sightings.
    <br><br>
    Use the dropdown menu at the top to switch between the monthly view and aggregate view.
    <br><br>
    The monthly view shows all individual rat sightings in the specified month and year.
    <br><br>
    The aggregate view shows all rat sightings between January 2010 and September 2017,
    <br>
    but multiple rat sightings at the same position are shown as a single larger circle.
    <br><br>
    Hover over the legend to show which borough is which.
    <br><br>
    Click on a borough to zoom in, and click on it again to zoom out.
    <br><br>
    When the aggregate view is selected, use the slider to filter the rat sightings
    <br>
    to only show locations with multiple rat sightings.
    `)
    
    d3.selectAll('#header').html(`
    <div style='display:block;font-family:arial;width:1200px;text-align:center;'><h1>
    Rat Sightings in New York City
    </h1></div>
    <div style='display:block;font-family:arial;width:1200px;text-align:center;'><b>
    For accurate interaction and linked highlighting, zoom out until both views are side by side
    </b></div>
    <div style='display:block;font-family:arial;width:1200px;text-align:center;'>
    This visualisation allows users to answer the questions: 
    'how do rat sightings vary with time' and 'how do rat sightings vary by location'
    </div><br><br>
    `)

    updateShowVars();
}

// ------- Update the HTML -------
 
const updateVis = () => {
    dropdownOptions(d3.select('#views'), {options, onOptionSelected, selectedOption});
    sliderOptions(d3.select('#slider'), {aggregateMin, aggregateMax, aggregateValue, onSliderChanged});

    boroughMap(svg, {
        colourScale, 
        showMonthly, 
        showAggregated,
        aggregateValue,
        zoomedIn,
        zoomingIn,
        zoomingOut,
        zoomingIntoBorough,
        zoomingOutOfBorough,
        onBoroughClicked,
        month,
        year,
        latLonCounts,
        boroughsGeoJson, 
        ratSightings
    });
}

// ------- Load the data -------

loadAndProcessData()
.then(([geoData, csvData, names, counts]) => {
    boroughsGeoJson = geoData;
    ratSightings = csvData;
    boroughNames = names.sort();
    latLonCounts = counts;
    aggregateMax = Math.max.apply(null, counts.map(d => d.count));
    aggregateMin = Math.min.apply(null, counts.map(d => d.count));
    evalOnce();
}).then(() => {
    updateVis();
})
