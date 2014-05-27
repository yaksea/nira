(function($) {	
	var pnlSwitcher, pnlDates, calendarDemo, tbDates, target, curDate;
	var curYear, curMonth;
	var floatTask;
	
	$(function(){
		pnlSwitcher = $('#pnlSwitcher');
		target = pnlDates = $('#pnlDates');
//		calendarDemo = $('#calendarDemo');
//		calendarDemo.calendar();
		tbDates = $('#tbDates');
		
		init();
		
		curDate = new Date();
		curYear = curDate.getFullYear();
		curMonth = curDate.getMonth()+1;
		
		showDates();
		
		
		btnPrev.click(function(){
			curMonth --;
			if(curMonth<1){
				curYear--;
				curMonth = 12;
			}
			var tbody = $('<tbody/>').prependTo(tbDates);
			showDates(tbody);
			tbDates.css({marginTop: -540});
			tbDates.animate({marginTop: "0"}, 800,function(){
				tbody.next().remove();
			});
		});
		btnNext.click(function(){
			curMonth ++;
			if(curMonth>12){
				curYear++;
				curMonth = 1;
			}
			var tbody = $('<tbody/>').appendTo(tbDates);
			showDates(tbody);
			tbDates.animate({marginTop: "-540"}, 800,function(){
				tbody.prev().remove();
				tbDates.css({marginTop: 0});
			});
		});
	});
	
	var btnNext, btnPrev, btnMonth, fltSwitcher;
	
	function showDates(tbody){
		if(!tbody){
			tbody = tbDates.find('tbody');
		}
		btnMonth.text(curYear + '-' + curMonth);
		weeks = getWeeks(curYear, curMonth);
		for(var i=0; i<weeks.length; i++){
			var week = weeks[i];
			var tr = $('<tr></tr>').appendTo(tbody);
			for(var j=0; j<week.length; j++){
				var day = week[j];
				var td = $('<td class="cld-day cld-other-month"></td>').
					prop('abbr',day[0]+','+day[1]+','+day[2]).appendTo(tr);
				
				var dd = $('<div class="cld-cell-day" />').appendTo(td);
				dd.text(day[2]);
					
			}
		}
		tbody.find('td[abbr^="'+curYear+','+curMonth+'"]').removeClass('cld-other-month');
	}
	function init(){
		btnNext = pnlSwitcher.find('.cld-btnNext');
		btnPrev = pnlSwitcher.find('.cld-btnPrev');
		btnMonth = pnlSwitcher.find('.cld-btnMonth');
		
		return;
		pnlDates.wrapInner(
				'<div><div class="cld-header">' +
					'<div class="cld-prevmonth"></div>' +
					'<div class="cld-nextmonth"></div>' +
					'<div class="cld-prevyear"></div>' +
					'<div class="cld-nextyear"></div>' +
					'<div class="cld-title">' +
						'<span>Aprial 2010</span>' +
					'</div>' +
				'</div>' +
				'<div class="cld-body">' +
					'<div class="cld-menu">' +
						'<div class="cld-menu-year-inner">' +
							'<span class="cld-menu-prev"></span>' +
							'<span><input class="cld-menu-year" type="text"></input></span>' +
							'<span class="cld-menu-next"></span>' +
						'</div>' +
						'<div class="cld-menu-month-inner">' +
						'</div>' +
					'</div>' +
				'</div></div>'
		);

		$(target).find('.cld-title span').hover(
			function(){$(this).addClass('cld-menu-hover');},
			function(){$(this).removeClass('cld-menu-hover');}
		).click(function(){
			var menu = $(target).find('.cld-menu');
			if (menu.is(':visible')){
				menu.hide();
			} else {
				showSelectMenus(target);
			}
		});
		
		$('.cld-prevmonth,.cld-nextmonth,.cld-prevyear,.cld-nextyear', target).hover(
			function(){$(this).addClass('cld-nav-hover');},
			function(){$(this).removeClass('cld-nav-hover');}
		);
		$(target).find('.cld-nextmonth').click(function(){
			showMonth(target, 1);
		});
		$(target).find('.cld-prevmonth').click(function(){
			showMonth(target, -1);
		});
		$(target).find('.cld-nextyear').click(function(){
			showYear(target, 1);
		});
		$(target).find('.cld-prevyear').click(function(){
			showYear(target, -1);
		});
		
		$(target).bind('_resize', function(){
			var opts = $.data(target, 'calendar').options;
			if (opts.fit == true){
				setSize(target);
			}
			return false;
		});
		
	}
	
	function getWeeks(year, month){
		var dates = [];
		var lastDay = new Date(year, month, 0).getDate();
		for(var i=1; i<=lastDay; i++) dates.push([year,month,i]);
		
		// group date by week
		var weeks = [], week = [];
		while(dates.length > 0){
			var date = dates.shift();
			week.push(date);
			if (new Date(date[0],date[1]-1,date[2]).getDay() == 6){
				weeks.push(week);
				week = [];
			}
		}
		if (week.length){
			weeks.push(week);
		}
		
		var firstWeek = weeks[0];
		if (firstWeek.length < 7){
			while(firstWeek.length < 7){
				var firstDate = firstWeek[0];
				var date = new Date(firstDate[0],firstDate[1]-1,firstDate[2]-1)
				firstWeek.unshift([date.getFullYear(), date.getMonth()+1, date.getDate()]);
			}
		} else {
			var firstDate = firstWeek[0];
			var week = [];
			for(var i=1; i<=7; i++){
				var date = new Date(firstDate[0], firstDate[1]-1, firstDate[2]-i);
				week.unshift([date.getFullYear(), date.getMonth()+1, date.getDate()]);
			}
			weeks.unshift(week);
		}
		
		var lastWeek = weeks[weeks.length-1];
		while(lastWeek.length < 7){
			var lastDate = lastWeek[lastWeek.length-1];
			var date = new Date(lastDate[0], lastDate[1]-1, lastDate[2]+1);
			lastWeek.push([date.getFullYear(), date.getMonth()+1, date.getDate()]);
		}
		if (weeks.length < 6){
			var lastDate = lastWeek[lastWeek.length-1];
			var week = [];
			for(var i=1; i<=7; i++){
				var date = new Date(lastDate[0], lastDate[1]-1, lastDate[2]+i);
				week.push([date.getFullYear(), date.getMonth()+1, date.getDate()]);
			}
			weeks.push(week);
		}
		
		return weeks;
	}
	
	(function(){
		var pnlMain, pnlHeader, pnlBody, bHandler, bToggle, pnlGroupList;
		var floatGroup_offsetX, moving=false;
		
		function init(){
			pnlMain = $('<div class="tp-main" />').appendTo($('body'));
			pnlMain.css({top:40, left:600});
			pnlHeader = $('<div class="tp-header" />').appendTo(pnlMain);
			bHandler = $('<div class="tp-handler" />').appendTo(pnlHeader);
			bHandler.text('未安排任务');
			pnlHeader.bind('mousedown.taskPicker', onMouseDown);
			
			bToggle = $('<div class="tp-toggle" />').appendTo(pnlHeader);
			bToggle.text('展开');
			
			
			
			pnlBody = $('<div class="tp-body" />').appendTo(pnlMain);
			
			showGroups();
		}
		function onMouseDown(e) {
			pnlHeader.bind('mousemove.taskPicker', onMouseMove);
			pnlHeader.bind('mouseup.taskPicker', onMouseUp);
			$(document).bind('mousemove.document', onMouseMove);
			$(document).bind('mouseup.document', onMouseUp);
		}
		
		function onMouseMove(e) {
			if(!moving){
				floatGroup_offsetX = e.pageX - pnlMain.offset().left;
				floatGroup_offsetY = e.pageY - pnlMain.offset().top;
				moving = true;
			}
			
			pnlMain.css({
						position : 'absolute',
						left : e.pageX - floatGroup_offsetX,
						top : e.pageY - floatGroup_offsetY,
						display : 'block',
						zIndex : 100000
					});
		}
		function onMouseUp(e) {
			pnlHeader.unbind('mousemove.taskPicker');
			pnlHeader.unbind('mouseup.taskPicker');
			$(document).unbind('mousemove.document');
			$(document).unbind('mouseup.document');
			moving = false;
		}
		function showGroups() {
			pnlGroupList = $('<div class="tp-groupList" />').appendTo(pnlBody);

			$.getJSON('/group/list', function(data) {
						$(data.rows).each(function(i, row) {
									addGroup(row);
								});
					});
					
			function addGroup(row) {
				var pnlGroup = $('<div class="tp-group" />').appendTo(pnlGroupList);
				var dTitle = $('<div class="tp-group-title" />').appendTo(pnlGroup);
				var dList = $('<ul class="tp-group-list" />').appendTo(pnlGroup);
				dTitle.text(row.subject);
				dTitle.click(function(){
					dList.toggle();
				});
				showTasks(row._id, dList);
			}					
		}
		
		function showTasks(groupId, dList){
			$.getJSON('/task/list', {groupId:groupId}, function(data) {
						$(data.rows).each(function(i, row) {
							var li = $('<li class="tp-task" />').appendTo(dList);
							li.text(row.subject);
						});
					});
			
		}
		
		$(function(){
			init();
		})
	})();
})(jQuery);


















