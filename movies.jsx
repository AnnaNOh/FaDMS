import * as d3 from "d3";
import _ from 'lodash';

d3.csv("data/imdb250.csv", titles => {
  console.log("titles:", titles);
  let data = titles.map(function(d){
    console.log("d", d);
    let t = d.Movie;
    console.log("Title:", t);
  });
  console.log("HELLOOOOOOOO");
  console.log(titles[0]);
  console.log(titles[0].Movie);
  var movt = titles[0].Movie;
});


  function component() {
    var movieslist = document.createElement('ul');
    movieslist.innerHTML = _.join(['Hello', 'webpackiuerhgjoietbj'], ' ');
    let p = document.createElement("li");
    console.log("THEEEEEEEEEE");
    console.log(movieTitle());
    p.innerHTML = movt;
    document.body.appendChild(p);

  }

  // document.body.appendChild(component());
  movieTitle();
  component();
