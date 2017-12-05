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

const tooltip = d3.select("body")
                  .append("div")
                  .attr("id", "tooltip");


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
  x.domain([1963, 2017]);
  y.domain([maxY, 0]);

// Making the scatterplot
  let logscale = 10000000;
  console.log(AllMovieInfo);
  svg.selectAll("circle")
  .data(movies)
  .enter()
  .append("circle")
  .attr("r", function(d) { return(Math.log(d.WWBO/logscale) * 20); })
  .attr("cx", function(d) { return (d.AYear); })
  .attr("cy", function(d) { return height - (d.PerFRevenue/maxY * height); })
  .style('fill', (d) => d.PerFRevenue > 20 ? '#225FC1' : '#C13522')
  .on('mouseover', (d) => {
    tooltip.transition()
      .duration(100)
      .style('opacity', .9);
    tooltip.text(`Ranking: ${d.Place} - ${d.Name} - Year ${d.Year} - Time: ${d.Time}`)
      .style('left', `${d3.event.pageX + 2}px`)
      .style('top', `${d3.event.pageY - 18}px`);
  })
  .on('mouseout', () => {
    tooltip.transition()
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




// How about this





// var xValue = function(d) { return d.Year; },
//     xScale = d3.scaleLinear().range([0, width]),
//     xMap = function(d) { return xScale(xValue(d));},
//     xAxis = d3.svg.axis().scale(xScale).orient("bottom");
//
// var yValue = function(d) { return d.WWBO; },
//     yScale = d3.scaleLinear().range([height, 0]),
//     yMap = function(d) { return yScale(yValue(d));},
//     yAxis = d3.svg.axis().scale(yScale).orient("left");
//
// var tooltip = d3.select("#plot")
//                 .append("div")
//                 .attr("class", "tooltip")
//                 .style("opacity, 0");
//
// // load data
// let AllMovieInfo = {};
// d3.queue().defer(d3.csv, "data/imdb250.csv").await(ready);
//
//
// function ready(error, movies){
//   if (error) throw error;
//
//   let WWBObyMovie = {};
//   movies.forEach(function(d){
//     d.Year = Number(d.Year);
//     d.WWBO = Number(d.WWBO);
//     WWBObyMovie[d.Movie] = Number(d.WWBO);
//     AllMovieInfo[d.Movie] = d;
//     AllMovieInfo[d.Movie].Year = Number(d.Year);
//   });
//   xScale.domain([d3.min(movies, xValue)-1, d3.max(movies, xValue)+1]);
//   yScale.domain([d3.min(movies, yValue)-1, d3.max(movies, yValue)+1]);
//
// // x-axis
// svg.append("g")
//     .attr("class", "x-axis").attr("transform", "translate(0," + height + ")")
//     .call(xAxis)
//     .append("text")
//     .attr("class", "label")
//     .attr("x", width)
//     .attr("y", -6)
//     .style("text-anchor", "end")
//     .text("Years");
//
// // y-axis
// svg.append("g")
//     .attr("class", "y axis")
//     .call(yAxis)
//   .append("text")
//     .attr("class", "label")
//     .attr("transform", "rotate(-90)")
//     .attr("y", 6)
//     .attr("dy", ".71em")
//     .style("text-anchor", "end")
//     .text("WWBO");
//
// //draw dots
// svg.selectAll(".dot")
//       .data(movies)
//     .enter().append("circle")
//       .attr("class", "dot")
//       .attr("r", 3.5)
//       .attr("cx", xMap)
//       .attr("cy", yMap)
//       .on("mouseover", function(d) {
//           tooltip.transition()
//                .duration(200)
//                .style("opacity", .9);
//           tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d)
// 	        + ", " + yValue(d) + ")")
//                .style("left", (d3.event.pageX + 5) + "px")
//                .style("top", (d3.event.pageY - 28) + "px");
//       })
//       .on("mouseout", function(d) {
//           tooltip.transition()
//                .duration(500)
//                .style("opacity", 0);
//       });
// }




// d3.csv("data/imdb250.csv", titles => {
//   console.log("titles:", titles);
//   let data = titles.map(function(d){
//     console.log("d", d);
//     let t = d.Movie;
//     console.log("Title:", t);
//   });
//   console.log("HELLOOOOOOOO");
//   console.log(titles[0]);
//   console.log(titles[0].Movie);
//   var movt = titles[0].Movie;
// });
//
//
//   function component() {
//     var movieslist = document.createElement('ul');
//     movieslist.innerHTML = _.join(['Hello', 'webpackiuerhgjoietbj'], ' ');
//     let p = document.createElement("li");
//     console.log("THEEEEEEEEEE");
//     console.log(movieTitle());
//     p.innerHTML = movt;
//     document.body.appendChild(p);
//
//   }

  // document.body.appendChild(component());
