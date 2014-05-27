/**
 * dialog - jQuery EasyUI
 * 
 * Licensed under the GPL: http://www.gnu.org/licenses/gpl.txt
 * 
 * Copyright 2010 stworthy [ stworthy@gmail.com ]
 * 
 * Dependencies: window
 * 
 */
(function($) {
	/**
	 * wrap dialog and return content panel.
	 */
	function wrapDialog(target) {
		var t = $(target);
		t.wrapInner('<div class="dialog-content"></div>');
		var contentPanel = t.find('>div.dialog-content');

		contentPanel.css('padding', t.css('padding'));
		t.css('padding', 0);

		contentPanel.panel({
			border : false
		});

		return contentPanel;
	}

	/**
	 * build the dialog
	 */
	function buildDialog(target) {
		var opts = $.data(target, 'dialog').options;
		var contentPanel = $.data(target, 'dialog').contentPanel;

		$(target).find('div.dialog-toolbar').remove();
		if (opts.toolbar) {
			if (typeof opts.toolbar == "string") {
				$(opts.toolbar).addClass("dialog-toolbar").prependTo(target);
				$(opts.toolbar).show();
			} else {
				$(target).find("div.dialog-toolbar").remove();
				var toolbar = $('<div class="dialog-toolbar"></div>')
						.prependTo(target);
				for ( var i = 0; i < opts.toolbar.length; i++) {
					var p = opts.toolbar[i];
					if (p == '-') {
						toolbar
								.append('<div class="dialog-tool-separator"></div>');
					} else {
						var tool = $('<a href="javascript:void(0)"></a>')
								.appendTo(toolbar);
						tool.css('float', 'left').text(p.text);
						if (p.iconCls)
							tool.attr('icon', p.iconCls);
						if (p.handler)
							tool[0].onclick = p.handler;
						tool.linkbutton({
							plain : true,
							disabled : (p.disabled || false)
						});
					}
				}
				toolbar.append('<div style="clear:both"></div>');
			}
		}

		if (opts.buttons) {
			if (typeof opts.buttons == "string") {
				$(opts.buttons).addClass("dialog-button").appendTo(target);
				$(opts.buttons).show();
			} else {
				$(target).find("div.dialog-button").remove();
				var buttons = $('<div class="dialog-button"></div>').appendTo(
						target);
				for ( var i = 0; i < opts.buttons.length; i++) {
					var p = opts.buttons[i];
					var button = $('<a href="javascript:void(0)"></a>')
							.appendTo(buttons);
					if (p.handler)
						button[0].onclick = p.handler;
					button.linkbutton(p);
				}
			}
		}

		if (opts.href) {
			contentPanel.panel({
				href : opts.href,
				onLoad : opts.onLoad
			});

			opts.href = null;
		}
		
		$(target).window(
				$.extend({}, opts, {
					onResize : function(width, height) {
						var wbody = $(target).panel('panel').find(
								'>div.panel-body');

						contentPanel.panel('resize', {
							width : wbody.width(),
							height : (height == 'auto') ? 'auto' : wbody
									.height()
									- wbody.find('>div.dialog-toolbar')
											.outerHeight()
									- wbody.find('>div.dialog-button')
											.outerHeight()
						});

						if (opts.onResize)
							opts.onResize.call(target, width, height);
					}
				}));
	}

	function refresh(target) {
		var contentPanel = $.data(target, 'dialog').contentPanel;
		contentPanel.panel('refresh');
	}

	$.fn.dialog = function(options, param) {
		if (typeof options == 'string') {
			switch (options) {
			case 'options':
				return $(this[0]).window('options');
			case 'dialog':
				return $(this[0]).window('window');
			case 'refresh':
				return this.each(function() {
					refresh(this);
				});
			default:
				return this.window(options, param);
			}
		}

		options = options || {};
		return this.each(function() {
			var state = $.data(this, 'dialog');
			if (state) {
				$.extend(state.options, options);
			} else {
				var t = $(this);
				var opts = $.extend({}, $.fn.dialog.defaults, $.fn.dialog
						.parseOptions(this), options);
				$.data(this, 'dialog', {
					options : opts,
					contentPanel : wrapDialog(this)
				});
			}
			buildDialog(this);
		});
	};
	$.fn.dialog.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.fn.window.parseOptions(target), {
			toolbar : t.attr("toolbar"),
			buttons : t.attr("buttons")
		});
	};
	$.fn.dialog.defaults = {
		title : 'New Dialog',
		href : null,
		collapsible : false,
		minimizable : false,
		maximizable : false,
		resizable : false,
		toolbar : null,
		buttons : null
	};
})(jQuery);