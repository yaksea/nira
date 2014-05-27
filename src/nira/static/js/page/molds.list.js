var submitFunctions = [];

(function($) {
	var $listContainer;
	$(function(){
		$listContainer = $('#listContainer');
		bind();
	})
	function bind() {
		$.getJSON($.stringFormat("/{0}/pagedlist", moduleName), function(data){
			nira.bindData($listContainer, data);			
		})
	}

})(jQuery);
