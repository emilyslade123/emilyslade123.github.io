import { validId } from './regex.js'
import { months } from './dates.js'

export const boroughMap = (parent, props) => {
    const {
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
    } = props;

    // ------- Set up the g container -------
    
    const width = +parent.attr('width');
    const height = +parent.attr('height');
    
    const margin = {top: 60, bottom: showMonthly ? 80 : 20 , left: 50, right: 50};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const group = parent
        .selectAll('.container')
        .data([null]);
        
    const g = group
        .enter()
        .append('g')
        .attr('class', 'container')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .merge(group)
    
    parent.call(
      d3.zoom()
        .scaleExtent([1, 12])
        .translateExtent([[-margin.left, -margin.top], [margin.right + innerWidth, margin.bottom + innerHeight]])
        .on('zoom', event => g.attr('transform', event.transform))
    );
    
    // ------- Add the title -------
    
    const titleContainerG = g
        .selectAll('g.title')
        .data([null])
    
    const titleEnterG = titleContainerG
        .enter()
        .append('g')
        .merge(titleContainerG)
            .attr('class', 'title')
    
    const title = titleEnterG
        .selectAll('text')
        .data([null]);
    
    const textEnter = title
        .enter()
        .append('text');
    
    textEnter
        .merge(title)
            .attr('x', innerWidth / 2)
            .attr('y', -23)
            .attr('class', 'title')
            .text('Geographical rat sightings in ' + (zoomingIntoBorough || 'New York City'))
            
    titleContainerG.exit().remove();
    
    // ------- Add a label showing the displayed month and year -------
    
    const dateTextG = g
        .selectAll('g.datetext')
        .data(showMonthly ? [null] : [])
        
    const dateTextEnterG = dateTextG
        .enter()
        .append('g')
        .merge(dateTextG)
            .attr('class', 'datetext')
            
    const dateText = dateTextEnterG
        .selectAll('text')
        .data(showMonthly ? [null] : [])
        
    const dateTextEnter = dateText
        .enter()
        .append('text')
        
    dateTextEnter
        .merge(dateText)
            .attr('x', innerWidth / 2)
            .attr('y', innerHeight + (margin.bottom / 2))
            .text(`Rat sightings in ${month} ${year}`)
            
    dateTextG.exit().remove();
    
    // ------- Create the map of boroughs -------
    
    const boroughs = {'type': 'FeatureCollection', 'features': boroughsGeoJson.features.slice()};
    
    if (zoomedIn) {
        boroughs.features = boroughsGeoJson.features.filter(d => d.properties.name == zoomingIntoBorough)
    }

    const projection = d3.geoMercator().fitSize([innerWidth, innerHeight], boroughs);
    const pathGenerator = d3.geoPath().projection(projection);

    const boroughContainerG = g
        .selectAll('g.all-boroughs')
        .data([null])
    
    const boroughEnterG = boroughContainerG
        .enter()
        .append('g')
        .merge(boroughContainerG)
            .attr('class', 'all-boroughs')

    const borough = boroughEnterG
        .selectAll('.borough')
        .data(boroughs.features, d => d.properties.name)

    const boroughEnter = borough
        .enter()
        .append('path')
        
    boroughEnter
        .merge(borough)
            .attr('class', 'borough')
            .attr('id', d => validId(d.properties.name))
            .attr('fill', d => colourScale(d.properties.name))
            .attr('opacity', 1)
            .transition()
            .duration(zoomingIn || zoomingOut ? 1000 : 0)
                .attr('d', pathGenerator)
    
    boroughEnter
        .on('click', (e, d) => onBoroughClicked(e, d.properties.name))
            
    boroughContainerG.exit().remove();
    borough.exit().transition().duration(500).attr('opacity', 0).remove();
    
    // ------- Add the rat sightings -------

    let data;
    if (showMonthly) {
        data = ratSightings.filter(d => months[d.date.getMonth()] == month && d.date.getFullYear() == year);
    }
    else if (showAggregated) {
        data = latLonCounts.filter(d => d.count > aggregateValue);
    }
    
    if (zoomedIn) {
        data = data.filter(d => d.borough == zoomingIntoBorough)
    }
    
    const getRadius = (count) => {
        if (showMonthly) {
            return 2
        }
        else if (showAggregated) {
            const distance = projection([0,0])[1] - projection([0,0.0025])[1];
            return Math.sqrt(count / Math.PI) * distance;
        }
    }

    const ratsContainerG = g
        .selectAll('g.rat-sightings')
        .data([null])
    
    const ratsEnterG = ratsContainerG
        .enter()
        .append('g')
        .merge(ratsContainerG)
            .attr('class', 'rat-sightings')
    
    const rats = ratsEnterG
        .selectAll('circle')
        .data(data, d => d.id)
        
    const ratsEnter = rats
        .enter()
        .append('circle')
            .attr('class', 'rat')
            .attr('cx', d => projection([d.lon, d.lat])[0])
            .attr('cy', d => projection([d.lon, d.lat])[1])
            .attr('pointer-events', 'none')

    ratsEnter
        .merge(rats)
            .transition()
            .duration(d => {
                if (zoomingIn && zoomingIntoBorough == d.borough
                || zoomingOut && zoomingOutOfBorough == d.borough)
                    {return 1000}
                else 
                    {return 0}
            })
            .delay(d => {
                if (zoomingOut && zoomingOutOfBorough != d.borough)
                    {return 500}
                else 
                    {return 0}
            })
                .attr('r', d => getRadius(d.count))
                .attr('cx', d => projection([d.lon, d.lat])[0])
                .attr('cy', d => projection([d.lon, d.lat])[1])
                .attr('opacity', d => {
                    if (showMonthly)
                        {return 0.8}
                    else if (showAggregated) 
                        {return 0.2}
                    else 
                        {return 0}
                })

    ratsContainerG.exit().remove();
    rats.exit().remove()
            
    // ------- Add a colour-coded borough legend -------
    
    const boroughsLegendContainerG = g
        .selectAll('g.boroughs-legend')
        .data(zoomedIn ? [] : [null])
    
    const boroughsLegendEnterG = boroughsLegendContainerG
        .enter()
        .append('g')
        .merge(boroughsLegendContainerG)
            .attr('class', 'boroughs-legend')
    
    const boroughLegend = boroughsLegendEnterG
        .selectAll('g.boroughs-legend-item')
        .data(colourScale.domain());
        
    const boroughLegendEnter = boroughLegend
        .enter()
        .append('g')

    boroughLegendEnter
        .merge(boroughLegend)
            .attr('class', 'boroughs-legend-item')
            .attr('transform', (d, i) => `translate(10, ${i * 30 + 40})`)

    boroughLegendEnter
        .append('text')
            .text(d => d)
            .attr('x', 30)
            .attr('y', 13)
        
    boroughLegendEnter
        .append('rect')
            .attr('fill', colourScale)
            .attr('width', 15)
            .attr('height', 15)

    boroughLegendEnter
        .on('mouseenter', (event, d) => d3.select('#' + validId(d)).attr('opacity', 0.5))
        .on('mouseleave', (event, d) => d3.select('#' + validId(d)).attr('opacity', 1))
        
    boroughLegendEnter
        .on('click', onBoroughClicked)
        
    boroughsLegendContainerG.exit().remove()
    
    // ------- Add a legend to describe the rat sighting radius -------
    
    const legendRadius = getRadius(aggregateValue);
    
    const ratLegend = g
        .selectAll('g.rat-legend')
        .data(showAggregated ? [[aggregateValue, legendRadius]] : [], d => d);
        
    const ratLegendEnter = ratLegend
        .enter()
        .append('g')
    
    const boroughPositions = 
    {
        'Default': 'translate(10, 250)',
        'Bronx': 'translate(380, 50)',
        'Queens': 'translate(10, 340)',
        'Manhattan': 'translate(25, 120)',
        'Brooklyn': 'translate(20, 50)',
        'Staten Island': 'translate(350, 450)',
    }

    ratLegendEnter
        .merge(ratLegendEnter)
        .attr('transform', boroughPositions.Default)
            .attr('class', 'rat-legend')
            .transition()
            .duration(zoomingIn || zoomingOut ? 1000 : 0)
                .attr('transform', function() {
                    if (zoomedIn) {
                        return boroughPositions[zoomingIntoBorough]
                    }
                    else {
                        return boroughPositions.Default
                    }
                })

    const ratLegendText = ratLegendEnter
        .append('text')
        .merge(ratLegendEnter)
            .attr('x', 30)
            .text(d => aggregateValue == 1 ? aggregateValue + ' rat sighting' : aggregateValue + ' rat sightings')
            
    const ratLegendCircle = ratLegendEnter
        .append('circle')
        .merge(ratLegendEnter)
            .attr('opacity', 0.5)
            .attr('r', legendRadius)
            .attr('cx', -legendRadius/2 + 2)
            .attr('cy', -legendRadius/8 - 6)
    
    ratLegend.exit().remove()
}