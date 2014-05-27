/**
 * combo - jQuery EasyUI
 * 
 * Licensed under the GPL: http://www.gnu.org/licenses/gpl.txt
 * 
 * Copyright 2010 stworthy [ stworthy@gmail.com ]
 * 
 * Dependencies: panel validatebox
 * 
 */
(function($) {
	function setSize(target, width) {
		var opts = $.data(target, 'combo').options;
		var combo = $.data(target, 'combo').combo;
		var panel = $.data(target, 'combo').panel;

		if (width)
			opts.width = width;

		if (isNaN(opts.width)) {
			opts.width = combo.find('input.combo-text').outerWidth();
		}
		var arrowWidth = combo.find('.combo-arrow').outerWidth();
		var width = opts.width - arrowWidth;
		combo.find('input.combo-text').width(width);

		panel.panel('resize', {
			width : (opts.panelWidth || combo.outerWidth()),
			height : opts.panelHeight
		});
	}

	/**
	 * create the combo component.
	 */
	function init(target) {
		$(target).hide();

		var span = $('<span class="combo"></span>').insertAfter(target);
		var input = $('<input type="text" class="combo-text">').appendTo(span);
		$('<span><span class="combo-arrow"></span></span>').appendTo(span);
		$('<input type="hidden" class="combo-value">').appendTo(span);
		var panel = $('<div class="combo-panel"></div>').appendTo('body');
		panel.panel({
			doSize : false,
			closed : true,
			style : {
				position : 'absolute'
			},
			onOpen : function() {
				$(this).panel('resize');
			}
		});

		var name = $(target).attr('name');
		if (name) {
			span.find('input.combo-value').attr('name', name);
			$(target).removeAttr('name').attr('componentName', name);
		}
		input.attr('autocomplete', 'off');

		return {
			combo : span,
			panel : panel
		};
	}

	function destroy(target) {
		$.data(target, 'combo').panel.panel('destroy');
		$.data(target, 'combo').combo.remove();
		$(target).remove();
	}

	function bindEvents(target) {
		var opts = $.data(target, 'combo').options;
		var combo = $.data(target, 'combo').combo;
		var panel = $.data(target, 'combo').panel;
		var input = combo.find('.combo-text');
		input.data("combo_target",target);
		var arrow = combo.find('.combo-arrow');

		$(document).unbind('.combo');
		combo.unbind('.combo');
		panel.unbind('.combo');
		input.unbind('.combo');
		arrow.unbind('.combo');

		if (!opts.disabled) {
			$(document).unbind(".combo").bind("mousedown.combo", function(e) {
				$("div.combo-panel").panel("close");
				$.initEvent(e);
				var temp=$(e.src);
				var t=temp.data("combo_target");
				if(t){
						$.data(t, 'combo').panel.panel("open");
				}
			});
			panel.bind('mousedown.combo', function(e) {
				return false;
			});

			input.bind('focus.combo', function() {
				showPanel(target);
			}).bind('mousedown.combo', function(e) {
				//input.attr("curDown",true);
				//������
			}).bind('keyup.combo', function(e) {
				switch (e.keyCode) {
				case 37: // left
					opts.selectPrev.call(target);
					break;
				case 38: // up
					opts.selectPrev.call(target);
					break;
				case 39: // right
					opts.selectNext.call(target);
					break;
				case 40: // down
					opts.selectNext.call(target);
					break;
				case 13: // enter
					opts.selectCurr.call(target);
					break;
				case 27: // esc
					hidePanel(target);
					break;
				default:
//					if (navigator.userAgent.indexOf("MSIE") == -1){
//						if (opts.editable) {
//							opts.filter.call(target, $(this).val());
//						}
//					}
					if (opts.editable) {
						opts.filter.call(target, $(this).val());
					}
					break;
				}
				return false;
			});
			//
//			input.bind('input', function() {
//				if (opts.editable) {
//					opts.filter.call(target, $(this).val());
//				}
//			})
			arrow.bind("mousedown",function(e){
				e.stopPropagation();
			})
			arrow.bind('click.combo', function(e) {
				var panel = $.data(target, 'combo').panel;
				var isShow=false;
				if(panel&&panel.parent().length&&panel.parent().get(0).style.display=="block"){
					isShow=true;
				}
				$(document.body).children("div.panel").each(function(){
					var temp=$(this);
					if(!temp.hasClass("window"))
						temp.hide();
				});
				if(!isShow){
					showPanel(target);
				}
				//input.focus();
			}).bind('mouseenter.combo', function() {
				$(this).addClass('combo-arrow-hover');
			}).bind('mouseleave.combo', function() {
				$(this).removeClass('combo-arrow-hover');
			});
		}
	}

	/**
	 * show the drop down panel.
	 */
	function showPanel(target) {
		var combo = $.data(target, 'combo').combo;
		var panel = $.data(target, 'combo').panel;
		var options = $.data(target, 'combo').options;
		if ($.fn.window) {
			panel.panel('panel').css('z-index', $.fn.window.defaults.zIndex++);
		}
		panel.panel('open');
		options.onShowPanel.call(target);

		(function() {
			if (panel.is(':visible')) {
				var top = combo.offset().top + combo.outerHeight();
				if (top + panel.outerHeight() > $(window).height()
						+ $(document).scrollTop()) {
					top = combo.offset().top - panel.outerHeight();
				}
				if (top < $(document).scrollTop()) {
					top = combo.offset().top + combo.outerHeight();
				}
				panel.panel('move', {
					left : combo.offset().left,
					top : top
				});
				setTimeout(arguments.callee, 200);
			}
		})();
	}

	/**
	 * hide the drop down panel.
	 */
	function hidePanel(target) {
		var panel = $.data(target, 'combo').panel;
		var options = $.data(target, 'combo').options;
		panel.panel('close');
		options.onHidePanel.call(target);
	}

	function validate(target, doit) {
		if ($.fn.validatebox) {
			var opts = $.data(target, 'combo').options;
			var input = $.data(target, 'combo').combo.find('input.combo-text');
			input.validatebox(opts);
			if (doit) {
				input.validatebox('validate');
				input.trigger('mouseleave');
			}
		}
	}

	function setDisabled(target, disabled) {
		var opts = $.data(target, 'combo').options;
		var combo = $.data(target, 'combo').combo;
		if (disabled) {
			opts.disabled = true;
			$(target).attr('disabled', true);
			combo.find('.combo-value').attr('disabled', true);
			combo.find('.combo-text').attr('disabled', true);
		} else {
			opts.disabled = false;
			$(target).removeAttr('disabled');
			combo.find('.combo-value').removeAttr('disabled');
			combo.find('.combo-text').removeAttr('disabled');
		}
	}

	function clear(target) {
		var combo = $.data(target, 'combo').combo;
		combo.find('input.combo-value:gt(0)').remove();
		combo.find('input.combo-value').val('');
		combo.find('input.combo-text').val('');
	}

	function getText(target) {
		var combo = $.data(target, 'combo').combo;
		return combo.find('input.combo-text').val();
	}

	function setText(target, text) {
		var opts = $.data(target, 'combo').options;
		var combo = $.data(target, 'combo').combo;
		combo.find('input.combo-text').val(text);
		validate(target, true);
		opts.onTextChange.call(target, text);
	}

	function getValues(target) {
		var values = [];
		var combo = $.data(target, 'combo').combo;
		combo.find('input.combo-value').each(function() {
			values.push($(this).val());			
		});
		return values;
	}

	function setValues(target, values) {
		var opts = $.data(target, 'combo').options;
		var oldValues = getValues(target);

		var combo = $.data(target, 'combo').combo;
		combo.find('input.combo-value').remove();
		var name = $(target).attr('componentName');
		for ( var i = 0; i < values.length; i++) {
			var input = $('<input type="hidden" class="combo-value">')
					.appendTo(combo);
			if (name)
				input.attr('name', name);
			input.val(values[i]);
		}

		var tmp = [];
		for ( var i = 0; i < oldValues.length; i++) {
			tmp[i] = oldValues[i];
		}
		var aa = [];
		for ( var i = 0; i < values.length; i++) {
			for ( var j = 0; j < tmp.length; j++) {
				if (values[i] == tmp[j]) {
					aa.push(values[i]);
					tmp.splice(j, 1);
					break;
				}
			}
		}

		if (aa.length != values.length || values.length != oldValues.length) {
			if (opts.multiple) {
				opts.onChange.call(target, values, oldValues);
			} else {
				opts.onChange.call(target, values[0], oldValues[0]);
			}
		}
	}

	function getValue(target) {
		var values = getValues(target);
		return values[0];
	}

	function setValue(target, value) {
		if(value instanceof Array){ //可直接替代setValues
			setValues(target, value);
		}
		else{
			setValues(target, [ value ]);
		}
	}

	/**
	 * parse options from markup.
	 */

	$.fn.combo = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.combo.methods[options](this, param);
		}

		options = options || {};
		return this.each(function() {
			var state = $.data(this, 'combo');
			if (state) {
				$.extend(state.options, options);
			} else {
				var r = init(this);
				state = $.data(this, 'combo', {
					options : $.extend({}, $.fn.combo.defaults,
							$.fn.combo.parseOptions(this), options),
					combo : r.combo,
					panel : r.panel
				});
				$(this).removeAttr('disabled');
			}
			$('input.combo-text', state.combo).attr('readonly',
					!state.options.editable);
			setDisabled(this, state.options.disabled);
			setSize(this);
			bindEvents(this);
			validate(this);
		});
	};

	$.fn.combo.parseOptions = function(target) {
		var t = $(target);
		return $.extend($.fn.validatebox.parseOptions(target), {
			width : (parseInt(target.style.width) || undefined),
			panelWidth : (parseInt(t.attr('panelWidth')) || undefined),
			panelHeight : (t.attr('panelHeight') == 'auto' ? 'auto'
					: parseInt(t.attr('panelHeight')) || undefined),
					separator : (t.attr('separator') || undefined),
					multiple : (t.attr('multiple') ? (t.attr('multiple') == 'true' || t
							.attr('multiple') == true) : undefined),
							editable : (t.attr('editable') ? t.attr('editable') == 'true'
								: undefined),
								disabled : (t.attr('disabled') ? true : undefined)
		});
	}
	
	$.fn.combo.methods = {
		parseOptions : function(jq) {
			return $.fn.combo.parseOptions(jq[0]);
		},
		options : function(jq) {
			return $.data(jq[0], 'combo').options;
		},
		panel : function(jq) {
			return $.data(jq[0], 'combo').panel;
		},
		textbox : function(jq) {
			return $.data(jq[0], 'combo').combo.find('input.combo-text');
		},
		destroy : function(jq) {
			return jq.each(function() {
				destroy(this);
			});
		},
		resize : function(jq, width) {
			return jq.each(function() {
				setSize(this, width);
			});
		},
		showPanel : function(jq) {
			return jq.each(function() {
				showPanel(this);
			});
		},
		hidePanel : function(jq) {
			return jq.each(function() {
				hidePanel(this);
			});
		},
		disable : function(jq) {
			return jq.each(function() {
				setDisabled(this, true);
				bindEvents(this);
			});
		},
		enable : function(jq) {
			return jq.each(function() {
				setDisabled(this, false);
				bindEvents(this);
			});
		},
		clear : function(jq) {
			return jq.each(function() {
				clear(this);
			});
		},
		validate : function(jq) {
			return jq.each(function() {
				validate(this, true);
			});
		},
		isValid : function(jq) {
			var _57 = $.data(jq[0], "combo").combo.find("input.combo-text");
			return _57.validatebox("isValid");
		},
		getText : function(jq) {
			return getText(jq[0]);
		},
		setText : function(jq, text) {
			return jq.each(function() {
				setText(this, text);
			});
		},
		getValues : function(jq) {
			return getValues(jq[0]);
		},
		setValues : function(jq, values) {
			return jq.each(function() {
				setValues(this, values);
			});
		},
		getValue : function(jq) {
			return getValue(jq[0]);
		},
		setValue : function(jq, value) {
			return jq.each(function() {
				setValue(this, value);
			});
		}
	};

	$.fn.combo.defaults =  $.extend({}, $.fn.validatebox.defaults, {
		width : 'auto',
		panelWidth : null,
		panelHeight : 200,
		multiple : false,
		separator : ',',
		editable : true,
		disabled : false,
		required : false,
		missingMessage : '必须填写',

		selectPrev : function() {
		},
		selectNext : function() {
		},
		selectCurr : function() {
		},
		filter : function(query) {
		},

		onChange : function(newValue, oldValue) {
		},
		onTextChange:function(){
			
		},
		onShowPanel : function() {
		},
		onHidePanel : function() {
		}
	});
})(jQuery);
