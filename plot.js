
export function plot(x, y){
	var layout = {
	  title: 'Maximum Fitness Per Generation ((Snake Size * .70) + (Time Alive (in seconds) * .30))',
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
