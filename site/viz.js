const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const RADIUS = 5;
const MAXRADIUS = 50;

var GPAformat = d3.format(".2f");

var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

function bubbleChart() {
	// location to centre the bubbles
	const centre = {
		x: WIDTH / 2,
		y: HEIGHT / 2
	};

	//TODO: Show final stage, not simulation progress (see https://bl.ocks.org/Kcnarf/6a0b4488bc60ea61eb887bf4d1f9b2b5)
	// strength to apply to the position forces
	const forceStrength = 0.03;

	// these will be set in createNodes and chart functions
	let svg = null;
	let bubbles = null;
	let labels = null;
	let nodes = [];

	// charge is dependent on size of the bubble, so bigger towards the middle
	function charge(d) {
		return Math.pow(d.radius, 2.0) * 0.01
	}

	// create a force simulation and add forces to it
	const simulation = d3.forceSimulation()
		.force('charge', d3.forceManyBodyReuse().strength(charge))
		// .force('center', d3.forceCenter(centre.x, centre.y))
		.force('x', d3.forceX().strength(forceStrength).x(centre.x))
		.force('y', d3.forceY().strength(forceStrength).y(centre.y))
		.force('collision', d3.forceCollide().radius(d => d.radius + 1));

	// force simulation starts up automatically, which we don't want as there aren't any nodes yet
	simulation.stop();

	// set up colour scale
	const GPAColour = d3.scaleSequential(d3.interpolateViridis)

	// data manipulation function takes raw data from csv and converts it into an array of node objects
	// each node will store data and visualisation values to draw a bubble
	// rawData is expected to be an array of data objects, read in d3.csv
	// function returns the new node array, with a node for each element in the rawData input
	function createNodes(rawData) {
		// use max size in the data as the max in the scale's domain
		// note we have to ensure that size is a number
		const maxSize = d3.max(rawData, d => +d['Total Grades']);

		// size bubbles based on area
		const radiusScale = d3.scaleSqrt()
			.domain([0, maxSize])
			.range([0, MAXRADIUS])

		// use map() to convert raw data into node data
		const myNodes = rawData.map(d => ({
			...d,
			//   radius: radiusScale(+d['Total Grades']),
			radius: RADIUS,
			x: Math.random() * WIDTH,
			y: Math.random() * HEIGHT
		}))

		return myNodes;
	}

	// main entry point to bubble chart, returned by parent closure
	// prepares rawData for visualisation and adds an svg element to the provided selector and starts the visualisation process
	let chart = function chart(selector, rawData) {
		// convert raw data into nodes data
		nodes = createNodes(rawData);

		// create svg element inside provided selector
		svg = d3.select(selector)
			.append('svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT)

		// bind nodes data to circle elements
		const elements = svg.selectAll('.bubble')
			.data(nodes, d => d.id)
			.enter()
			.append('g')

		bubbles = elements
			.append('circle')
			.classed('bubble', true)
			.attr('r', d => d.radius)
			.attr('fill', d => GPAColour(map_range(d['Average GPA'], 0, 4, 0, 0.9)))
			.on("mouseover", function (d) {
				tooltip.transition()
					.duration(200)
					.style("opacity", .8);
				tooltip.html(
					"<b>" + d.Course + "</b>" + "<br/>" + 
					"Average GPA: " + GPAformat(d['Average GPA']) + "<br/>" + 
					"Department: " + d['Department Name'] + "<br/>" + 
					"School: " + d['School'] 	
					).style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

		// labels
		// labels = elements
		// 	.append('text')
		// 	.attr('dy', '.3em')
		// 	.style('text-anchor', 'middle')
		// 	.style('font-size', 10)c
		// 	.text(d => d['Course'])

		// set simulation's nodes to our newly created nodes array
		// simulation starts running automatically once nodes are set
		simulation.nodes(nodes)
			.on('tick', ticked)
			.restart();
	}

	// callback function called after every tick of the force simulation
	// here we do the actual repositioning of the circles based on current x and y value of their bound node data
	// x and y values are modified by the force simulation
	function ticked() {
		bubbles
			.attr('cx', d => d.x)
			.attr('cy', d => d.y)

		// labels
		// 	.attr('x', d => d.x)
		// 	.attr('y', d => d.y)
	}

	// return chart function from closure
	return chart;
}

// new bubble chart instance
let myBubbleChart = bubbleChart();

// function called once promise is resolved and data is loaded from csv
// calls bubble chart function to display inside #vis div
function display(data) {
	myBubbleChart('#vis', data);
}

// load data
d3.csv('course_gpa_16_to_18_cleaned.csv').then(display);