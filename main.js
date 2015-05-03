var output = document.getElementById("output-canvas");
	var output_context = output.getContext("2d");
	sample_image = new Image();
	sample_image.src = 'img/sample.png';
	sample_image.onload = function(){
		output_context.drawImage(sample_image, 0, 0, output.width, output.height);
	}				

	function getInputPixels(){
		output_context.drawImage(sample_image, 0, 0, output.width, output.height);
		return output_context.getImageData(0, 0, output.width, output.height);
	}

	function hsl_to_rgb(h, s, l){
		var r, g, b;

		if(s == 0){
			r = g = b = l; 
		}else{
			var hue2rgb = function hue2rgb(p, q, t){
				if(t < 0) t += 1;
				if(t > 1) t -= 1;
				if(t < 1/6) return p + (q - p) * 6 * t;
				if(t < 1/2) return q;
				if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
				return p;
			}

			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

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

	function applyFilter(){
		var pixels = getInputPixels();
		worker.postMessage(["process", pixels.data]);
		process_pixels(pixels);
		output_context.putImageData(pixels, 0, 0);
	}