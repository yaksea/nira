(function($) {	
	var btnCreateGroup, pnlCreateForm, pnlCreate;
	var maxOrder;
	var floatGroup, groupToPerch, floatGroup_offsetX, floatGroup_offsetY;
	var btnInline, arrangeInline=true;
	
	$(function(){
		pnlGroupList = $('#pnlGroupList');
		btnCreateGroup = $('#btnCreateGroup');
		pnlCreateForm = $('#pnlCreateForm');
		pnlCreate = $('#pnlCreate');
		groupToPerch = pnlGroupList.find('.groupToPerch');
		
		$.getJSON('/group/list', function(data){
			$(data.rows).each(function(i, row){
				addGroup(row);
				maxOrder = row.order||0;
			});
		});
		btnCreateGroup.click(function(){
			pnlCreateForm.find('.subject').val('');
			pnlCreateForm.find('.subject').focus();
			btnCreateGroup.hide();
			pnlCreateForm.show();
		});
		pnlCreateForm.find('.btnCreate').click(function(){
			var subject = pnlCreateForm.find('.subject').val();
			maxOrder += 10;
			$.postJSON('/group/create', {'subject':subject, order:maxOrder}, function(row){
				addGroup(row);
			});
			btnCreateGroup.show();
			pnlCreateForm.hide();
		});
		pnlCreateForm.find('.btnCancel').click(function(){
			btnCreateGroup.show();
			pnlCreateForm.hide();
		});
		btnInline = $('#btnInline');
		btnInline.change(function(){
			arrangeInline = btnInline.prop('checked');
		})
	});
	
	function addGroup(row){
		var pnlTaskGroup = $('<div class="taskGroup" />').appendTo(pnlGroupList);
		
		pnlTaskGroup.data('row', row);
		var divTitle = $('<div class="title" />').appendTo(pnlTaskGroup);
		divTitle.bind('mousedown.fieldFloat', {target:divTitle, block: pnlTaskGroup}, onMouseDown);
		
		var pnlTasks = $('<div class="pnlTasks" />').appendTo(pnlTaskGroup);
		window.bindTaskList(pnlTasks, row._id);
		
		var txtSubject = $('<span style="cursor: pointer;" />').appendTo(divTitle);
		txtSubject.text(row.subject);
		var txtSubject_edit;
		txtSubject.click(function(){
			txtSubject.hide();
			if(!txtSubject_edit){
				txtSubject_edit = $('<input type="text" />').appendTo(divTitle);
				txtSubject_edit.val(row.subject);
				txtSubject_edit.keypress(function(e){
					if(e.keyCode===13){
						txtSubject_edit.hide();
						txtSubject.show();
						row.subject = txtSubject_edit.val();
						txtSubject.text(row.subject);
						$.postJSON('/group/edit',{'id':row._id, 'subject':row.subject}, function(){
							
						})						
					}
				})
			}
			txtSubject_edit.select()
			txtSubject_edit.show();
			txtSubject_edit.focus();
		});
		maxOrder = row.order;
	}
	function onMouseDown(e){
		//
		e.data.target.bind('mousemove.fieldFloat', e.data, onMouseMove);
		e.data.target.bind('mouseup.fieldFloat', e.data, onMouseUp);
		$(document).bind('mousemove.document', e.data, onMouseMove);
		$(document).bind('mouseup.document', e.data, onMouseUp);		
	}
	
	function onMouseMove(e){
		if(!floatGroup){
			floatGroup = e.data.block;
			floatGroup_offsetX = e.pageX-floatGroup.offset().left;
			floatGroup_offsetY = e.pageY-floatGroup.offset().top;
			groupToPerch.insertBefore(floatGroup);
		}	
		floatGroup.find('.pnlNubbin').hide();
		if(arrangeInline){
			checkInsert(e);
			groupToPerch.show();
		}
		floatGroup.css({
			position : 'absolute',
			left: e.pageX-floatGroup_offsetX,
			top: e.pageY-floatGroup_offsetY,
			display:'block',
			'z-index':1000
		});		
	}
	function onMouseUp(e){
		e.data.target.unbind('mousemove.fieldFloat');
		e.data.target.unbind('mouseup.fieldFloat');
		$(document).unbind('mousemove.document');
		$(document).unbind('mouseup.document');	
		
		if(floatGroup){
			if(arrangeInline){
				groupToPerch.hide();
				floatGroup.insertAfter(groupToPerch);
				floatGroup.css({
					position: 'static',
					display:'inline-block',
					top: '0px'
				});
				var order = maxOrder+10;
				var next = floatGroup.next();
				var prev =  floatGroup.prev().prev();
				if(next.length && prev.length){
					order = next.data('row').order-(next.data('row').order-prev.data('row').order)/2;
				}
				else if(next.length){
					order = next.data('row').order - 0.01;
				}
				else{
					maxOrder = order;
				}
				floatGroup.data('row').order = order;
				$.postJSON('/group/changeOrder',{'id':floatGroup.data('row')._id, order:order}, function(){
				})
			}else{
//				floatGroup.css({
//					display:'inline-block',
//					top: '0px'
//				});				
			}
			floatGroup = null;
		}
		
	}
	function checkInsert(e){
		if (e.pageX <= pnlGroupList.offset().left) {
			groupToPerch.prependTo(pnlGroupList);
		} else if (e.pageY >= pnlGroupList.offset().left + pnlGroupList.innerWidth()) {
			groupToPerch.appendTo(pnlGroupList);
		} else {
				var left = groupToPerch.offset().left;
				var width = groupToPerch.innerWidth()+10;
				if (e.pageX <= left-3) {
					// top
					groupToPerch.insertBefore(groupToPerch.prev());
							
					return false;
				} else if (e.pageX > left + width+10) {
					// bottom
					var nli = groupToPerch.next().next()
					if(nli.length){
						groupToPerch.insertAfter(nli);
					}
					else{
						groupToPerch.appendTo(pnlGroupList);
					}
					return false;
				}
		}
	}
})(jQuery);
