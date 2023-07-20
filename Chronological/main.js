import { loadAndProcessData } from './loadAndProcessData.js'
import { circularMap } from './circularMap.js'
import { checkboxOptions } from './checkboxOptions.js'
import { linkedHighlighting } from '../main.js'
import { month } from '../main.js'
import { year } from '../main.js'

const svg = d3.select('#svgChronological');
const width  = +svg.attr('width');
const height = +svg.attr('height');

let showRadial = true;
let selectedMonth = month;
let selectedYear = year;
let yearDict;
let ratSvg;
let extent;
let colourScale;

const onCheckboxClick = event => {
    showRadial = d3.select('#showRadial').property('checked');
    updateVis();
}

const onClick = event => {
    if (event) {
        selectedMonth = event.srcElement.attributes.month.value;
        selectedYear = event.srcElement.attributes.year.value;
    }
    d3.selectAll('path.ring').style('stroke-width', 1);
    d3.selectAll(`path[month='${selectedMonth}'][year='${selectedYear}'].ring`).style('stroke-width', 2.5);
    linkedHighlighting(selectedMonth, selectedYear)
}

const evalOnce = () => {
    colourScale = d3
        .scaleLinear()
        .domain(extent)
        .range(['rgb(255, 255, 255)', 'rgb(0, 0, 255)']); // white to pure blue
    onClick();
    d3.selectAll('#divChronological > .info').html(`
    This graph shows the total number of rat sightings in New York City
    <br>
    for each month between January 2010 and September 2017.
    <br><br>
    Darker blue indicates more monthly sightings, lighter blue indicates
    <br>
    fewer monthly sightings, and white indicates that no data is available.
    <br><br>
    Note there is no data available for October, November and December 2017.
    <br><br>
    Toggle the checkbox to make all text horizontal for easier reading.
    <br><br>
    Hover over a month to display a tooltip to see the precise number 
    <br>
    of rat sightings in that month and year.
    <br><br>
    There is unidirectional linked highlighting: clicking on a month
    <br>
    updates the map to show the locations of that month's rat sightings.
    `)
}

const updateVis = () => {
    checkboxOptions(d3.select('#checkboxRadial'), {
        'data': 'Show text radially', 
        'id': 'showRadial', 
        'checked': showRadial, 
        onCheckboxClick
    });
    circularMap(svg, {
        'radius': 20,
        'innerGap': 40,
        yearDict,
        colourScale,
        showRadial,
        selectedMonth,
        selectedYear,
        onClick,
        linkedHighlighting,
        ratSvg
    })
}

loadAndProcessData()
.then(([yearDictData, ratSvgData]) => {
    yearDict = yearDictData;
    ratSvg = ratSvgData;
    
    const monthlyTotals = Object.values(yearDict).reduce((x, y) => x.concat(y), []) 
    extent = d3.extent(monthlyTotals.filter(x => x !== 0));
}).then(()=>{
    evalOnce();
    updateVis();
})
