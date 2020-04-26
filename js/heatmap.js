var refreshTime;
var jsonData;

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	//name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

setInterval(getParameterByName, 1000);

jsonData = getParameterByName('jsonData');
refreshTime = getParameterByName('refreshTime');

if (refreshTime != null && refreshTime != undefined) {
	refreshTime = refreshTime * 1000;
} else {
	refreshTime = 1000;
}

function update_data() {
	var dats = JSON.parse(jsonData);
	var orgsCount = dats.length;
	
	for (var i = 0; i < orgsCount; i++) {
		var org = dats[i];
		var orgToken = org.orgToken;
		var orgId = org.orgId;
		
		var devices = org.devices;
		var deviceCount = org.devices.length;
		
		for (var j = 0; j < deviceCount; j++) {
			var device = devices[j];
			var devType = device.dev_type;
			var devId = device.dev_id;
			var device_uuid = devType + '_' + devId;
			
			$.ajax({
				url: 'https://developer-apis.awair.is/v1/orgs/' + orgId + '/devices/' + devType + '/' + devId + '/air-data/latest',
				type: 'GET',
				async: false,
				dataType: 'json',
				success: function(json) {
					if (device_uuid != null) {
						console.log(device_uuid);
						var classes = document.getElementById(device_uuid);
						
						var data = json.data[0];
						var score = data.score;
						var timestamp = data.timestamp;
						timestamp = Date.parse(timestamp);
						var timenow = new Date();
						timenow = Date.parse(timenow);
						var timediff = Math.floor((timenow - timestamp) / 1000); // in seconds
						console.log('uuid: ' + device_uuid + ' score: ' + score + ' timestamp: ' + timestamp + ' time now: ' + timenow + ' time diff: ' + timediff);
						
						
						if (timediff > 60) {
							console.log('disconnected');
							classes.classList.remove("green");
							classes.classList.remove("amber");
							classes.classList.remove("red");
							classes.classList.remove("grey");
							classes.classList.add("disconnected");
						} else if (score >= 80) {
							console.log('80+');
							classes.classList.remove("amber");
							classes.classList.remove("red");
							classes.classList.remove("disconnected");
							classes.classList.remove("grey");
							classes.classList.add("green");
						} else if (score >= 60) {
							console.log('60+');
							classes.classList.remove("green");
							classes.classList.remove("red");
							classes.classList.remove("disconnected");
							classes.classList.remove("grey");
							classes.classList.add("amber");
						} else if (score >= 0) {
							console.log('60-');
							classes.classList.remove("green");
							classes.classList.remove("amber");
							classes.classList.remove("disconnected");
							classes.classList.remove("grey");
							classes.classList.add("red");
						} else {
							console.log('error!');
							classes.classList.remove("green");
							classes.classList.remove("amber");
							classes.classList.remove("red");
							classes.classList.remove("disconnected");
							classes.classList.add("grey");
						}
					} else {
						console.log('null');
					}
				},
				error: function(request) {
					console.log(request.responseText);
				},
				beforeSend: setHeader
			});
			
			function setHeader(xhr) {
				xhr.setRequestHeader('Authorization', 'Bearer ' + orgToken);
			}
		}
	}
}

setInterval(update_data, refreshTime);