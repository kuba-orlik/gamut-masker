function rgb_to_hsl(r, g, b){
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if(max == min){
		h = s = 0; 
	}else{
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max){
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return {h:h, s:s, l:l};
}

function process_pixels(pixels){
	var d = pixels.data;
	for(var i=0; i < d.length; i+=4){
		var r = d[i];
		var g = d[i+1];
		var b = d[i+2];
		var hsl = rgb_to_hsl(r, g, b);
		var x = Math.sin(hsl.h*2*Math.PI)*hsl.s;
		var y = Math.cos(hsl.h*2*Math.PI)*hsl.s;
		var new_x_y = getGamutPos(x, y);
		var new_hs = pos_to_hs(new_x_y.x, new_x_y.y);
		var rgb = hsl_to_rgb(new_hs.hue, new_hs.saturation, hsl.l);
		d[i] = rgb[0];
		d[i+1] = rgb[1];
		d[i+2] = rgb[2];
	}
	return pixels;
}

onmessage = function(e) {
	console.log('Message received from main script3', e.data);
	postMessage(["nini", "nono"]);
}	