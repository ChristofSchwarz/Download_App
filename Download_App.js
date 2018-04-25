define( ['qlik'], 
function (qlik) {
	return {
		support : {
			snapshot: false,
			export: false,
			exportData : false
		},
		
		definition: { 
			// property panel definition
			component: 'accordion',
			items: {		
				appearance: {
					uses: "settings",
					items: {
						extensionsettings: {
							label: "This Extension",
							type: "items",
							items: [
								{
									"type": "string",
									"expression": "optional",
									"defaultValue": "Download App",
									"order": 0,
									"ref": "buttonlabel",
									"label": "Button Label"
								},
								{
									"component": "dropdown",
									"type": "string",
									"defaultValue": "left",
									"options": [
									  {
										"label": "left",
										"value": "left"
									  },
									  {
										"label": "center",
										"value": "center"
									  },
									  {
										"label": "right",
										"value": "right"
									  }
									],
									"order": 1,
									"ref": "buttonalign",
									"label": "Button Alignment"
								},
								{
									"type": "boolean",
									"expression": "optional",
									"defaultValue": false,
									"order": 2,
									"ref": "fullwidth",
									"label": "Button 100% width"
								}
							]							
						}					
					}					
				},
				about: {
					label: "About",
					type: "items",
					items: {
						authorText: {
							label: "by Christof Schwarz",
							component: "text"
						}
					}
				}
			}
		},		
		
		paint: function ($element, layout) {
			
			var ownId = this.options.id;
			var app = qlik.currApp(this); 		
			var title = app.model.layout.qTitle + '.qvf';
			var vproxy = app.model.session.sessionConfig.prefix;
			vproxy = vproxy.length==0?'/':vproxy;   
			//console.log('vproxy prefix: ' + vproxy);
			
			// create button with LeonardoUI, label & style it according to settings
			var html = '<div style="text-align:' + layout.buttonalign + ';">';
			html += '<button class="lui-button" data-cmd="exportbtn' + ownId + '" ';
			html += layout.fullwidth?'style="width:100%;">':'>';
			html += layout.buttonlabel + '</button>';
			html += '</div>';
			$element.html(html);
			
			// catch click-event of button
 			$element.find('button').on('qv-activate', function() {
				if ($(this).data('cmd') == 'exportbtn' + ownId)  {

					var endpoint1 = vproxy + 'qrs/app/' + app.id + '/export';
					console.log('QRS Endpoint1: ' + endpoint1);
					var xhr1 = new XMLHttpRequest();
					xhr1.open('GET', endpoint1 +   '?xrfkey=j5lmn0246cd3f8h1');
					xhr1.setRequestHeader('x-Qlik-Xrfkey', 'j5lmn0246cd3f8h1');
					xhr1.responseType = 'text';
					xhr1.onload = function(reply1) {

						var resp = reply1.target.response;	
						var ticket;
						try {
        					ticket = (JSON.parse(resp)).value;
							// console.log ('Ticket for download: ' + ticket);					
							var endpoint2 = vproxy + 'qrs/download/app/' + app.id + '/' + ticket + '/' + encodeURIComponent(title);
							console.log('QRS Endpoint2: ' + endpoint2);
							var xhr2 = new XMLHttpRequest();
							xhr2.open('GET', endpoint2 +   '?xrfkey=4b8d3f8h1j5lmn02', true);
							xhr2.setRequestHeader('x-Qlik-Xrfkey', '4b8d3f8h1j5lmn02');
							xhr2.setRequestHeader('Content-type', 'application/octet-stream');
							xhr2.responseType = 'blob';
							xhr2.onload = function() {
								var blob = new Blob([this.response], {type: 'application/octet-stream'});

								if (window.navigator && window.navigator.msSaveBlob) { // for IE
									console.log('IE download of ' + title);
									window.navigator.msSaveBlob(blob, encodeURIComponent(title));		
								} else { // for Non-IE (chrome, firefox etc.)
									console.log('Non-IE download of ' + title);						
									var blob = new Blob([this.response], {type: 'application/octet-stream'});
									var downloadUrl = window.URL.createObjectURL(blob);
									var a = document.createElement('a');
									a.href = downloadUrl;
									a.download = title;
									$element.append(a);  // temporarily create an a-tag, click it, remove it
									a.click();
									a.remove();
								}
							}
							xhr2.send();

    					} catch (err) {
        					alert('Error: ' + resp);
    					}
					}
					xhr1.send();			
				}
			})
			
			//needed for export
			return qlik.Promise.resolve();	
		}
	}
});

