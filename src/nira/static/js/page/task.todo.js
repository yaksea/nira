(function($) {	
	var taskToPerch, floatTask, floatTask_offsetY, ulToPerch, curGroupBlock, outOfGroupBlock;
	
	$(function(){
		taskToPerch = $('#taskToPerch');
		ulToPerch = $('#ulToPerch');
	})
	
	window.bindTaskList = function(pnlTasks, groupId){
		txtNewSubject = $('#txtNewSubject');
		var ulTaskList = $('<ul class="ulTaskList" />').appendTo(pnlTasks);
		var pnlAdd = $('<div class="pnlAdd" />').appendTo(pnlTasks);
		var div1 = $('<div style="display:none;" />').appendTo(pnlAdd);
		var div2 = $('<div />').appendTo(pnlAdd);
		
		var txtNewSubject = $('<input type="text" />').appendTo(div1);
		var btnAddTodo = $('<a href="javascript:void(0)">添加</a>').appendTo(div2);
		
		
		pnlTasks.data('maxOrder', 0);
		$.getJSON('/task/list', {groupId:groupId}, function(data){
			var len = data.rows.length;
			$(data.rows).each(function(i, row){
				addRow(row, ulTaskList);
			});
			if(len){
				pnlTasks.data('maxOrder', data.rows[len-1].order||0);
			}else{
				pnlTasks.data('maxOrder', 0);
			}
			txtNewSubject.keypress(function(e){
				if (e.keyCode === 13){
					finishAdd();
					if(e.ctrlKey){
						div1.show();
						div2.hide();
						txtNewSubject.focus();
						$(document).bind('click.cancelAdd', finishAdd);
					}
				}
			});
			
		})
		function finishAdd(){
			var txt = txtNewSubject.val();
			if(txt){
				var maxOrder = pnlTasks.data('maxOrder')+10;
				pnlTasks.data('maxOrder', maxOrder);
				$.postJSON('/task/Create', {'subject':txt, 'order':maxOrder,
								groupId:groupId}, function(row){
					addRow(row, ulTaskList);
				})
				txtNewSubject.val('');
				$(document).unbind('click.cancelAdd');
			}
			div1.hide();
			div2.show();			
		}
		
		btnAddTodo.click(function(){
			txtNewSubject.val('');
			div1.show();
			div2.hide();
			txtNewSubject.focus();
			$(document).bind('click.cancelAdd', finishAdd);
			return false;
		})
	
	}
	
	function addRow(row, ulTaskList){
		var li = $('<li />').appendTo(ulTaskList);
		li.data('row', row);
		//
		var pnlNubbin = $('<div class="pnlNubbin"/>').appendTo(li);
		var btnDel = $('<a href="javascript:void(0)" class="btnLink">del</a>').appendTo(pnlNubbin);
		btnDel.click(function(){
			li.remove();
			$.postJSON('/task/delete',{'id':row._id}, function(){
						
			})
		})
		var btnEdit = $('<a href="javascript:void(0)" class="btnLink">edit</a>').appendTo(pnlNubbin);
		//
		var cbDone =  $('<input type="checkbox" />').appendTo(li);
		//view
		var pnlView = $('<span />').appendTo(li);
		var txtSubject =  $('<span />').appendTo(pnlView);
		txtSubject.text(row.subject);
		txtSubject.bind('mousedown.fieldFloat', {target:txtSubject, block: li}, onMouseDown);
		txtSubject.mouseover(function(){
			if(!floatTask){
				pnlNubbin.show();
			}
		});
		li.mouseleave(function(){
			pnlNubbin.hide();
		})
		//edit
		var pnlEdit, txtSubject_edit;
		btnEdit.click(function(){
			if(!pnlEdit){
				pnlEdit = $('<span />').appendTo(li);
				txtSubject_edit =  $('<input type="text" />').appendTo(pnlEdit);
				txtSubject_edit.val(row.subject);
				var btnSave = $('<a href="javascript:void(0)" class="btnLink">save</a>').appendTo(pnlEdit);
				var btnCancel = $('<a href="javascript:void(0)" class="btnLink">cancel</a>').appendTo(pnlEdit);
				function save(){
					pnlEdit.hide();
					pnlView.show();
					row.subject = txtSubject_edit.val();
					txtSubject.text(row.subject);
					$.postJSON('/task/edit',{'id':row._id, 'subject':row.subject}, function(){
						
					})
				}
				btnSave.click(save);
				txtSubject_edit.keypress(function(e){
					if (e.keyCode == 13){
						save();
					}
				})
				btnCancel.click(function(){
					pnlEdit.hide();
					pnlView.show();
				});
			}
			pnlEdit.show();
			pnlView.hide();
			txtSubject_edit.select();
			
		})
		if(row.done){
			txtSubject.addClass('done');
			cbDone.prop('checked', true);
		}
		cbDone.click(function(){
			if(row.done){
				row.done = 0;
				txtSubject.removeClass('done');
			}
			else{
				row.done = 1;
				txtSubject.addClass('done');
			}
			$.postJSON('/task/edit', {id:row._id,done:row.done}, function(data){
				//
			})
		})
		
	}
	
	function onMouseDown(e){
		//
		e.data.target.bind('mousemove.fieldFloat', e.data, onMouseMove);
		e.data.target.bind('mouseup.fieldFloat', e.data, onMouseUp);
		$(document).bind('mousemove.document', e.data, onMouseMove);
		$(document).bind('mouseup.document', e.data, onMouseUp);		
	}
	
	function onMouseMove(e){
		if(!floatTask){
			floatTask = e.data.block;
			floatTask_offsetX = e.pageX-floatTask.offset().left;
			floatTask_offsetY = e.pageY-floatTask.offset().top;
			outOfGroupBlock = true;
		}	
		checkInsert(e);
		floatTask.find('.pnlNubbin').hide();
		floatTask.css({
			position : 'absolute',
			left: e.pageX-floatTask_offsetX,
			top: e.pageY-floatTask_offsetY,
			cursor: 'move',
			width: '300px',
			'z-index':1000
		});		
	}
	function onMouseUp(e){
		e.data.target.unbind('mousemove.fieldFloat');
		e.data.target.unbind('mouseup.fieldFloat');
		$(document).unbind('mousemove.document');
		$(document).unbind('mouseup.document');	
		
		if(floatTask){
			floatTask.insertAfter(taskToPerch);
			taskToPerch.appendTo(ulToPerch);
			floatTask.css({
				position: 'relative',
				cursor: 'pointer',
				left: '0px',
				top: '0px'
			});
			var order;
			var next = floatTask.next();
			var prev =  floatTask.prev();
			if(next.length && prev.length){
				order = next.data('row').order-(next.data('row').order-prev.data('row').order)/2;
			}
			else if(next.length){
				order = next.data('row').order - 0.01;
			}
			else{
				var pnlTasks = curGroupBlock.find('.pnlTasks');
				order = pnlTasks.data('maxOrder')+10;
				pnlTasks.data('maxOrder', order);
			}
			var _floatTask = floatTask
			$.postJSON('/task/edit',{'id':floatTask.data('row')._id, order:order, 
						groupId:curGroupBlock.data('row')._id}, function(){
				_floatTask.data('row').order = order;
			})
			floatTask = null;
		}
		
	}
	function checkInsert(e){
		if(!outOfGroupBlock){
			if( (e.pageY >= curGroupBlock.offset().top &&e.pageY<=curGroupBlock.offset().top+curGroupBlock.innerHeight()) &&
				(e.pageX >= curGroupBlock.offset().left &&e.pageX<=curGroupBlock.offset().left+curGroupBlock.innerWidth()) ){
					//当前groupBlock范围内
				var ulList = curGroupBlock.find('.ulTaskList');
				if (e.pageY <= ulList.offset().top) {
					taskToPerch.prependTo(ulList);
				} else if (e.pageY >= ulList.offset().top + ulList.innerHeight()) {
					taskToPerch.appendTo(ulList);
				} else {
						var top = taskToPerch.offset().top;
						var height = taskToPerch.innerHeight();
						if (e.pageY <= top-3) {
							// top
							taskToPerch.insertBefore(taskToPerch.prev());
									
							return false;
						} else if (e.pageY > top + height+3) {
							// bottom
							var nli = taskToPerch.next().next()
							if(nli.length){
								taskToPerch.insertAfter(nli);
							}
							else{
								taskToPerch.appendTo(ulList);
							}
							return false;
						}
				}
			}else{
				outOfGroupBlock = true;
				taskToPerch.appendTo(ulToPerch);
			}
		}
		else{
			pnlGroupList.children().each(function(){
				var block = $(this);
				if(block.hasClass('groupToPerch')){
					return true;
				}
				if( (e.pageY >= block.offset().top &&e.pageY<=block.offset().top+block.innerHeight()) &&
				(e.pageX >= block.offset().left &&e.pageX<=block.offset().left+block.innerWidth()) ){
					
					curGroupBlock = block;
					
					var ulList = curGroupBlock.find('.ulTaskList');
					if (e.pageY <= ulList.offset().top) {
						taskToPerch.prependTo(ulList);
					} else if (e.pageY >= ulList.offset().top + ulList.innerHeight()) {
						taskToPerch.appendTo(ulList);
					} else {
						ulList.children().each(function(){
							var $this = $(this);
							var top = $this.offset().top;
							var height = $this.innerHeight();
							if(e.pageY > top && e.pageY < top + height/2){
								//top
								taskToPerch.insertBefore($this);
								return false;
							}
							else if(e.pageY >= top+ height/2 && e.pageY < top + height){
								//bottom
								taskToPerch.insertAfter($this);
								return false;
							}							
						})
					}					
					outOfGroupBlock = false;
					return false;
				}
			})
		}
	}
})(jQuery);
