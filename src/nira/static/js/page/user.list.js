var submitFunctions = [];

(function($) {	
	var listContainer;
	var dlgInvite;
	var txtEmail;
	var txtRealName;
	
	$(function(){
		listContainer = $('#listContainer');
		bindList();
		dlgInvite = $('#dlgInvite');
		txtEmail = dlgInvite.find('#txtEmail');
		txtRealName = dlgInvite.find('#txtRealName');
		dlgInvite.find('.save').click(function(){
			dlgInvite.window('close');
			var data = {'email':txtEmail.val(),'realName':txtRealName.val()};
			$.postJSON('/admin/sys_user/invite', data, function(data){
				bindRow(data);
				$.messagelabel.show('已成功发送邀请');
			})
		})
		dlgInvite.find('.cancel').click(function(){
			dlgInvite.window('close');
		})
	})
	
	function cleanControls(){
		txtEmail.val('');
		txtRealName.val('');
	}
	function bindList(){
		$.getJSON('/admin/sys_user/pagedlist', function(data){
			$(data.rows).each(function(i, row){
				bindRow(row);
			})
		})
	}
	
	function bindRow(row){
		var tr = $('<tr />').prependTo(listContainer);
		var td1 = $('<td />').appendTo(tr);
		td1.text(row.realName||'');
		var td2 = $('<td />').appendTo(tr);
		td2.text(row.email);
		var td3 = $('<td />').appendTo(tr);
		td3.text(row.status);
		var td4 = $('<td />').appendTo(tr);
		if(row.status==1){
			//已通过
			var btnDel = $('<a href="javascript:void(0)">删除</a>').appendTo(td4);
			btnDel.click(function(){
				$.postJSON('/admin/sys_user/delete', {id:row._id}, function(){
					tr.remove();
					tr = null;
					$.messagelabel.show('已删除');
				})
			})
		}else{
			//未通过
			var btnCancelInvite = $('<a href="javascript:void(0)">取消邀请</a>').appendTo(td4);
			btnCancelInvite.click(function(){
				$.postJSON('/admin/sys_user/delete', {id:row._id}, function(){
					tr.remove();
					tr = null;
					$.messagelabel.show('已取消邀请');
				})
			})
			var btnReinvite = $('<a href="javascript:void(0)">重新邀请</a>').appendTo(td4);
			btnReinvite.click(function(){
				$.postJSON('/admin/sys_user/invite', row, function(){
					$.messagelabel.show('已重新发送邀请');
					btnReinvite.hide();
				})
			})
		}
	}
	

	
	nira.startInvite = function(){
		cleanControls();
		dlgInvite.show();
		dlgInvite.window({
			modal : true,
			collapsible : false,
			minimizable : false,
			maximizable : false,
			title : "发送邀请",
			resizable : false,
			shadow : false,
			onclose : function() {
//				bind();
			},
			closed : false
		});
	}

	
})(jQuery);
