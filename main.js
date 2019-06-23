import * as d3 from "d3";


const w = 1000;
const h = 500;
const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
const margin = {
  top: 20,
  bottom: 60,
  left: 60,
  right: 20
}
const width = w - margin.left - margin.right;
const height = h - margin.top - margin.bottom;
const tooltip = d3.select('body')
    .append('div')
    .attr("id", "tooltip")
    .classed('tooltip', true);

const svg = d3.select('.container').append('svg')
        .attr('id', 'chart')
        .attr('width', w)
        .attr('height', h);

const chart = svg.append('g')
        .classed('display', true)
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

const color = d3.scaleOrdinal(d3.schemeCategory10);
const timeFormat = d3.timeFormat("%M:%S");

init.call(chart)

async function init() {
  try {
    let data  = await d3.json(url);
    data = data.map(elm => {
      let time = elm.Time.split(':');
      return {
        ...elm,
        Time: new Date(Date.UTC(1970, 0, 1, 0, time[0], time[1]))
      }
    })
    // console.log(data)

    const x = d3.scaleLinear()
        .domain([d3.min(data, d => d.Year-1), d3.max(data, d => d.Year+1)])
        .range([0, width]);
    
    
    const y = d3.scaleTime()
        .domain(d3.extent(data, d => d.Time))
        .range([0, height]);
    
    const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"))
    const yAxis = d3.axisLeft(y).tickFormat(timeFormat)
    
    this.append('g')
        .classed('axis', true)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)

    this.append('g')
        .classed('axis', true)
        .attr('id', 'y-axis')
        .attr('transform', `translate(0, 0)`)
        .call(yAxis)


    this.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
          .classed('dot', true)
          .attr("cx", 0)
          .attr("cy", 420)
          .attr("r", 1)
			    .transition()
			    .duration(200)
          .delay((d, i) => i * 50)
          .attr("r", 8)
          .attr("cx", d => x(d.Year))
          .attr("cy", d => y(d.Time))
          .attr("data-xvalue", d => d.Year)
          .attr("data-yvalue", d => d.Time.toISOString())
          .style("fill", d => color(d.Doping != ""))
          .attr('transform', 'translate(0, 0)')
    
    this.selectAll('.dot')
          .on('mouseover', showTooltip)
          .on('touchstart', showTooltip)
          .on('mouseout', hideTooltip)
          .on('touchend', hideTooltip);
    

    this.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -160)
        .attr('y', -44)
        .style('font-size', 18)
        .text('Time in Minutes');
    
    const legend = this.selectAll(".legend")
        .data(color.domain())
        .enter()
        .append("g")
          .attr("class", "legend")
          .attr("id", "legend")
          .attr("transform", (d, i) => "translate(0," + (height/2 - i * 20) + ")");

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(d => d 
            ? "Riders with doping allegations"
            :"No doping allegations"
        );


    function showTooltip(d,i) {
      tooltip
        .style('opacity', 1)
        .style('left', d3.event.x -(tooltip.node().offsetWidth / 2) + 'px')
        .style('top', d3.event.y + -110 + 'px')
        .attr("data-year", d.Year)
        .html(d.Name + ": " + d.Nationality + "<br/>"
              + "Year: " +  d.Year + ", Time: " + timeFormat(d.Time) 
              + (d.Doping?"<br/><br/>" + d.Doping:""))
 }
  
     function hideTooltip() {
          tooltip
            .style('opacity', 0)
     }
    
} catch(e) {
    console.log(e)
  }
}

