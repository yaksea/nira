/**
 * datebox - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	 calendar
 *   combo
 * 
 */
(function($){
	/**
	 * create date box
	 */
	function createBox(target){
		var state = $.data(target, 'datebox');
		var opts = state.options;
		
		$(target).combo($.extend({}, opts, {
			onShowPanel:function(){
				state.calendar.calendar('resize');
				opts.onShowPanel.call(target);
			}
		}));
		var textbox = $(target).combo('textbox');
		textbox.attr('readonly','readonly');
		textbox.parent().addClass('datebox');
		
		/**
		 * if the calendar isn't created, create it.
		 */
		if (!state.calendar){
			createCalendar();
		}
		function createCalendar(){
			var panel = $(target).combo('panel');
			state.calendar = $('<div></div>').appendTo(panel).wrap('<div class="datebox-calendar-inner"></div>');
			state.calendar.calendar({
				fit:true,
				border:false,
				onSelect:function(date){
					var value = opts.formatter(date);
					setValue(target, value);
					$(target).combo('hidePanel');
					opts.onSelect.call(target, date);
				}
			});
			setValue(target, opts.value);
			
			var button = $('<div class="datebox-button"></div>').appendTo(panel);
			$('<a href="javascript:void(0)" class="datebox-current"></a>').html(opts.currentText).appendTo(button);
			$('<a href="javascript:void(0)" class="datebox-close"></a>').html(opts.closeText).appendTo(button);
			button.find('.datebox-current,.datebox-close').hover(
					function(){$(this).addClass('datebox-button-hover');},
					function(){$(this).removeClass('datebox-button-hover');}
			);
			button.find('.datebox-current').click(function(){
				if(opts.todayBack){
					var value = opts.formatter(new Date());
					setValue(target,value);
					$(target).combo('hidePanel');
					opts.onToday.call(target,new Date());
				}
				state.calendar.calendar({
					year:new Date().getFullYear(),
					month:new Date().getMonth()+1,
					current:new Date()
				});
			});
			button.find('.datebox-close').click(function(){
				$(target).combo('hidePanel');
			});
		}
	}
	
	/**
	 * called when user inputs some value in text box
	 */
	function doQuery(target, q){
		setValue(target, q);
	}
	
	/**
	 * called when user press enter key
	 */
	function doEnter(target){
		var opts = $.data(target, 'datebox').options;
		var c = $.data(target, 'datebox').calendar;
		var value = opts.formatter(c.calendar('options').current);
		setValue(target, value);
		$(target).combo('hidePanel');
	}
	
	function setValue(target, value){
//		value = $.getDateString(value);
		var state = $.data(target, 'datebox');
		var opts = state.options;
		$(target).combo('setValue', value).combo('setText', value);
		state.calendar.calendar('moveTo', opts.parser(value));
		var cfg=$(target).data("relaValidCfg");
		if(cfg){
			for(var item in cfg){
				cfg[item].validatebox("validate");
			}
		}
	}
	
	$.fn.datebox = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.datebox.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}
		options = options || {};
		return this.each(function(){
			var state = $.data(this, 'datebox');
			if (state){
				$.extend(state.options, options);
			} else {
				$.data(this, 'datebox', {
					options: $.extend({}, $.fn.datebox.defaults, $.fn.datebox.parseOptions(this), options)
				});
			}
			createBox(this);
		});
	};
	
	$.fn.datebox.methods = {
		options: function(jq){
			return $.data(jq[0], 'datebox').options;
		},
		calendar: function(jq){	// get the calendar object
			return $.data(jq[0], 'datebox').calendar;
		},
		setValue: function(jq, value){
			return jq.each(function(){
				setValue(this, value);
			});
		}
	};
	
	$.fn.datebox.parseOptions = function(target){
		var t = $(target);
		return $.extend({}, t.combo('parseOptions'), {
		});
	};
	
	$.fn.datebox.defaults = $.extend({}, $.fn.combo.defaults, {
		panelWidth:180,
		panelHeight:'auto',
		//点击今天时 直接返回 默认为true 
		todayBack:true,
		keyHandler: {
			up:function(){},
			down:function(){},
			enter:function(){doEnter(this);},
			query:function(q){doQuery(this, q);}
		},
		currentText:'Today',
		closeText:'Close',
		okText:'Ok',
		
		formatter:function(date){
			var y = date.getFullYear();
			var m = date.getMonth()+1;
			var d = date.getDate();
			return m+'/'+d+'/'+y;
		},
		parser:function(s){
			var t = Date.parse(s);
			if (!isNaN(t)){
				return new Date(t);
			} else {
				return new Date();
			}
		},
		onToday:function(date){},
		onSelect:function(date){}
	});
})(jQuery);
