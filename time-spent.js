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
			"header":   {
				"title":                {
					"text":     "Your time spent on the web.",
					"fontSize": 24,
					"font":     "open sans"
				},
				"subtitle":             {
					"text":     "A pie chart representing your time spent on the web.",
					"color":    "#999999",
					"fontSize": 12,
					"font":     "open sans"
				},
				"titleSubtitlePadding": 9
			},
			"footer":   {
				"color":    "#999999",
				"fontSize": 10,
				"font":     "open sans",
				"location": "bottom-left"
			},
			"size":     {
				"canvasWidth":    590,
				"pieOuterRadius": "90%"
			},
			"data":     {
				"sortOrder": "value-desc",
				"content":   res
			},
			"labels":   {
				"outer":      {
					"pieDistance": 32
				},
				"inner":      {
					"hideWhenLessThanPercentage": 3
				},
				"mainLabel":  {
					"fontSize": 11
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
			"tooltips": {
				"enabled": true,
				"type":    "placeholder",
				"string":  "{value} minutes on {label}."
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
	}
});