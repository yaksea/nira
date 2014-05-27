//depends on numberbox
(function($) {
	function init(target){
		var container = $(target);
		var major = container.find('input.major');
		var minor = container.find('input.minor');
		major.numberbox();
		major.placeholder();
		minor.numberbox();
		minor.placeholder();
	}
	function setValue(target, data){
		var container = $(target);
		var major = container.find('input.major');
		var minor = container.find('input.minor');	
		major.val(data.major);
		minor.val(data.minor);
	}
	function getValue(target){
		var container = $(target);
		var major = container.find('input.major');
		var minor = container.find('input.minor');	
		return {major:major.val(), minor:minor.val()};
	}
	
	
	
	$.fn.versionPicker = function(options, param) {
		if (typeof options == 'string') {
			switch (options) {	
			case 'validate':
				return validate(this);
			case 'setValue':
				return this.each(function() {
					setValue(this, param);
				});
			case 'getValue':				
				return getValue(this);
			}
		}

		options = options || {};
		return this.each(function() {
			if (!$.data(this, 'versionPicker')) {
				$.data(this, 'versionPicker', {
					options : $.extend({}, $.fn.form.defaults, options)
				});
			}
			init(this);
		});
	};

	$.fn.versionPicker.defaults = {
		
	};
})(jQuery);