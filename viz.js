const WIDTH = Math.min(window.innerWidth, 800);
const HEIGHT = window.innerHeight;
const RADIUS = 5;
const MAXRADIUS = 50;

let dataset
let simulation, bubbles
let GPAScale
let numClusters = 14
let reachedBottom = 0
const schools = [
	// 'Public Health',
	// 'Ross School of Business',
	'Stamps School of Art & Design',
	'Architecture & Urban Planning',
	'Literature, Science & the Arts',
	// 'Music, Theatre & Dance',
	'Kinesiology', 
	'Engineering',
	'Education', 
	'Nursing',
	// 'Natural Resources&Environment', 
	// 'Environment and Sustainability',
	'Public Policy', 
	'Information'
]
const schoolAvg = {
	'Architecture & Urban Planning': 3.5584990044120857,
	'Education': 3.8681669877118563,
	'Engineering': 3.5493613448375436,
	'Environment and Sustainability': 3.5189711368096965,
	'Information': 3.779558013537409,
	'Kinesiology': 3.5605761693371702,
	'Literature, Science & the Arts': 3.52177033959189,
	'Music, Theatre & Dance': 3.744882411623254,
	'Natural Resources&Environment': 3.7578590553477054,
	'Nursing': 3.7311339450520067,
	'Public Health': 3.765492059356589,
	'Public Policy': 3.751433236656947,
	'Ross School of Business': 3.552511097723705,
	'Stamps School of Art & Design': 3.6153362718334026
}

const school_colors = ["#ffcc00", "#ff6666", "#66cccc", "#f688bb", "#65587f", "#baf1a1", "#5c3f3f", "#75b79e", "#cc0066", "#9de3d0", "#0c7b93", "#cf9ec1", "#baf1a1", "#9399ff"]
const schoolColor = d3.scaleOrdinal(schools, school_colors)
// const schoolSymbols = d3.scaleOrdinal().range(d3.symbols)
const GPAColor = d3.scaleSequential(d3.interpolateViridis)

var yAxisScale = d3.scalePoint()
		.domain(schools)
		.range([100, HEIGHT - 100]);

var GPAformat = d3.format(".2f");

// load data
d3.csv('course_gpa_16_to_18_filtered.csv').then(
	data => {
		let maxSize = 8000; //TODO: fix hardcode
		let radiusScale = d3.scaleSqrt()
			.domain([0, maxSize])
			.range([0, MAXRADIUS])

		dataset = data.map(d => ({
			...d,
			x: WIDTH / 2,
			y: HEIGHT / 2,
			radius: radiusScale(+d['Total Grades'])
		}))
		// dataset = dataset.slice(dataset.length - 200)

		setTimeout(drawInitial(), 100)
	});


function createSchoolLegend() {
	let legend = d3.select('#legend_school')

	legend.append('g')
		.attr('class', 'school_legend')
		.attr('transform', `translate(0,0)`)

	legend.select('g')
		.selectAll("circle")
		.data(schools)
		.enter()
		.append("circle")
		.attr("cx", 20)
		.attr("cy", function (d, i) {
			return 20 + i * 30
		}) 
		.attr("r", 7)
		.style("fill", function (d) {
			return schoolColor(d)
		})

	d3.select('.school_legend')
		.selectAll('text')
		.data(schools)
		.enter()
		.append("text")
		.attr("x", 40)
		.attr("y", function (d, i) {
			return 20 + i * 30
		}) 
		.text(function (d) {
			return d 
		})
		.style('font-size', '14px')
		.attr("text-anchor", "left")
		.style("alignment-baseline", "middle")
}

function createSchoolLegendGPA() {
	let legend = d3.select('#legend_school_gpa')

	legend.append('g')
		.attr('class', 'school_legend_gpa')
		.attr('transform', `translate(0,0)`)

	legend.select('g')
		.selectAll("circle")
		.data(schools)
		.enter()
		.append("circle")
		.attr("cx", 20)
		.attr("cy", function (d, i) {
			return 20 + i * 30
		})
		.attr("r", 7)
		.style("fill", function (d) {
			return schoolColor(d)
		})

	d3.select('.school_legend_gpa')
		.selectAll('text')
		.data(schools)
		.enter()
		.append("text")
		.attr("x", 40)
		.attr("y", function (d, i) {
			return 20 + i * 30
		})
		.text(function (d) {
			return d + " (Avg GPA: " + GPAformat(schoolAvg[d]) + ')'
		})
		.style('font-size', '14px')
		.attr("text-anchor", "left")
		.style("alignment-baseline", "middle")
}

function drawInitial() {
	GPAScale = d3.scaleLinear()
			.domain(d3.extent(dataset, d => d['Average GPA']))
			.range([MAXRADIUS*2, WIDTH - MAXRADIUS*2]);


	let svg = d3.select("#vis")
		.append('svg')
		.attr('width', WIDTH)
		.attr('height', HEIGHT)
		.attr('opacity', 1);

	let xAxis = d3.axisBottom(GPAScale)
		.tickSize(HEIGHT - MAXRADIUS*2);

	let xAxisGroup = svg.append('g')
		.attr('class', 'x-axis')
		.attr('transform', 'translate(0, '+ 50 + ')')
		.call(xAxis)
		.call(g => g.select('.domain')
			.remove())
		.call(g => g.selectAll('.tick line'))
		.attr('stroke-opacity', 0.2)
		.attr('stroke-dasharray', 2.5)

	
	// let yAxis = d3.axisLeft(yAxisScale).ticks(numClusters);
	// var gAxis = svg.append("g")
	// 	.attr("transform", "translate(250, 0)")
	// 	.attr("class", "y-axis")
	// 	.call(yAxis);

	// svg.selectAll('.tick').selectAll('text')
	// 	.style("font-size", "13px")
	// 	.style("fill", 'black')
	// 	.text(function (d) {
	// 		return d + " (Average GPA: " + GPAformat(schoolAvg[d]) + ')'
	// 	});

	// svg.selectAll('.y-axis .tick').selectAll('line').attr("opacity", 0)
	// svg.selectAll('.y-axis').selectAll('path').attr("opacity", 0)

    simulation = d3.forceSimulation(dataset)
     // Define each tick of simulation
    simulation.on('tick', () => {
     	bubbles
     		.attr('cx', d => d.x)
     		.attr('cy', d => d.y)
     })

	simulation.stop()

	// Selection of all the circles 
	bubbles = svg
		.selectAll('circle')
		.data(dataset, d => d.id)
		.enter()
		.append('circle')
			.attr('r', RADIUS)
			.attr('opacity', 0.8)
			.attr('cx', d => d.x)
			.attr('cy', d => d.y)
	 		.attr('stroke', '#4c4a37')
			.attr('stroke-width', 1)
			.attr('stroke-opacity', 0.3)

	// Tooltip mouseover and mouseout events
	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	svg.selectAll('circle')
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
		.on("mouseout", function(d) {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});

	// svg.selectAll('.cat-text')
	// 	.data(schools).enter()
	// 	.append('text')
	// 	.attr('class', 'cat-text')
	// 	.attr('opacity', 0)
	// 	.raise()

	// svg.selectAll('.cat-text')
	// 	.text(d => d + " <br> Average GPA: " + GPAformat(schoolAvg[d]))
	// 	.attr('x', MAXRADIUS)
	// 	.attr('y', (d, i) => i * HEIGHT / 15)
	// 	.attr('font-size', '14px')
	// 	.attr('font-weight', 700)
	// 	.attr('fill', 'white')
	// 	.attr('text-anchor', 'left')
	bubbleChart()

}


function clean(chartType) {
	let svg = d3.select('#vis').select('svg')
	if (chartType === "noXY") {
		svg.select('.cat-text').transition().attr('opacity', 0);
		svg.select('.x-axis').transition().attr('opacity', 0);
	}
	if (chartType === "hasXY") {
	}
}

function bubbleChart() {
	if (reachedBottom == 0) {

	//TODO: Show final stage, not simulation progress (see https://bl.ocks.org/Kcnarf/6a0b4488bc60ea61eb887bf4d1f9b2b5)

	// these will be set in createNodes and chart functions
	let svg = d3.select("#vis").select('svg')

	clean('noXY')

	d3.select('.school_legend').transition().remove()

	// convert raw data into nodes data

	// bind nodes data to circle elements

	bubbles = svg.selectAll('circle')
		.attr('r', d => RADIUS)
	bubbles
		.transition().duration(1000)
		.style('fill', d => GPAColor(mapRange(d['Average GPA'], 0, 4, 0, 0.9)))

	// create a force simulation and add forces to it
	simulation.force('charge', d3.forceManyBodyReuse().strength(0.5))
		// .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
		.force('x', d3.forceX().strength(0.03).x(WIDTH / 2))
		.force('y', d3.forceY().strength(0.03).y(HEIGHT / 2))
		.force('collision', d3.forceCollide().radius(d => RADIUS + 1))
		.alphaDecay([0.02])

	simulation.restart()
	}
}

function bubbleChart2 (){
	if (reachedBottom == 0) {
	bubbles
		.transition().duration(1000)
		.attr('r', d => d.radius);

	// charge is dependent on size of the bubble, so bigger towards the middle
	function charge(d) {
	return Math.pow(d.radius, 2.0) * 0.01
	}

	simulation.force('charge', d3.forceManyBodyReuse().strength(0.5))
		// .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
		.force('x', d3.forceX().strength(0.03).x(WIDTH / 2))
		.force('y', d3.forceY().strength(0.03).y(HEIGHT / 2))
		.force('collision', d3.forceCollide().radius(d => d.radius + 1))
	}
}

function bubbleChart3() {
	if (reachedBottom == 0) {
	bubbles
		.transition().duration(3000)
		.style("fill", function (d) {
			return schoolColor(d['School'])
		})
		.transition().duration(3000)

	createSchoolLegend();
	// setTimeout(simulation.stop(), 5000);
	}
}

function bubbleSplit (){
	d3.select('.x-axis').transition().attr('opacity', 1);
	createSchoolLegendGPA()

	bubbles
		.transition().duration(1000)
		.attr("opacity", 0.5)

	simulation.force('charge', d3.forceManyBodyReuse().strength(2))
		// .force('center', d3.forceCenter(WIDTH / 2, HEIGHT / 2))
		.force('x', d3.forceX().strength(0.03).x(WIDTH / 2))
		.force('y', d3.forceY().strength(0.03).y(HEIGHT / 2))
		.force('collision', d3.forceCollide().radius(d => d.radius + 1))

	function ticked() {
		var k = this.alpha() * 3;

		//move the nodes to their foci/cluster
		dataset.forEach(function (n, i) {
			n.y += (yAxisScale(n['School']) - n.y) * 0.25;
			n.x += (GPAScale(n['Average GPA']) - n.x) * k;
		});
		//update coordinates for the circle
		bubbles
			.attr("cx", function (d) {
				return d.x;
			})
			.attr("cy", function (d) {
				return d.y;
			});
	}

	simulation.on("tick", ticked);

	setTimeout(function(){
		simulation.stop();
		reachedBottom = 1
	}, 20000);

}

let activationFunctions = [
	bubbleChart,
	bubbleChart2,
	bubbleChart3,
	bubbleSplit
]


let scroll = scroller()
	.container(d3.select('#graphic'))
scroll()

let lastIndex, activeIndex = 0

scroll.on('active', function (index) {
	d3.selectAll('.step')
		.transition().duration(500)
		.style('opacity', function (d, i) {
			return i === index ? 1 : 0.1;
		});

	activeIndex = index
	let sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
	let scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
	scrolledSections.forEach(i => {
		activationFunctions[i]();
	})
	lastIndex = activeIndex;
})
