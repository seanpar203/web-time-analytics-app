$(() => {
	/** Sensible Constants */
	const baseUrl = 'http://localhost:5000/api';
	const sendMsg = chrome.extension.sendMessage;
	let token = localStorage.getItem('WTA_TOKEN');
	let totalElapsed = 0;
	var trends = [];

	/**
	 * Fetch users time spent today.
	 */
	function getTodaysTimeSpent() {
		$.ajax({
			method:  'GET',
			url:     baseUrl + '/time',
			headers: {'Authorization': token},
			success: handleSucces,
			error:   (err) => console.log(err)
		});
	}

	/**
	 * getTodaysTimeSpent Success callback.
	 * @param res
	 */
	function handleSucces(res) {
		// Get static json for creating pie chart.
		d3.json('assets/data/pie.json', (err, pieData) => {

			// Attach Dynamic data to content.
			pieData.data.content = res.data;
			const pie = new d3pie("pieChart", pieData);
		});

		// Create Table, Update Header.
		createTable(res.data);
		updateHeader();
	}

	/**
	 * Create a bootstrap table with dynamic data.
	 * @param {Array} data - array of time objects.
	 */
	function createTable(data) {
		// Total amount spent from data.
		data.forEach(time => totalElapsed += time.value);

		// Create rows.
		data.forEach(time => {
			$('tbody')
				.append(
					'<tr>' +
						'<td class="collapsing">'+
							'<div class="ui fitted slider checkbox">'+
								'<input style=background-color:' + time.color +'!important;'+'color:' + time.color + '!important' + ' type="checkbox" value='+ time.label + '>'+
								'<label style=background-color:' + time.color +'!important;'+'color:' + time.color + '!important' + '>' + '</label>'+
							'</div>' +
						'</td>'+
							'<td class="color" style=background-color:' + time.color + '>' + '</td>' +
							'<td class="website">' + time.label + '</td>' +
							'<td class="time">' + calcTime(time.value).string() + '</td>' +
						'<td class="percent">' + Math.round(time.value / totalElapsed * 100) + '</td>' +
					'</tr>'
				)
		});

		// Fade in Table.
		$('.table').fadeIn(1000);
	}


	/** Update and fade in header */
	function updateHeader() {
		$('#total-time').html(calcTime(totalElapsed).string());
		$('header').fadeIn(1000);
	}

	/**
	 * Helper to return data & string format of time spent.
	 * @param time
	 * @returns {{lgName: *, lgAmnt: *, smName: *, smAmnt: *, string: string}}
	 */
	function calcTime(time) {
		/** Attributes. */
		let float;
		let lgName;
		let smName;

		let lgAmnt;
		let smAmnt;

		/** Calculates Hours & Minutes */
		const calcHours = () => {
			lgName = 'Hours';
			smName = 'Minutes';

			float = (time / 60 / 60).toFixed(2);
			lgAmnt = Math.floor(time / 60 / 60);
			smAmnt = Math.round(float.split('.')[1] * 60 / 100);
		};

		/** Calculates Minutes & Seconds. */
		const calcMinutes = () => {
			lgName = 'Minutes';
			smName = 'Seconds';

			float = (time / 60).toFixed(2);
			lgAmnt = Math.floor(time / 60);
			smAmnt = Math.round(float.split('.')[1] * 60 / 100);
		};

		/** Returns string format of calc results. */
		const string = () => {
			return `${lgAmnt} ${lgName}, ${smAmnt} ${smName}`
		};

		/** Kick Off Conditional. */
		time >= 3600 ? calcHours() : calcMinutes();

		/** Return calculated results. */
		return {
			lgName,
			lgAmnt,
			smName,
			smAmnt,
			string,
		};
	}


	$('table').click(event => {
		if (event.target.value !== undefined) {
			let hostName = event.target.value;
			let hostColor = event.target.style.color;
			let overlay = $('#trends-overlay');

			if (trends.find(trend => trend.host == hostName)) {
				trends.filter(trend => trend.host !== hostName);
				$('.trends').remove();
				createTrends(trends);
				overlay.animate({width: '747px'}, 0);
				overlay.animate({width: '0'}, 2000);
			} else {
				$.ajax({
					method:  'GET',
					url:     baseUrl + `/time/${hostName}`,
					headers: {'Authorization': token},
					success: res => {
						res.data.forEach(trend => {
							trend.color = hostColor;
							trends.push(trend);
						});
						$('.trends').remove();
						createTrends(trends);
						overlay.animate({width: '747px'}, 0);
						overlay.animate({width: '0'}, 2000);
					}
				})
			}
		}
	});

	// Get the data
	function createTrends(data) {
		data = data.map(d => Object.assign({}, d));

		// Set the dimensions of the canvas / graph
		var margin = {top: 30, right: 20, bottom: 70, left: 50},
		    width  = 800 - margin.left - margin.right,
		    height = 400 - margin.top - margin.bottom;

		// Parse the date / time
		var parseDate = d3.time.format("%Y-%m-%d").parse;

		// Set the ranges
		var x = d3.time.scale().range([0, width]);
		var y = d3.scale.linear().range([height, 0]);

		// Define the axes
		var xAxis = d3.svg.axis().scale(x)
			.orient("bottom").ticks(5);

		var yAxis = d3.svg.axis().scale(y)
			.orient("left").ticks(5);

		// Define the line
		var priceline = d3.svg.line()
			.x(function (d) {
				return x(d.date);
			})
			.y(function (d) {
				return y(d.time);
			});

		// Adds the svg canvas
		var svg = d3.select("#trends")
			.append("svg")
			.attr('class', 'trends')
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

		data.forEach(function (d) {
			d.date = parseDate(d.date);
			d.time = +d.time;
		});

		// Scale the range of the data
		x.domain(d3.extent(data, function (d) {
			return d.date;
		}));
		y.domain([0, d3.max(data, function (d) {
			return d.time;
		})]);

		// Nest the entries by host
		var dataNest = d3.nest()
			.key(d =>  d.host)
			.entries(data);

		var legendSpace = width / dataNest.length; // spacing for the legend

		// Loop through each host / key
		dataNest.forEach(function (d, i) {
			console.log(d.values[i]);

			svg.append("path")
				.attr("class", "line")
				.style("stroke", d.values[i].color)
				.attr("id", 'tag' + d.key.replace(/\s+/g, '')) // assign ID
				.attr("d", priceline(d.values));

			// Add the Legend
			svg.append("text")
				.attr("x", (legendSpace / 2) + i * legendSpace)  // space legend
				.attr("y", height + (margin.bottom / 2) + 5)
				.attr("class", "legend")    // style the legend
				.style("fill", d.values[i].color)
				.on("click", function () {
					// Determine if current line is visible
					var active     = d.active ? false : true,
					    newOpacity = active ? 0 : 1;
					// Hide or show the elements based on the ID
					d3.select("#tag" + d.key.replace(/\s+/g, ''))
						.transition().duration(100)
						.style("opacity", newOpacity);
					// Update whether or not the elements are active
					d.active = active;
				})
				.text(d.key);

		});

		// Add the X Axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// Add the Y Axis
		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis);

	}

		if (token != null) {
		getTodaysTimeSpent();
	}

	else if (token == null) {
		sendMsg({request: 'token'}, res => {
			token = res.token;
			localStorage.setItem('WTA_TOKEN', res.token);
			getTodaysTimeSpent();
		});
	}

});