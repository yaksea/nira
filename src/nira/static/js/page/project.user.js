var submitFunctions = [];

(function($) {	
	var $listContainer;
	
	var prepareDone = -1;
	var usersData;
	function prepareControlsData(callback){
		if(prepareDone==-1){ //init
			prepareDone++;
			$.getJSON('/sys_user/pickerlist', function(data){usersData=data.rows;prepareDone++;})
		}
		
		if(prepareDone<1){
			setTimeout(function(){prepareControlsData(callback)},500)
		}
		else{
			callback();
		}
	}
	
	$(function(){
		$listContainer = $('#listContainer');
		prepareControlsData(function(){			
			bind();
		})
	})
	function bind() {
		$.getJSON($.stringFormat("/{0}/pagedlist", moduleName), function(data){
			$(data.rows).each(function(i, row){		
				var tr1 = $('<tr />').appendTo($listContainer);
				bindRow(tr1, row)
				
			})
		})
		addRow();
	}
	
	function bindRow(tr1, row){		
		tr1.data('row', row);
		var td1 = $("<td />").appendTo(tr1);
		td1.text(row.user.realName);
		
		var td2 = $("<td />").appendTo(tr1);
		if(row.versions){
			td2.text(row.versions.join(','));
		}
		else{
			btnDel = $('<a href="javascript:void(0)">删除</a>').appendTo(td2);
			btnDel.click(function(){
				tr1.remove();
				tr1 = null;
				$.postJSON('/project_user/delete', {id:row._id});
			})
		}

	} 
	
	function addRow(){
		var tfoot = $listContainer.next();
		var tr = $('<tr />').appendTo(tfoot);
		
		var td1 = $("<td />").appendTo(tr);
		var cRealName = $('<input/>').appendTo(td1);
		cRealName.searchBox({'data':usersData, 'textField':'realName'});
		
		var td5 = $("<td />").appendTo(tr);
		var btnSave = $("<a href='javascript:void(0)'>确定</a>").appendTo(td5);
		btnSave.click(function(){
			var data = getValues()
			$.postJSON('/project_user/create', data,  function(row){
				var tr1 = $("<tr />").appendTo($listContainer);
				bindRow(tr1, row);
				tr.remove();
				tr = null;
				addRow();
			});
		})
		
		function getValues(){
			var data = {};
			data['userId'] = cRealName.searchBox('getValue');
			return data;
		}
	}

})(jQuery);
