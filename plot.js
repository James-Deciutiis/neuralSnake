let chart = document.getElementById('chart')
chart.style.display = "none"  

export function plot(x, y){
	if(chart.style.display === "none"){
		chart.style.display = "block"
	}

	var layout = {
	  title: 'Max Fitness Per Generation',
	  xaxis: {
	    title: 'Generation Number',
	    showgrid: false,
	    zeroline: false
	  },
	  yaxis: {
	    title: 'Fitness Score',
	    showline: false
	  }
	};
	Plotly.newPlot(chart, [{x,y}], layout)
}
