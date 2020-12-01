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
	}
	
	var config = {responsive: true}
	Plotly.newPlot(chart, [{x,y}], layout, config)
}
