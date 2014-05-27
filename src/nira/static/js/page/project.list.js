var submitFunctions = [];

(function($) {	
	var $listContainer;
	$(function(){
		$listContainer = $('#listContainer').addClass('project_list');
		bind();
	})
	function bind() {
		$.getJSON($.stringFormat("/{0}/datalist", moduleName), function(data){
			nira.bindData($listContainer, data);			
		})
	}
	
	nira.bindData = function(container, data){
		$(data.rows).each(function(i, row){				
			var block = $("<div class='block' />").appendTo(container);
			var title = $("<div />").appendTo(block);
			var a = $("<a />").appendTo(title);
			a.text(row.name);
			a.prop('href', '/plan?projectId='+ row._id);
			var user = $("<div />").appendTo(block);
			if(row.users){				
				user.text($.stringFormat('团队：{0}人', row.users))				
			}
			
			var btnUsers =  $("<a href='/project_user?projectId="+ row._id +"' />").appendTo(user);
			btnUsers.text('管理团队');
			
			var curVersion = $("<div />").appendTo(block);
			if(row.curVersion){
				curVersion.text($.stringFormat('当前版本：{0}', row.curVersion));
			}
			else{
				var btnAddVersion =  $("<a href='/version/create?projectId="+ row._id +"' />").appendTo(curVersion);
				btnAddVersion.text('添加版本');
				
			}
			
		})
	}

})(jQuery);
