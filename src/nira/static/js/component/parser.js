(function($){
	$.parser = {
		auto: true,
		parse: function(context){
			var components = $('.easyui-component');
			$(components).each(function(i, ele){
				var $ele = $(ele);
//				$.debug(ele.id);
				var componentType = $ele.attr('componentType');
//				$.debug(componentType);
				$ele[componentType]();
				
			});
		}
	};
	$(function(){
		if (!window.easyloader && $.parser.auto){
			$.parser.parse();
		}
	});
})(jQuery);