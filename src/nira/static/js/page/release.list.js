var submitFunctions = [];

(function($) {	
	nira.bindData = function(container, data){
		$(data.rows).each(function(i, row){				
			var tr1 = $("<tr />").appendTo(container);
			var td1 = $("<td />").appendTo(tr1);
			td1.text(row.releaseVersion);
		})
	}

})(jQuery);
