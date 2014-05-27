(function($) {	
	var tbList;
	
	$(function(){
		tbList = $('#tbList');
		$.getJSON('/plan/PagedList', function(data){
			$(data.rows).each(function(i, row){
				var tr = $('<tr />').appendTo(tbList);
				var td1 = $('<td />').appendTo(tr);
				td1.text(row.code);
				var td2 = $('<td />').appendTo(tr);
				td2.text(row.version);
			})
		})
	})
	
	

})(jQuery);
