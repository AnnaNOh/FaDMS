import * as d3 from "d3";
import _ from 'lodash';



const margin = {top: 100, right: 50, bottom: 50, left: 140};
const width = 1200 - margin.left - margin.right,
      height = 620 - margin.top - margin.bottom;

const svg = d3.select("body")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
                .attr("transform",
                      "translate(" + margin.left + "," + margin.top + ")");

const tooltipAll = d3.select("body")
                  .append("div")
                  .attr("id", "tooltipAll");

const tooltip = d3.select("#tooltipAll")
                  .append("div")
                  .attr("id", "tooltip");
const tooltip2 = d3.select("#tooltipAll")
                  .append("div")
                  .attr("id", "tooltip2");
const tooltip3 = d3.select("#tooltipAll")
                  .append("div")
                  .attr("id", "tooltip3");


// set the ranges
var x = d3.scaleLinear().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([0, height]);


// get data from csv
let AllMovieInfo = [];
d3.queue()
  .defer(d3.csv, "data/imdb250.csv")
  .await(ready);

// once data is fetched, then do stuff
function ready(error, movies){
  if (error) throw error;

  let oldestYear = 1960;
  let biggestWWBO = 1500000000;
  movies.forEach(function(d){
    let MovieItem = {};

    d.Year = Number(d.Year);
    d.Budget = Number(d.Budget);
    d.WWBO = Number(d.WWBO);
    d.DomBO = Number(d.DomBO);
    d.ForBO = Number(d.ForBO);

    // Profit and RoI
    d.WWProfit = (d.WWBO - d.Budget);
    d.ForProfit = (d.ForBO - d.Budget);
    d.PerFRevenue = (d.ForBO / d.WWBO) * 100;
    d.RoI = (d.WWProfit) / (d.Budget);
    d.FRoI = (d.ForBO - d.Budget) / (d.Budget);
    d.PerFRoI = d.FRoI / (d.RoI) * 100;

    d.AYear = (d.Year - oldestYear) / (60/width);
    d.AWWBO = d.WWBO / (biggestWWBO/height);

    MovieItem[d.Movie] = d;
    AllMovieInfo.push(MovieItem);
  });

  // Scale the data's range
  let maxY = d3.max(movies, function(d) { return d.PerFRevenue; });
  x.domain([1962, 2017]);
  y.domain([maxY, 0]);

// Making the scatterplot
  let logscale = 10000000;
  let tooltipLeft = (d) => margin.left + d.AYear;
  let tooltipTop = (d) => margin.top + height - (height * d.PerFRevenue/maxY);
  let spaceTop = 15;
  let tooltipTop2 = (d) => spaceTop + tooltipTop(d);
  let tooltipTop3 = (d) => spaceTop + tooltipTop2(d);
  console.log(AllMovieInfo);
  svg.selectAll("circle")
  .data(movies)
  .enter()
  .append("circle")
  .attr("r", function(d) { return(Math.log(d.WWBO/logscale) * 20); })
  .attr("cx", function(d) { return (d.AYear); })
  .attr("cy", function(d) { return height - (d.PerFRevenue/maxY * height); })
  .style('fill', (d) => d.PerFRevenue > 20 ? '#225FC1' : '#C13522')
  .style("fill-opacity", 0.5)
  .on('mouseover', (d) => {
    tooltip.transition()
      .duration(100)
      .style('opacity', .9);
    tooltip2.transition()
      .duration(100)
      .style('opacity', .9);
    tooltip3.transition()
      .duration(100)
      .style('opacity', .9);
    tooltip.text(`${d.Movie} (${d.Year})`)
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop(d)}px`);
    tooltip2.text(`Foreign Box Office: $${d.ForBO}`)
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop2(d)}px`);
    tooltip3.text(`Total Box Office: $${d.WWBO}`)
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop3(d)}px`);

  })
  .on('mouseout', () => {
    tooltip.transition()
    .duration(400)
    .style('opacity', 0);
    tooltip2.transition()
    .duration(400)
    .style('opacity', 0);
    tooltip3.transition()
    .duration(400)
    .style('opacity', 0);
  });



  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "#000")
      .attr("text-anchor", "start")
      .attr("x", 1020)
      .attr("y", 5)
      .text("Year");

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr('transform', 'rotate(-90)')
      .attr("fill", "#000")
      .attr("x", "-12em")
      .attr("y", "-3.5em")
      .text("Percent of Gross Box Office from Foreign Markets");

}
