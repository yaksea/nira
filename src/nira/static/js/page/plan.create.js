(function($) {	
	var form;
	
	$(function(){
		form = $('.form');
		$('#btnSubmit').click(function(){
			console.info(form.find('.version').val())
			$.postJSON('/plan/create',{code:form.find('.code').val(), version:form.find('.version').val()},
					function(){
						alert('success!')
			})
		})
		
	})
	
})(jQuery);
