export const loadAndProcessData = () => 
    Promise.all([
        d3.csv('../Data/Rat sightings.csv'),
        d3.text('../Data/rat.svg')
    ])
    .then(([data, ratSvg]) => {
        data.forEach(d => {
            // add new attribute
            d.date      = new Date(d['Created Date']);

            // remove old attributes
            delete d['Created Date']
            delete d['Borough']
            delete d['Latitude']
            delete d['Longitude']
        })
        
        const months = [];
        for (let i = 0; i < 12; i++) {months.push(0)}

        const [minYear, maxYear] = d3.extent(data, d => d.date.getFullYear());
        
        const yearDict = {};
        for (let i = minYear; i <= maxYear; i++) {yearDict[i.toString()] = months.slice()} 

        data.forEach(d => {
            yearDict[d.date.getFullYear()][d.date.getMonth()] += 1;
        })
        
        return [yearDict, ratSvg];
    })