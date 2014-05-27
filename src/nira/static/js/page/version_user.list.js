(function($) {
	var $listContainer;
	var prepareDone = -1;
	var usersData, rolesData, modulesData;
	function prepareControlsData(callback){
		if(prepareDone==-1){ //init
			prepareDone++;
			$.getJSON('/sys_user/pickerlist', function(data){usersData=data.rows;prepareDone++;})
			$.getJSON('/role/pickerlist', function(data){rolesData=data.rows;prepareDone++;})
			$.getJSON('/module/pickerlist', function(data){modulesData=data.rows;prepareDone++;})
		}
		
		if(prepareDone<3){
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
			bindData(data);			
		})
		addRow();
	}
	function bindData(data){
		$(data.rows).each(function(i, row){				
			var tr1 = $("<tr />").appendTo($listContainer);
			bindRow(tr1, row);
		})
		
	}
	function bindRow(tr1, row){		
		tr1.data('row', row);
		var td1 = $("<td />").appendTo(tr1);
		td1.text(row.user.name);
		
		var td2 = $("<td />").appendTo(tr1);
		td2.text(row.roles);
		
		var td3 = $("<td />").appendTo(tr1);
		td3.text(row.modules.join(','));
		
		var td4 = $("<td />").appendTo(tr1);
		td4.text(row.dialyHours);
		
		var td5 = $("<td />").appendTo(tr1);
		var btnEdit = $("<a href='javascript:void(0)'>编辑</a>").appendTo(td5);
		btnEdit.click(function(){
			editRow(tr1);
		})
	}
	function editRow(tr1){
		tr1.hide();
		var tr = $('<tr />').insertAfter(tr1);
//		tr.data('row', tr1.data('row'));
		buildControls(tr, tr1.data('row'));
		var td5 = $("<td />").appendTo(tr);
		var btnSave = $("<a href='javascript:void(0)'>保存</a>").appendTo(td5);
		btnSave.click(function(){
			tr.save(tr, function(row){
				tr.remove();
				tr = null;
				tr1.empty();
				bindRow(tr, row);
				tr1.show();
			},tr1.data('row')._id);
		})
		var btnCancel = $("<a href='javascript:void(0)'>取消</a>").appendTo(td5);
		btnCancel.click(function(){
			tr.remove();
			tr = null;
			tr1.show();
		})
	}
	function addRow(){
		var tfoot = $listContainer.next();
		var tr = $('<tr />').appendTo(tfoot);
		buildControls(tr);
		var td5 = $("<td />").appendTo(tr);
		var btnSave = $("<a href='javascript:void(0)'>保存</a>").appendTo(td5);
		btnSave.click(function(){
			tr.save(function(row){
				var tr1 = $("<tr />").appendTo($listContainer);
				bindRow(tr1, row);
				tr.remove();
				tr = null;
				addRow();
			});
		})
	}

	
	function buildControls(tr, row){
//		row = row||{}
		var td1 = $("<td />").appendTo(tr);
		var cRealName = $('<input/>').appendTo(td1);
		cRealName.searchBox({'data':usersData});
		
		var td2 = $("<td />").appendTo(tr);
		var cRoles = $('<input/>').appendTo(td2);
		cRoles.tagPicker({'data':rolesData});
		
		var td3 = $("<td />").appendTo(tr);
		var cModules = $('<input/>').appendTo(td3);
		cModules.tagPicker({'data':modulesData});
		
		var td4 = $("<td />").appendTo(tr);
		var cDialyHours = $('<input/>').appendTo(td4);
		
		if(row){
			bindValues();
		}
		function save(callback, id){
			var data = getValues();
			var url = '/version_user/create';
			if(id){
				url = '/version_user/edit';
			}
			$.postJSON(url, data, callback);
		}
		function getValues(){
			var data = {};
			data['userId'] = cRealName.searchBox('getValue');
			data['roles'] = cRoles.tagPicker('getValue');
			data['modules'] = cModules.tagPicker('getValue');
			data['dialyHours'] = cDialyHours.val();
			return data;
		}
		tr.save = save;
		function bindValues(){
			cRealName.searchBox('setValue',row['userId']);
			cRoles.tagPicker('setValue',row['roles']);
			cModules.tagPicker('setValue',row['modules']);
			cDialyHours.val(row['dialyHours']);
		}
	}
})(jQuery);

