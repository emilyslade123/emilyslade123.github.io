export const sliderOptions = (parent, props) => {
    const {
        aggregateMin,
        aggregateMax,
        aggregateValue,
        onSliderChanged
    } = props;
    
    const slider = parent
        .selectAll('input')
        .data([null]);
        
    const selectEnter = slider
        .enter()
        .append('input')
        .merge(slider)
            .attr('type', 'range')
            .attr('min', aggregateMin)
            .attr('max', aggregateMax)
            .attr('value', aggregateValue)
            .attr('id', 'slider-bar')
            .on('input', onSliderChanged)
            
    const label = parent
        .selectAll('label')
        .data([null]);
        
    const labelEnter = label
        .enter()
        .append('label')
        .merge(label)
            .attr('for', 'slider-bar')
            .attr('style', 'display: block;')
            .text('Showing aggregated sightings of at least: ' + aggregateValue)
            
}