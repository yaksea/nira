var submitFunctions = [];

(function($) {	
	var listContainer;

	
	$(function(){
		listContainer = $('#listContainer');
		bindList();
		addRow();
		
	})
	
	function cleanControls(){
		txtEmail.val('');
		txtRealName.val('');
	}
	function bindList(){
		$.getJSON('/admin/role/pagedlist', function(data){
			$(data.rows).each(function(i, row){
				var tr1 = $("<tr />").appendTo(listContainer);
				bindRow(tr1, row);
			})
		})
	}
	
	function bindRow(tr, row){
//		var tr = $('<tr />').prependTo(listContainer);
		var td1 = $('<td />').appendTo(tr);
		td1.text(row.name||'');
		var td2 = $('<td />').appendTo(tr);
		td2.text('');		

		//未通过
//		var btnCancelInvite = $('<a href="javascript:void(0)">取消邀请</a>').appendTo(td4);
//		btnCancelInvite.click(function(){
//			$.postJSON('/admin/sys_user/delete', {id:row._id}, function(){
//				tr.remove();
//				tr = null;
//				$.messagelabel.show('已取消邀请');
//			})
	}
	

//	function editRow(tr1){
//		tr1.hide();
//		var tr = $('<tr />').insertAfter(tr1);
//		buildControls(tr, tr1.data('row'));
//		var td5 = $("<td />").appendTo(tr);
//		var btnSave = $("<a href='javascript:void(0)'>保存</a>").appendTo(td5);
//		btnSave.click(function(){
//			tr.save(tr, function(row){
//				tr.remove();
//				tr = null;
//				tr1.empty();
//				bindRow(tr, row);
//				tr1.show();
//			},tr1.data('row')._id);
//		})
//		var btnCancel = $("<a href='javascript:void(0)'>取消</a>").appendTo(td5);
//		btnCancel.click(function(){
//			tr.remove();
//			tr = null;
//			tr1.show();
//		})
//	}
	function addRow(){
		var tfoot = listContainer.next();
		var tr = $('<tr />').appendTo(tfoot);
		buildControls(tr);
		var td5 = $("<td />").appendTo(tr);
		var btnSave = $("<a href='javascript:void(0)'>保存</a>").appendTo(td5);
		btnSave.click(function(){
			tr.save(function(row){
				var tr1 = $("<tr />").appendTo(listContainer);
				bindRow(tr1, row);
				tr.remove();
				tr = null;
				addRow();
			});
		})
	}

	
	function buildControls(tr, row){
		var td1 = $("<td />").appendTo(tr);
		var cRoleName = $('<input/>').appendTo(td1);
		
		var td2 = $("<td />").appendTo(tr);
		td2.text('');
		
			
		if(row){
			bindValues();
		}
		function save(callback, id){
			var data = getValues();
			var url = '/admin/role/create';
			if(id){
				url = '/admin/role/edit';
			}
			$.postJSON(url, data, callback);
		}
		function getValues(){
			var data = {};
			data['name'] = cRoleName.val();
			return data;
		}
		tr.save = save;
		function bindValues(){
			cRoleName.val(row['name']);
		}
	}
	
})(jQuery);
