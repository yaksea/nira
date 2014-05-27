/*!
 * copyright c by zhangxinxu 2012-02-06
 * jquery.switcher.js switcher属性模拟插件
 * v1.0 2012-02-06 create
 * http://www.zhangxinxu.com/wordpress/2012/02/html5-switcher%E4%BD%BF%E7%94%A8%E7%BB%8F%E9%AA%8C%E5%88%86%E4%BA%AB%E5%8F%8A%E6%8B%93%E5%B1%95/
 */

(function($) {

	$.Switcher = function(target, options) {
		this.target = $(target).hide();
		this.options = options;

		this.container = $("<div class='switcher-container' />").insertAfter(
				this.target);
		this.control = $('<input type="checkbox" />').appendTo(this.container);
		this.target.data('switcher', this);
	}
	$.Switcher.prototype = {
		getValue : function() {
			return this.control.prop("checked");
		},
		setValue : function(value) {
			this.control.prop("checked", value);
		}
	}
	$.fn.switcher = function(options, param) {// 此处this表jquery对象
		if (typeof options == 'string') {
			var method = options;
//			this.each(function() {
				var instance = this.data('switcher');
				if (instance) {
					if (instance[method]) {
						return instance[method](param);
					}
				}
				// var instance = $.data(this, 'switcher');
				// if (instance) {
				// if (instance[method]) {
				// return instance[method](param);
				// }
				// }
				return null;
//			})
		}

		options = options || {};
		return this.each(function() {
			var instance = $.data(this, 'switcher');
			if (instance) {
				$.extend(instance.options, options);
			} else {
				instance = new $.Switcher(this, options);

			}
		});
	};
})(jQuery);