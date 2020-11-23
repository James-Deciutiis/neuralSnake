export function plot(x, y){
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
	let TESTER = document.getElementById('chart')
	Plotly.newPlot(TESTER, [{x,y}], layout)
}
