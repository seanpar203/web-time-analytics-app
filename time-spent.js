$(() => {
	const baseUrl = 'http://localhost:5000/api';
	let token = localStorage.getItem('WTA_TOKEN');

	if (token != null) {
		getTodaysTimeSpent();
	}
	else if (token == null) {
		chrome.extension.sendMessage(
			{request: 'token'}, res => {
				token = res.token;
				localStorage.setItem('WTA_TOKEN', res.token);
				getTodaysTimeSpent();
			});
	}

	function getTodaysTimeSpent() {
		$.ajax({
			method:  'GET',
			url:     baseUrl + '/time',
			headers: {'Authorization': token},
			success: handleSucces,
			error:   (err) => console.log(err)
		});
	}

	function handleSucces(res) {
		const pie = new d3pie("pieChart", {
			"size":     {
				"canvasWidth": 300,
				"canvasHeight": 300,
				"pieOuterRadius": "100%"
			},
			"data":     {
				"sortOrder": "value-desc",
				"content":   res.data
			},
			"labels":   {
				"outer":      {
					"pieDistance": 32
				},
				"inner":      {
					"hideWhenLessThanPercentage": 3
				},
				"mainLabel":  {
					"fontSize": 12
				},
				"percentage": {
					"color":         "#ffffff",
					"decimalPlaces": 0
				},
				"value":      {
					"color":    "#adadad",
					"fontSize": 11
				},
				"lines":      {
					"enabled": true
				},
				"truncation": {
					"enabled": true
				}
			},
			"effects":  {
				"pullOutSegmentOnClick": {
					"effect": "linear",
					"speed":  400,
					"size":   8
				}
			},
			"misc":     {
				"gradient": {
					"enabled":    true,
					"percentage": 100
				}
			}
		});

		let total_elapsed = 0;
		res.data.forEach(data => total_elapsed += data.value);

		res.data.forEach(data => {
			$('tbody').append(
				'<tr>' +
					'<td style="background-color: '+ data.color +'">'+ '</td>'+
					'<td>' + data.label + '</td>' +
					'<td>' + Math.round(data.value / 60) + '</td>'+
					'<td>' + Math.round(data.value / total_elapsed * 100) + '</td>'+
				'</tr>'
			)
		})
	}
});