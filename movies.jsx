import * as d3 from "d3";
import _ from 'lodash';

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

const margin = {top: 80, right: 70, bottom: 80, left: 90};
const width = 1200 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

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
const tooltip4 = d3.select("#tooltipAll")
                  .append("div")
                  .attr("id", "tooltip4");


// set the ranges
var x = d3.scaleLinear().rangeRound([0, width]);
var y = d3.scaleLinear().rangeRound([0, height]);


// get data from csv
let AllMovieInfo = [];
d3.queue()
  .defer(d3.csv, "data/imdb250.csv")
  .defer(d3.csv, "data/boxoffice.csv")
  .await(ready);

// once data is fetched, then do stuff
function ready(error, imdb, giants, oscars){
  let movies = imdb;

  if (error) throw error;

  let oldestYear = 1960;
  movies.forEach(function(d){

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
  });

  // Scale the data's range
  let maxY = 80;
  // let maxY = d3.max(movies, function(d) { return d.PerFRevenue; });
  x.domain([1962, 2017]);
  y.domain([80, 0]);

// Making the scatterplot
  let logscale = 10000000;
  let tooltipLeft = (d) => 200 + margin.left + d.AYear;
  let tooltipTop = (d) => 50 + margin.top + height - (height * d.PerFRevenue/maxY);
  let spaceTop = 28;
  let tooltipTop2 = (d) => spaceTop + tooltipTop(d);
  let tooltipTop3 = (d) => spaceTop + tooltipTop2(d);
  let tooltipTop4 = (d) => -5 + spaceTop + tooltipTop3(d);

  // color function
  let color1 = d3.scaleLinear().domain([1960, 2017]).range(["red", "blue"]);


  svg.selectAll("circle")
  .data(movies)
  .enter()
  .append("circle")
  .attr("r", function(d) { return(Math.log(d.WWBO/logscale) * 4); })
  .attr("cx", function(d) { return (d.AYear); })
  .attr("cy", function(d) { return height - (d.PerFRevenue/maxY * height); })
  .style('fill', (d) => color1(d.Year))
  .style("fill-opacity", 0.5)
  .on('mouseover', (d) => {
    tooltip.transition()
      .duration(100)
      .style("z-index", 5)
      .style('opacity', .9);
    tooltip2.transition()
      .duration(100)
      .style("z-index", 5)
      .style('opacity', .9);
    tooltip3.transition()
      .duration(100)
      .style("z-index", 5)
      .style('opacity', .9);
    tooltip4.transition()
      .duration(100)
      .style("z-index", 5)
      .style('opacity', .9);


    let tooltip2Data = function(e) {
      if (e > 1000000000 ) return `${round(e/1000000000, 2)} B`;
      else if (e > 1000000) return `${round(e/1000000, 2)} mil`;
      else return `${round(e/1000, 2)} Thousand`;
    };
    tooltip.text(`${d.Movie} (${d.Year})`)
      .style("width", "100")
      // .style("text-overflow", "ellipsis")
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop(d)}px`)
      .style("padding", "5px")
      .style("font-weight", "700")
      .style("font-size", "20px")
      .style("text-decoration", "underline")
      .style("background", "white");
    tooltip2.text(`Foreign BO: $${tooltip2Data(d.ForBO)}`)
      .style("min-weight", "200px")
      .style("padding", "5px")
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop2(d) + 3}px`)
      .style("background", "white");
    tooltip3.text(`Total BO: $${tooltip2Data(d.WWBO)}`)
      .style("padding", "5px")
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop3(d)}px`)
      .style("background", "white");
    tooltip4.text(`Percent from Foreign: `)
      .style("padding", "5px")
      .style("position", "absolute")
      .style('left', `${tooltipLeft(d)}px`)
      .style('top', `${tooltipTop4(d)}px`)
      .style("background", "white")
      .append("text")
      .text(`${round(d.PerFRevenue,2)}%`)
      .style("font-weight", "700")
      .style("font-size", "20px");

  })
  .on('mouseout', () => {
    tooltip.transition()
    .duration(400)
    .style("z-index", -2)
    .style('opacity', 0);
    tooltip2.transition()
    .style("z-index", -2)
    .duration(400)
    .style('opacity', 0);
    tooltip3.transition()
    .style("z-index", -2)
    .duration(400)
    .style('opacity', 0);
    tooltip4.transition()
    .style("z-index", -2)
    .duration(400)
    .style('opacity', 0);
  });



  // Add the X Axis
  svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .append("text")
      .attr("fill", "black")
      .attr("text-anchor", "start")
      .attr("x", "1em")
      .attr("y", "2.5em")
      .style("font-size", "18px")
      .style("font-family", "Roboto")
      .text("Year Released");

  // Add the Y Axis
  svg.append("g")
      .attr("class", "axisLeft")
      .call(d3.axisLeft(y).ticks(10, "s"));

  // Spacing out the Y Axis Label
  let xAxisTopText = -55;
  let yAxisTopText1 = -45;
  let yAxisTopText2 = yAxisTopText1 + 15;
  let yAxisTopText3 = yAxisTopText2 + 15;
  svg.append("g")
      .attr("class", "text1")
      .append("text")
      .text("%")
      .attr("class", "yAxisText1")
      .attr("x", `${xAxisTopText}`)
      .attr("y", `${yAxisTopText1}px`)
      .attr("stroke");
  svg.append("g")
      .attr("class", "text2")
      .append("text")
      .text("Gross Box Office")
      .attr("class", "yAxisText2")
      .attr("x", `${xAxisTopText}`)
      .attr("y", `${yAxisTopText2}px`)
      .attr("stroke");
  svg.append("g")
      .attr("class", "text3")
      .append("text")
      .text("from Foreign Markets")
      .attr("class", "yAxisText3")
      .attr("x", `${xAxisTopText}`)
      .attr("y", `${yAxisTopText3}px`);



  d3.selectAll("input").on("change", function(){
    movies = {};
    let result = d3.select("input[type=radio]:checked").node().value;
    console.log(result);
    if (result === "oscars") {movies = oscars;}
    else if (result === "giants") {movies = giants;}
    else {movies = imdb;}
    console.log(movies);

    movies.forEach(function(d){
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

      d.AYear = (d.Year - oldestYear) / ((2017 - oldestYear)/width);


      if (d.Movie === ""){
        d.Year = 2030;
        d.WWBO = logscale;
        d.DomBO = 0;
        d.ForBO = 0;
        d.PerFRevenue = 0;
        d.AYear = -5;
      }
  });


  let minX = d3.min(movies, function(d) { return d.Year; });
  if (minX < 1960){ minX = 1960;}
  color1 = d3.scaleLinear().domain([minX, 2017]).range(["red", "blue"]);

  svg.selectAll("circle")
      .data(movies)
      .transition()
      .duration(1000)
      .delay(function(d, i){return i / movies.length * 500;})
      .attr("r", function(d) {
        return(Math.log(d.WWBO/logscale) * 4); })
      .attr("cx", function(d) {
        return d.AYear; })
      .attr("cy", function(d) {

        return height - (d.PerFRevenue/maxY * height); })
      .style('fill', (d) => color1(d.Year));

    // set the ranges
    // x = d3.scaleLinear().domain([minX, 2017]).range([0, width]).ticks();
    // y = d3.scaleLinear().domain([maxY, 0]).rangeRound([0, height]).ticks();
    //
    // svg.select("#xAxis").transition().duration(1000).call(d3.axisBottom(x));
    // svg.select("#axisLeft").transition().duration(1000).call(d3.axisLeft(y));
  });





}
