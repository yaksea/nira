(function($) {	
	var form;
	var tabs;
	var registered = true;
	
	$(function(){
		form = $('#form1');		
		tabs = $('.tabs');
		var title = tabs.children('.title');
		tabs.find('.tab').click(function(){
			var ele = $(this);
			console.info(this)
			var i = title.children().index(ele);
			console.info(i);
			var another = (i+1)%2;
			registered = i==0;
			ele.addClass("selected");
			$(title.children('.tab')[another]).removeClass("selected");
			$(tabs.children('.content')[i]).show();
			$(tabs.children('.content')[another]).hide();
		})
	})
	

	

	
	nira.join = function(){
		var extraData = {registered:registered};
		form.form();
		form.form('submit', extraData, function(){
		})
	}

	
})(jQuery);
