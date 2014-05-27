(function($) {	
	var tbList;
	
	$(function(){
		tbList = $('#tbList');
		$.getJSON('/task/PagedList', function(data){
			$(data.rows).each(function(i, row){
				var tr = $('<tr />').appendTo(tbList);
				var td1 = $('<td />').appendTo(tr);
				td1.text(row.subject);
				var td2 = $('<td />').appendTo(tr);
				td2.text(row.priority);
				var td3 = $('<td />').appendTo(tr);
				td3.text(row.assignTo);
				var td4 = $('<td />').appendTo(tr);
				td4.text(row.creator);
				var td5 = $('<td />').appendTo(tr);
				td5.text(row.createTime);
			})
		})
	})
	
	

})(jQuery);
