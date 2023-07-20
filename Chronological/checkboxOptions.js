export const checkboxOptions = (parent, props) => {
    const {
        data,
        id,
        checked,
        onCheckboxClick
    } = props;
    
    const option = parent
        .selectAll('input')
        .data([null]);
        
    const optionEnter = option
        .enter()
        .append('input')
        .attr('type', 'checkbox')
        .attr('id', id)
        .text(data);
    
    optionEnter
        .merge(option)
        .property('checked', checked)
        .on('change', onCheckboxClick);
        
    const label = parent
        .selectAll('label')
        .data([null]);
        
    const labelEnter = label
        .enter()
        .append('label')
            .text(data)
            .attr('class', 'checkboxLabel')
            .attr('for', id)
}