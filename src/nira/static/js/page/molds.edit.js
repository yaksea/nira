var submitFunctions = [];

(function($) {
	var $form;
	var id;
	$(function(){
		$form = $('form').first();
		$form.form();
		id = $.getUrlParam('id');
//		test();
//		test(function(){
//			
//			$form.find('input[name="xx"]')
//		})
//		$('input[name="xx"]')
//		$('input[name="xx"]')
	})
	
	function test(){
		var d1 = new Date();
		for(var i=0;i<10000;i++){
//			$form.find('[name="xx"]');
//			$form.find('[name="xx"]');
			$('#form1 input')
//			$form.find('input');
		}
		var d = new Date();
//		console.info(d-d1);
//		console.info(window.location);
		
		
	}
	function save() {
		// $.preSave($form);
		// if (!doValid()) {
		// // 自定义校验不通过
		// } else
		if ($form.form('validate')) {
			$.each(submitFunctions, function(i, func) {
				func();
			});
			// return
			$form.form('submit', {
				success : function(data) {
					console.debug(data);
//					var temp = $("<div />").html(data);
//					data = JSON.parse(temp.text());
					// data = $.parseJSON(data);
					if (data.statusCode == 200) {
						if (id) {
							$.messager.alert('', '修改成功。', 'info', function() {
//								mydlg.closeCurTab({
//									change : 'changeListRow',
//									data : data
//								});
							});
						} else {
							$.messager.alert('&nbsp', '添加成功。', 'info', function() {
//										mydlg.closeCurTab({
//											change : 'addListRow',
//											data : data
//										});
									});
						}
					} else {
						$.messager.alert('', data.message, 'warning');
					}
				}
			});
		} else {
			$.messager.alert('', '请正确填写表单。', 'warning');
		}
	}

	nira.save = save;
})(jQuery);
			
