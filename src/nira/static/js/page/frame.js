(function($) {	
	var btnCreateTask, dlgCreateTask;
	$(function(){
		btnCreateTask = $('#btnCreateTask');
		dlgCreateTask = $('#dlgCreateTask');
		btnCreateTask.click(function(){
			dlgCreateTask.show();
			dlgCreateTask.dialog({
					modal : true,
					title : "编辑"
				})
		})
		dlgCreateTask.find('.save').click(function(){
			$.postJSON('/task/create',{'subject':dlgCreateTask.find('.subject').val(),
				'description':dlgCreateTask.find('.description').val()
			}, function(){
				alert('success');
			})
			dlgCreateTask.dialog('close');
		});
		dlgCreateTask.find('.cancel').click(function(){
			dlgCreateTask.dialog('close');
			
		});
	})
	
})(jQuery);
