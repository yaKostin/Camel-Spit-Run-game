var ProgressBar = function(elementName) {
	this.value = 100,
	this.progressBarElement = $(elementName);
};

ProgressBar.prototype = {
	adjustValue: function(value) {
		if (value) {
			this.value += value;
			if (this.value > 100) {
				this.value = 100;
			}
		}
		var bar = this.progressBarElement.find('.progressBar');
		var width = this.value * bar.width() / 100;
	    bar.find('div').animate({ width: width }, 500).html(this.value + "%&nbsp;");
	},
};