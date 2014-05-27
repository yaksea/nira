(function($) {
	
	var boldKeywords = function(str, keywords) {
		var i = str.indexOf(keywords);
		if (i >= 0) {
			return str.substring(0, i) + '<b>'
					+ str.substr(i, keywords.length) + '</b>'
					+ str.substr(i + keywords.length);
		} else {
			return str
		}
	}
	
	var currentInstance = null;
	var instances = [];
	
	$.TagPicker = function(target, options) {
		this.query = '';
		this.bound = false;
		
		this.target = $(target).hide();
		this.options = options;
		
		this.container = $("<div class='tagPicker-container' />").insertAfter(this.target);
		
		this.showBox = $("<div class='tagPicker-showBox' />").appendTo(this.container);
		this.btnDropdown = $("<div class='tagPicker-btnDropdown' />").appendTo(this.showBox);
		this.label = $("<div class='tagPicker-label' />").appendTo(this.showBox);
		
		this.popup = $("<div class='tagPicker-popup' />").appendTo(this.container);
		
		this.keywordsBox = $("<div class='tagPicker-keywordsBox' />").appendTo(this.popup);
		this.keywordsInput = $("<div class='tagPicker-keywordsInput' />").appendTo(this.keywordsBox);
		this.btnSearch = $("<div class='tagPicker-btnSearch' />").appendTo(this.keywordsBox);
		
		this.pnlList = $("<div class='tagPicker-pnlList' />").appendTo(this.popup);
		this.btnMore = $("<div class='tagPicker-btnMore' />").appendTo(this.popup);
		
		this.initProperties();
		this.initialized = false;
		this.bindData();
		this.bindEvents();

		var _this = this;
				
		this.showBox.click(function() {
//			$(this).text('...');
			_this.toggle();
		})
		this.target.data('tagPicker', this);
		instances.push(this);
	}

	$.TagPicker.prototype = {			
		status : 0,//0:collapsed, 1: expanded, 
			
		toggle : function(){
			if(this.popup.is(':visible')){	
				this.close();
			}
			else{
				this.popup.show();
				this.status = 1;
			}
		},
		close : function(){
			this.popup.hide();
			this.label.text(this.getText());
			if(this==currentInstance){
				currentInstance = null;					
			}
			this.status = 0;
		},
		setSize : function(){
			this.popup.width(this.showBox.outerWidth());
		},
		setValue : function(value) {
//			console.info(value);
//			console.info(this.pnlList.children());
			var _this = this;
			if(!this.initialized){
				setTimeout(function(){_this.setValue(value)},500);
				return;
			}
			$.each(value, function(i, dataItem){
				_this.pnlList.find('.tag').each(function(i, tag){
					if(tag.attr('value')==dataItem){
						tag.addClass('selected');
					}
				})
			});	
			
		},

		setText : function(text) {
			this.label.text(text);
//			this.target.combo('setText', text);
		},

		getValue : function() {
			var val = []
			this.pnlList.find('.tag.selected').each(function(i,ele){
				val.push($(ele).attr('value'));
			})
			return val;
		},

		getText : function() {
			var val = []
			this.pnlList.find('.tag.selected').each(function(i,ele){
				val.push($(ele).text());
			})
			return val.join(',');
		},

		initProperties : function() {
			this.selectedRow = null;
			this.rowCount = 0;
			this.hasMore = false;
		},

		bindEvents : function() {
			var _this = this;
			$(document).unbind(".tagPicker").bind("mousedown.tagPicker",
					function(e) {
						if(!currentInstance){
							return;
						}
						if(!$(e.target).isChildOrSelfOf(currentInstance.container)){					
							$(instances).each(function(i, instance){
								if(instance.status==1){
									instance.close();
								}
							})
						}else{
							$(instances).each(function(i, instance){
								if(instance.status==1 && instance!=currentInstance){
									instance.close();
								}
							})
							
						}
					});
			this.container.bind('mousedown.tagPicker', function(e) {
				currentInstance = _this;
					});
		},
		bindData: function(){
			var _this = this;
			function dealWithData(data){
				$(data).each(function(i, dataItem){
					var tag = $('<span class="tag"/>').appendTo(_this.pnlList);
					tag.text(dataItem[_this.options.textField]);
					tag.attr('value', dataItem[_this.options.valueField]);
					tag.click(function(){
						tag.toggleClass('selected');
					})
				})
				_this.initialized = true;
			}
			
			this.pnlList.empty();
			if(this.options.data){
				dealWithData(this.options.data);			
			}
			else if(this.options.url){
				$.getJSON(this.options.url, function(data){
					this.options.data = data.rows
					dealWithData(data.rows);
				})
			}
			
		}

	}

	$.fn.tagPicker = function(options, param) {//此处this表jquery对象
		if (typeof options == 'string') {
			var method = options; 
			this.each(function() {
						var instance = $.data(this, 'tagPicker');
						if (instance) {
							if (instance[method]) {
								return instance[method](param);
							}
						}
					})
		}

		options = options || {};
		return this.each(function() {
					var instance = $.data(this, 'tagPicker');
					if (instance) {
						$.extend(instance.options, options);
					} else {
						var t = $(this);
						options = $.extend({}, $.fn.tagPicker.defaults, $.fn.tagPicker
										.parseOptions(this), options);

						instance = new $.TagPicker(this, options);
						
					}
				});
	};

	$.fn.tagPicker.parseOptions = function(target) {
		var t = $(target);
		return $.extend($.fn.validatebox.parseOptions(target), {
					valueField : (t.attr('valueField') || undefined),
					textField : (t.attr('textField') || undefined)
				});
	}

	$.fn.tagPicker.defaults = { 
		valueField : '_id',
		textField : 'name',
		url : null,
		data: null,
//		options: null,
//		optionsUrl: null,
		pageSize : 10,
		conditions : {},
		selectPrev : function() {//这边this都代表实例
//			var instance = $.data(this, 'tagPicker');
			this.selectRow(-1);
		},
		selectNext : function() {
//			var instance = $.data(this, 'tagPicker');
			this.selectRow(1);
		},
		selectCurr : function() {
//			var instance = $.data(this, 'tagPicker');
			this.selectRow();
		},
		filter : function(query) {
//			var instance = $.data(this, 'tagPicker');
			this.setValue('');
			this.bound = false;
			this.query = query;
			this.bindData();
		},
		onShowPanel : function() {
			var instance = $.data(this, 'tagPicker');
			if (!instance.bound) {
				instance.bindData();
			}
		},
		onSelectChange: function(rowData){
			
		},
		onBound: function(){//完成绑定后
//			var instance = $.data(this, 'tagPicker');
//			console.info(this);
		}
	};
})(jQuery);
