import { months } from '../dates.js'

export const circularMap = (parent, props) => {
    const {
        radius,
        innerGap,
        yearDict,
        colourScale,
        showRadial,
        linkedHighlighting,
        onClick,
        selectedMonth,
        selectedYear,
        ratSvg
    } = props;
    
    // ------- Set up the g container -------
    
    const width = +parent.attr('width');
    const height = +parent.attr('height');
    
    const group = parent
        .selectAll('.container')
        .data([null]);
        
    const g = group
        .enter()
        .append('g')
        .attr('class', 'container')
        .attr('transform', `translate(${width / 2}, ${height / 2})`)
        .merge(group)
        
    // ------- Add a title -------
    
    g
        .selectAll('text.title')
        .data([null])
        .enter()
        .append('text')
            .text('Chronological rat sightings in New York City')
            .attr('text-anchor', 'middle')
            .attr('x', 0)
            .attr('y', -263)
            .attr('class', 'title')
            
    // ------- Set up the chart -------
    
    const yearsArr = Object.keys(yearDict);

    // the graph as a whole
    const graphG = g
        .selectAll('g.graph')
        .data([null])
        
    const graph = graphG
        .enter()
        .append('g')
        .merge(graphG)
            .attr('class', 'graph')
            .attr('transform', 'translate(0, -15)')
    
    // the set of 7 full rings (representing one year)
    const ringsG = graph
        .selectAll('g.rings')
        .data(yearsArr)
        
    const rings = ringsG
        .enter()
        .append('g')
        .merge(ringsG)
            .attr('class', 'rings')
            .attr('id', d => 'y' + d)
    
    // define a generic pie chart
    const pie = d3
        .pie()
        .sort(d => d.index)
        .value(1)

    // ------- Add the rings -------
    
    rings.each((datum, index) => {

        // define a generic arc
        const arc = d3
            .arc()
            .innerRadius(innerGap + index * radius)
            .outerRadius(innerGap + (index + 1) * radius)

        const ring = rings
            .selectAll('g')
            .data(pie(yearDict[datum]), d => d.index)
            .enter()
        
        ring
            .append('path')
                .attr('fill', d => colourScale(d.data))
                .attr('class', 'ring')
                .attr('year', datum)
                .attr('month', (d, i) => months[i])
                .attr('d', arc)
                .style('stroke-width', (d, i) => months[i] == selectedMonth && datum == selectedYear ? 2.5 : 1)
                // ------- Add a tooltip -------
                .on('mousemove', (event, d) => {
                    const currentMonth = event.srcElement.attributes.month.value;
                    const currentYear = event.srcElement.attributes.year.value;
                    const value = d.data;
                    let text = value + ' rat sightings';
                    if (['October', 'November', 'December'].includes(currentMonth) && currentYear == 2017) {
                        text = 'No data available';
                    }
                    d3
                        .select('#tooltip')
                        .style('display', 'block')
                        .style('left', (event.pageX + 20) + 'px')
                        .style('top', (event.pageY + 10) + 'px')
                        .html(`<div class='tooltip-title'><b>${currentMonth} ${currentYear}</b></div>
                               <div>${text}</div>
                        `)
                })
                .on('mouseleave', (event, d) => {
                    d3.select('#tooltip').style('display', 'none');
                })
                .on('click', event => onClick(event))
    })
    
    rings.on('mouseleave', (event, d) => {
        d3.select('#tooltip').style('display', 'none');
    })
    
    // ------- Add the year labels -------

    const yearsG = g
        .selectAll('g.years')
        .data([null])
    
    yearsG.exit().remove()
        
    const years = yearsG
        .enter()
        .append('g')
        .merge(yearsG)
            .attr('class', 'years')
            .attr('transform', 'translate(0, -15)')

    years
        .selectAll('text.year')
        .data(yearsArr)
        .enter()
        .append('text')
            .text(d => d)
            .attr('x', 1)
            .attr('y', (d, i) => - (innerGap + 1 + (i + 0.2) * radius))
            .attr('font-size', (d, i) => (i * 0.5 + 10.5) + 'px')
            .attr('class', 'year')
            .attr('pointer-events', 'none')
            
    
    // ------- Add the month labels -------

    const outerArc = d3
        .arc()
        .innerRadius(innerGap + yearsArr.length * radius)
        .outerRadius(innerGap + (yearsArr.length + 1) * radius)
    
    const monthsG = g
        .selectAll('g.months')
        .data([null])
        
    const monthsEnter = monthsG
        .enter()
        .append('g')
        .merge(monthsG)
            .attr('class', 'months')
            .attr('transform', 'translate(0, -15)')

    const monthLabels = monthsEnter
        .selectAll('text.month')
        .data(pie(months), d => d.index)
        
    monthLabels
        .enter()
        .append('text')
            .merge(monthLabels)
            .text(d => d.data)
            .attr('class', 'month')
            .attr('text-anchor', (d, i) => showRadial
            ? 'middle'
            : (i < 6 ? 'start' : 'end')
            )
            .attr('transform', (d, i) => showRadial
            ? `
                translate(${outerArc.centroid(d)})
                rotate(${((i + 0.5) / months.length) * 360})
            `
            : `
                translate(${outerArc.centroid(d).map((d, i) => i == 1 ? d + 5 : d)})
            `
            )

    // ------- Add the 'no data' labels -------

    const penultimateArc = d3
        .arc()
        .innerRadius(innerGap + (yearsArr.length - 1.4) * radius)
        .outerRadius(innerGap + yearsArr.length * radius)

    const nodataLabelsG = g
        .selectAll('g.nodataLabels')
        .data([null])
    
    nodataLabelsG.exit().remove();
        
    const nodataLabels = nodataLabelsG
        .enter()
        .append('g')
        .merge(nodataLabelsG)
            .attr('class', 'nodataLabels')
            .attr('transform', 'translate(0, -15)')
            
    nodataLabels
        .selectAll('text.nodata')
        .data(pie(months), d => d.index)
        .enter()
        .append('text')
            .text(d => {return ['October', 'November', 'December'].includes(d.data) ? 'no data' : '' })
            .attr('text-anchor', 'middle')
            .attr('color', 'grey')
            .attr('class', 'nodata')
            .attr('pointer-events', 'none')
            .attr('transform', (d, i) => `
                translate(${penultimateArc.centroid(d)})
                rotate(${((i + 0.5) / months.length) * 360})
            `)
    
    // ------- Add decorative rat icon in the centre of the graph --------
    
    const ratG = g
        .selectAll('g.rat')
        .data([null])
        
    const rat = ratG
        .enter()
        .append('g')
        .merge(ratG)
            .attr('class', 'rat')
            .attr('transform', 'translate(0, -15)')
    
    rat
        .selectAll('path.ratIcon')
        .data([null])
        .enter()
        .append('path')
            .attr('transform', 'translate(-26, 26) scale(0.0042, -0.0042)')
            .attr('class', 'ratIcon')
            .attr('d', ratSvg)
        
    // ------- Add legend -------
    
    // I used the following links to understand the 'linearGradient' syntax,
    // and these provided most of the inspiration for the following section of code
    // https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient/
    // https://www.w3schools.com/graphics/svg_grad_linear.asp
    
    const defs = g
        .selectAll('defs')
        .data([null])
        .enter()
        .append('defs')
    
    const lg = defs
        .append('linearGradient')
            .attr('id', 'linearGradient')
    
    lg
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%')
            
    lg.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', colourScale.range()[0])
    
    lg.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', colourScale.range()[1])
        
    // End of 'linearGradient' code section based on the above links
    
    const legendG = g
        .selectAll('g.legend')
        .data([null])
        
    const legend = legendG
        .enter()
        .append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${- width / 2}, ${height / 2 - 75})`)
    
    const legendBar = legend
        .append('rect')
            .attr('width', width - 150)
            .attr('height', 30)
            .attr('x', 75)
            .attr('y', 0)
            .attr('stroke', 'black')
            .attr('fill', 'url(#linearGradient)')
            
    const legendLabel = legend
        .selectAll('text')
        .data(colourScale.domain())
        .enter()
        .append('text')
            .text(d => d)
            .attr('x', (d, i) => i * (width - 120) + 60)
            .attr('y', 20)
            .attr('text-anchor', (d, i) => i == 0 ? 'end' : 'start')
            
    
    const legendDescription = legend
        .selectAll('text.description')
        .data([null])
        .enter()
        .append('text')
            .attr('class', 'description')
            .attr('text-anchor', 'middle')
            .attr('x', width / 2)
            .attr('y', 60)
            .text('Number of rat sightings per month')
}