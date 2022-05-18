const d3 = require('d3/dist/d3');

(async function drawPieChart() {
  const rawData = await d3.csv('./data/scholarships.csv');

  console.log('raw data:');
  console.table(rawData);

  const segmented = {
    winners: [],
    runnerUps: [],
    submittedNotSelected: [],
    notSubmitted: [],
  };

  rawData.forEach((row) => {
    if (row['nom status'] === 'winner') {
      segmented.winners.push(row);
    } else if (row['nom status'] === 'runner-up') {
      segmented.runnerUps.push(row);
    } else if (row['Application State'] === 'pending review') {
      segmented.submittedNotSelected.push(row);
    } else {
      segmented.notSubmitted.push(row);
    }
  });

  // create an array of the 4 slices, each one should have a type, $ awarded, and amount property
  const pieChartData = Object.keys(segmented).map((key) => {
    const totalAwarded = segmented[key].reduce(
      (prev, curr) => prev + parseInt(curr.awarded),
      0
    );

    return {
      type: key,
      count: segmented[key].length,
      totalAwarded: totalAwarded || 0,
    };
  });

  console.log('grouped data for pie chart:', pieChartData);

  const countAccessor = (d) => d.count;

  let dimensions = {
    width: window.innerWidth,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  };
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw canvas
  const wrapper = d3
    .select('#viz-wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const radius = Math.min(dimensions.width, dimensions.height) / 2;
  const g = wrapper
    .append('g')
    .attr(
      'transform',
      'translate(' + dimensions.width / 2 + ',' + dimensions.height / 2 + ')'
    );

  const color = d3.scaleOrdinal(['#00B0CA', '#008498', '#005865', '#002C33']);

  const pie = d3.pie().value(countAccessor);

  const label = d3
    .arc()
    .outerRadius(radius)
    .innerRadius(radius - 80);

  var arc = d3.arc().innerRadius(0).outerRadius(radius);

  var arcs = g
    .selectAll('arc')
    .data(pie(pieChartData))
    .enter()
    .append('g')
    .attr('class', 'arc');

  arcs
    .append('path')
    .attr('fill', function (d, i) {
      return color(i);
    })
    .attr('d', arc);

  arcs
    .append('text')
    .attr('transform', function (d) {
      return 'translate(' + label.centroid(d) + ')';
    })
    .classed('white-text', true)
    .text(function (d) {
      return d.data.count;
    });

  // TODO: add tooltips when hovering on each slice that shows total $ awarded to that group of students
})();
