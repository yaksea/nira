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
	
	$.SearchBox = function(target, options) {
		this.query = '';
		this.bound = false;
		
		this.target = $(target).hide();
		this.options = options;
		
		this.container = $("<div class='searchBox-container' />").insertAfter(this.target);
		
		this.showBox = $("<div class='searchBox-showBox' />").appendTo(this.container);
		this.btnDropdown = $("<div class='searchBox-btnDropdown' />").appendTo(this.showBox);
		this.label = $("<div class='searchBox-label' />").appendTo(this.showBox);
		
		this.popup = $("<div class='searchBox-popup' />").appendTo(this.container);
		
		this.keywordsBox = $("<div class='searchBox-keywordsBox' />").appendTo(this.popup);
		this.keywordsInput = $("<div class='searchBox-keywordsInput' />").appendTo(this.keywordsBox);
		this.btnSearch = $("<div class='searchBox-btnSearch' />").appendTo(this.keywordsBox);
		
		this.pnlList = $("<div class='searchBox-pnlList' />").appendTo(this.popup);
		this.btnMore = $("<div class='searchBox-btnMore' />").appendTo(this.popup);
		
		this.initProperties();
		this.bindData();
		this.bindEvents();

		var _this = this;
		this.btnMore.click(function() {
					$(this).text('...');
					_this.bindData();
				})
				
		this.showBox.click(function() {
//			$(this).text('...');
			_this.toggle();
		})
		this.target.data('searchBox', this);
	}

	$.SearchBox.prototype = {			
		status : 0,//0:collapsed, 1: expanded, 
			
		toggle : function(){
//			if(this.status){
				this.popup.toggle();
				currentInstance = null;
//			}
//			else
		},
		setSize : function(){
			this.popup.width(this.showBox.outerWidth());
		},
		setValue : function(value) {
//			console.info(value);
//			console.info(this.pnlList.children());
			var _this = this;
			this.pnlList.children().each(function(i, row){
				var $row = $(row);
//				console.info($row);
				if($row.data('rowData')[_this.options.valueField]==value){
					_this.selectRow($row);
				}
			})
//			this.target.combo('setValue', value);
		},

		setText : function(text) {
			this.label.text(text);
//			this.target.combo('setText', text);
		},

		getValue : function() {
//			console.info(this.selectedRow.data('rowData'));
			return this.selectedRow.data('rowData')[this.options.valueField];
		},

		getText : function() {
			return this.selectedRow.data('rowData')[this.options.textField];
		},

		initProperties : function() {
			this.selectedRow = null;
			this.rowCount = 0;
			this.hasMore = false;
		},

		bindEvents : function() {
			var _this = this;
			$(document).bind("mousedown.searchBox",
					function(e) {
						if(_this!=currentInstance){						
							_this.popup.hide();
						}
//						$('.searchBox-popup').hide();
//						if (!_this.getValue()) {
//							this.setText('');
//							this.query = "";
//						}
					});
			this.container.bind('mousedown.searchBox', function(e) {
				currentInstance = _this;
//				return false;
//						_this.popup.addClass('cu false;
					});
		},
		selectRow: function(row){
			if(row){
				this.selectedRow = row;
				var rowData = row.data('rowData');
				this.setText(rowData[this.options.textField]);
	//			console.info(rowData);
				this.options.onSelectChange.call(this, rowData);
			}
		},
		selectIndex: function(index){
			var _this = this;
			
			this.selectRow($(this.pnlList.children()[0]));
			
		},
		bindRow : function(i, dataItem){
//			console.info(this);
			var _this = this;
			var $row = $('<div>').appendTo(this.pnlList);
			this.rowCount++;
			var text = dataItem[this.options.textField];
			$row.data('rowData', dataItem);

			$row.addClass('searchBox-row');

			if (this.query) {
				text = boldKeywords(text, this.query);
			}

			$row.html(text);
			$row.click(function() {
						_this.selectRow($row);
						_this.toggle();
					})
			var mouseoverHandler = null;		
		},
		rebindData : function(){
			this.bound = false;
			this.bindData();
		
		},
		bindData : function() {	
			var _this = this;

			this.pnlList.empty();

			if(this.options.data){
				$.each(this.options.data, function(i, dataItem){
					_this.bindRow(i, dataItem);
				});
				_this.bound = true;
				_this.setSize();
				_this.options.onBound.call(_this);
				return;
			}
			var qParams = $.extend({
						q : this.query
					}, this.options.conditions);


			var url = this.options.url + '?' + $.param(qParams);
			if(this.lastQuery==url){
				return;
			}
			else{
				this.lastQuery = url;
			}
			var _this = this;
			$.getJSON(url, function(data) {
				$.each(data.rows, function(i, dataItem){
					_this.bindRow(i, dataItem);
				});

				_this.bound = true;
				_this.setSize();
				_this.options.onBound.call(_this);
			});
		}
	}

	$.fn.searchBox = function(options, param) {//此处this表jquery对象
		if (typeof options == 'string') {
			var method = options; 
			var instance = this.data('searchBox');
			if (instance) {
				if (instance[method]) {
					return instance[method](param);
				}
			}
			return null
		}

		options = options || {};
		return this.each(function() {
					var instance = $.data(this, 'searchBox');
					if (instance) {
						$.extend(instance.options, options);
					} else {
						var t = $(this);
						options = $.extend({}, $.fn.searchBox.defaults, $.fn.searchBox
										.parseOptions(this), options);

						instance = new $.SearchBox(this, options);
						
					}
				});
	};

	$.fn.searchBox.parseOptions = function(target) {
		var t = $(target);
		return $.extend($.fn.validatebox.parseOptions(target), {
					valueField : (t.attr('valueField') || undefined),
					textField : (t.attr('textField') || undefined)
				});
	}

	$.fn.searchBox.defaults = { 
		valueField : '_id',
		textField : 'name',
		url : null,
		data: null,
		pageSize : 10,
		conditions : {},
		selectPrev : function() {//这边this都代表实例
//			var instance = $.data(this, 'searchBox');
			this.selectRow(-1);
		},
		selectNext : function() {
//			var instance = $.data(this, 'searchBox');
			this.selectRow(1);
		},
		selectCurr : function() {
//			var instance = $.data(this, 'searchBox');
			this.selectRow();
		},
		filter : function(query) {
//			var instance = $.data(this, 'searchBox');
			this.setValue('');
			this.bound = false;
			this.query = query;
			this.bindData();
		},
		onShowPanel : function() {
			var instance = $.data(this, 'searchBox');
			if (!instance.bound) {
				instance.bindData();
			}
		},
		onSelectChange: function(rowData){
			
		},
		onBound: function(){//完成绑定后
//			var instance = $.data(this, 'searchBox');
//			console.info(this);
		}
	};
})(jQuery);
