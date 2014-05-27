(function($) {
	var isRendered = false;
	var container = null;
	var data = null;
	var sortOrder = 'asc';
	var displayMode = 'collapsed';
	var pnlList = null;

	function show(c) {
		if (!isRendered) {
			container = c;
			id = $.getUrlParam('id');
			var mmn = myModuleName;
			if(mmn=='singleCustomer'){
				mmn = 'contact'
			}
			$.getJSON('/' + mmn + '/dataLog', {
						'id' : id
					}, function(datas) {
						data = datas.rows;
						var pnlButtons = $('<div class="pnlButtons" />')
								.appendTo(container);
						if(data.length>1){							
							var btnChangeSortOrder = $('<a href="javascript:void(0)">切换顺序</a>')
									.appendTo(pnlButtons);
							btnChangeSortOrder.click(changeSortOrder);
						}
						var btnChangeDisplayMode = $('<a href="javascript:void(0)">切换显示</a>')
								.appendTo(pnlButtons);
						btnChangeDisplayMode.click(changeDisplayMode);

						bind();
					})
			isRendered = true;
		}
	}

	function bind() {
		pnlList = $('<div/>').appendTo(container);
		$(data).each(function(i, row) {
			var ic = $('<div class="item" />').appendTo(pnlList);
			var title = $('<a href="javascript:void(0)"  class="title" />').appendTo(ic);
			var content = $('<div class="content" style="display:none;"/>')
					.appendTo(ic);

			title.html($.stringFormat('{3}.&nbsp;{0}, 由 <b>{1}</b> {2}',
					row['dateTime'], row['userName'], row['operation'], i + 1));
			title.click(function() {
						content.toggle();
						if(displayMode=='collapsed'){
							displayMode = 'expanded';
						}
					})
			$(row.descriptions).each(function(x, di) {
						var dis = $('<div />').appendTo(content);
						dis.text(di);
					})

		})
	}
	function changeSortOrder() {
		for (var i = 0; i < data.length; i++) {
			pnlList.children().first()
					.insertAfter($(pnlList.children()[data.length - i]));
		}
	}
	function changeDisplayMode() {
		if (displayMode == 'collapsed') {
			pnlList.find('.content').show();
			displayMode = 'expanded';
		} else {
			pnlList.find('.content').hide();
			displayMode = 'collapsed';
		}
	}

	window.renderDataLog = show;
})(jQuery);
