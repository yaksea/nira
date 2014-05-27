/**
 * form - jQuery EasyUI
 * 
 * Licensed under the GPL: http://www.gnu.org/licenses/gpl.txt
 * 
 * Copyright 2010 stworthy [ stworthy@gmail.com ]
 */
(function($) {
	/**
	 * submit the form
	 */
	function ajaxSubmit(target, options) {
		options = options || {};

		if (options.onSubmit) {
			if (options.onSubmit.call(target) == false) {
				return;
			}
		}

		var form = $(target);
		if (options.url) {
			form.attr('action', options.url);
		}
		var frameId = 'easyui_frame_' + (new Date().getTime());
		var frame = $(
				'<iframe id=' + frameId + ' name=' + frameId + '></iframe>')
				.attr(
						'src',
						window.ActiveXObject ? 'javascript:false'
								: 'about:blank').css({
					position : 'absolute',
					top : -1000,
					left : -1000
				});
		var t = form.attr('target'), a = form.attr('action');
		form.attr('target', frameId);
		try {
			frame.appendTo('body');
			frame.bind('load', cb);
			form[0].submit();
		} finally {
			form.attr('action', a);
			t ? form.attr('target', t) : form.removeAttr('target');
		}

		var checkCount = 10;
		function cb() {
			frame.unbind();
			var body = $('#' + frameId).contents().find('body');
			var data = body.html();
			if (data == '') {
				if (--checkCount) {
					setTimeout(cb, 100);
					return;
				}
				return;
			}
			var ta = body.find('>textarea');
			if (ta.length) {
				data = ta.value();
			} else {
				var pre = body.find('>pre');
				if (pre.length) {
					data = pre.html();
				}
			}
			if (options.success) {
				options.success(data);
			}
			// try{
			// eval('data='+data);
			// if (options.success){
			// options.success(data);
			// }
			// } catch(e) {
			// if (options.failure){
			// options.failure(data);
			// }
			// }
			setTimeout(function() {
				frame.unbind();
				frame.remove();
			}, 100);
		}
	}
	function submit(target, extraData){
		var options = $.data(target, 'form').options;
		var data = getValue(target);
		if(extraData){
			$.extend(data, extraData);
		}
		var url = options.url || window.location.href;
		$.postJSON(url, data, function(returnData){
			if (options.success) {
				options.success(returnData);
			}
		});
	}
	function getValue(target){
		var options = $.data(target, 'form').options;
		if (options.onSubmit) {
			if (options.onSubmit.call(target) == false) {
				return;
			}
		}
		
		var form = $(target);
		var data = {};
		form.find('input,select').each(function(i, ele){
			var name = ele.name || ele.id;
			if(name){
				if($.inArray(ele.type,['checkbox','radio'])>=0){
					if(ele.checked){
						data[name] = ele.value;
					}
				}
				else{
					data[name] = ele.value;
				}
			}
		});
		$('.easyui-component').each(function(i, ele){
			var $ele = $(ele);
			var name = $ele.attr('name') || ele.id;
			var componentType = $ele.attr('componentType');
			if(name&&componentType&&$ele[componentType]('getValue')!=null){				
				data[name] = $ele[componentType]('getValue');			
			}
		});
		
		return data;
	}
	/**
	 * load form data if data is a URL string type load from remote site,
	 * otherwise load from local data object.
	 */
	function bind(target, data) {
		var $target = (target);
		var form = $target;
		if (typeof data == 'string') {
			$.ajax({
				url : data,
				dataType : 'json',
				success : function(data) {
					_bind(data);
				}
			});
		} else {
			_bind(data);
		}

		function _bind(data) {
			for (var name in data) {
				var val = data[name];
				var ele = form.find('[name="' + name + '"]');
				if(ele.hasClass['easyui-component']){
					var componentType = ele.attr("componentType");
					ele[componentType]('setValue', val);
					
				}
				else if($.inArray(ele.attr('type'), ['radio', 'checkbox'])){
					_bindOptions(ele, val);
				}
				else{
					ele.val(val);
				}
				

			}
		}
		function _bindOptions(ele, val) {
			$.fn.prop ? ele.prop("checked", false) : ele.attr("checked", false);
			ele.each(function() {
				var f = $(this);
				if (f.val() == String(val)) {
					$.fn.prop ? f.prop("checked", true) : f.attr("checked",
							true);
				}
			});
			return ele;
		}
	}

	/**
	 * clear the form fields
	 */
	function clear(target) {
		$('input,select,textarea', target).each(function() {
			// $this = $(this);
			// if($this.hasClass('easyui-validatebox')){
			// $this.validatebox('clear');
			// }
			// else{
			var t = this.type, tag = this.tagName.toLowerCase();
			if (t == 'text' || t == 'password' || tag == 'textarea')
				this.value = '';
			else if (t == 'checkbox' || t == 'radio')
				this.checked = false;
			else if (tag == 'select')
				this.selectedIndex = -1;
			// }

		});
	}
	function validate(target) {
		if ($.fn.validatebox) {
			var box = $(".validatebox-text", target);
			if (box.length) {
				box.validatebox("validate");
//				box.trigger("focus");
//				box.trigger("blur");
//				var invalidEle = $(".validatebox-invalid:first", target).focus();
//				return invalidEle.length == 0;
				var invalidEle = $(".validatebox-invalid:first", target);
				return invalidEle.length == 0;
			}
		}
		return true;
	}
	/**
	 * set the form to make it can submit with ajax.
	 */
	function setForm(target) {
		var options = $.data(target, 'form').options;
		var form = $(target);
		form.unbind('.form').bind('submit.form', function() {
			ajaxSubmit(target, options);
			return false;
		});
	}

	$.fn.form = function(options, param) {
		if (typeof options == 'string') {
			switch (options) {
			case 'submit':
				return this.each(function() {
					submit(this, param);
				});
			case 'bind':
				return this.each(function() {
					bind(this, param);
				});
			case 'getValue':
					return getValue(this);
			case 'validate':
				return validate(this);
			case 'clear':
				return this.each(function() {
					clear(this);
				});
			}
		}

		options = options || {};
		return this.each(function() {
			if (!$.data(this, 'form')) {
				$.data(this, 'form', {
					options : $.extend({}, $.fn.form.defaults, options)
				});
			}
			setForm(this);
		});
	};

	$.fn.form.defaults = {
		url : null,
		onSubmit : function() {
		},
		success : function(data) {
		}
	};
})(jQuery);