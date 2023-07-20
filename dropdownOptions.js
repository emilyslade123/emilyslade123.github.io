export const dropdownOptions = (parent, props) => {
    const {
        options,
        onOptionSelected,
        selectedOption
    } = props;
    
    const select = parent
        .selectAll('select')
        .data([null]);
        
    const selectEnter = select
        .enter()
        .append('select')
        .merge(select)
            .on('change', onOptionSelected)
            
    const option = selectEnter
        .selectAll('option')
        .data(options);
        
    option
        .enter()
        .append('option')
        .merge(option)
            .attr('value', d => d)
            .attr('selected', function(d) {return d3.select(this).data() == selectedOption ? true : null})
            .text(d => d);
}