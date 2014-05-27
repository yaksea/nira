(function($) {
	
	boldKeywords = function(str, keywords) {
		var i = str.indexOf(keywords);
		if (i >= 0) {
			return str.substring(0, i) + '<b>'
					+ str.substr(i, keywords.length) + '</b>'
					+ str.substr(i + keywords.length);
		} else {
			return str
		}
	}

	$.ComboPicker = function(target, options) {
		this.query = '';
		this.bound = false;
		
		this.target = target;
		this.initProperties();

		this.options = options;
		this.combo = $(target).combo(this.options);
		this.pnlContainer = $(target).combo('panel').empty();

		this.textbox = $(target).combo('textbox');

		this.pnlList = $('<div>').appendTo(this.pnlContainer);
		this.btnMore = $('<div>').appendTo(this.pnlContainer);

		this.btnMore.addClass('comboPicker-btnMore');
		var _this = this;
		this.btnMore.click(function() {
					$(this).text('...');
					_this.bindData();
				})
	}

	$.ComboPicker.prototype = {			
		selectRow : function(step, close) {
			if (typeof step === "number") {
				$(this.target).combo('showPanel');
				
				if (this.selectedRow) {
					var rowTop = $(this.selectedRow).position().top;
					var supposedTop = 0;
					if (rowTop < 5
							|| rowTop > (this.options.panelHeight - 19 - step * 2)) {
						supposedTop = this.pnlContainer.scrollTop() + rowTop;
						if (step < 0) {// 往上
							supposedTop -= (this.options.panelHeight - 19 - step * 2);
						}
						this.pnlContainer.animate({
									scrollTop : supposedTop
								}, 'slow');
					}
				}

				if (step > 0) { // 往下
					if (this.selectedRow) {

						$(this.selectedRow)
								.removeClass('comboPicker-row-selected');
						var next = $(this.selectedRow).next();
						if (next.length) {
							this.selectedRow = next;
						} else if (this.hasMore) {
							this.bindData(target);
						}
					} else { // 初次
						var first = this.pnlList.children(':first');
						if (first.length) {
							this.selectedRow = first;
						}
					}

				} else {// 往上
					if (this.selectedRow) {
						$(this.selectedRow)
								.removeClass('comboPicker-row-selected');
						var prev = $(this.selectedRow).prev();
						if (prev.length) {
							this.selectedRow = prev;
						}
					} else { // 初次
						this.selectedRow = this.pnlList.children(':last');
					}
				}
				$(this.selectedRow).addClass('comboPicker-row-selected');
			} else if (step == undefined) {
				this.setValue($(this.selectedRow).data('id'));
				this.setText($(this.selectedRow).data('text'));
				$(this.target).combo('hidePanel');
			} else if (typeof step === "object") {
				$(this.selectedRow)
						.removeClass('comboPicker-row-selected');
				this.selectedRow = step;
				$(this.selectedRow).addClass('comboPicker-row-selected');

				if (close) {
					this.setValue($(this.selectedRow).data('id'));
					this.setText($(this.selectedRow).data('text'));
					$(this.target).combo('hidePanel');
				}
			}
		},

		setValue : function(value) {
			$(this.target).combo('setValue', value);
		},

		setText : function(text) {
			$(this.target).combo('setText', text);
		},

		getValue : function() {
			return $(this.target).combo('getValue');
		},

		getText : function() {
			return $(this.target).combo('getText');
		},

		initProperties : function() {
			this.selectedRow = null;
			this.rowCount = 0;
			this.hasMore = false;
		},

		bindEvents : function() {
			$(document).unbind(".comboPicker").bind("mousedown.comboPicker",
					function(e) {
						if (!this.getValue()) {
							this.setText('');
							this.query = "";
						}
					});
			this.pnlContainer.bind('mousedown.comboPicker', function(e) {
						return false;
					});
		},

		bindData : function() {			
			if (!this.bound) {
				this.pnlList.empty();
				this.pnlContainer.scrollTop(0);
				this.initProperties();
			}

			var pageSize = this.options.pageSize;
			if (this.rowCount) {
				pageSize--;
			}

			var qParams = $.extend({
						q : this.query,
						i : this.rowCount,
						l : pageSize
					}, this.options.conditions);

			var url = this.options.url + '?' + $.param(qParams);
			var _this = this;
			$.getJSON(url, function(data) {
				$.each(data.rows, function(i, dataItem) {
							var $row = $('<div>').appendTo(_this.pnlList);
							_this.rowCount++;
							var text = dataItem[_this.options.textField];
							$row.data('id', dataItem[_this.options.idField]);
							$row.data('text', text);

							$row.addClass('comboPicker-row');

							if (_this.query) {
								text = boldKeywords(text, _this.query);
							}

							$row.html(text);
							$row.click(function() {
										_this.selectRow(this, true);
									})
							var mouseoverHandler = null;
							$row.mouseover(function() {
										mouseoverHandler = setTimeout(
												function() {
													_this.selectRow($row
																	.get(0));
												}, 500)
									}).mouseout(function() {
										clearTimeout(mouseoverHandler);
									});

						})
				if (_this.rowCount > pageSize) {
					_this.pnlContainer.animate({
								scrollTop : _this.pnlContainer.scrollTop() + 1000
							}, 'slow');
				}
				if (data.rows.length < pageSize) {
					_this.btnMore.hide();
					_this.hasMore = false;
				} else {
					_this.btnMore.show();
					_this.btnMore.text(_this.options.moreText);
					_this.hasMore = true;
				}
				_this.bound = true;
			});

			

		}
	}

	$.fn.comboPicker = function(options, param) {
		if (typeof options == 'string') {
			var method = options; 
			this.each(function() {
						var instance = $.data(this, 'comboPicker');
						if (instance) {
							if (instance[method]) {
								return instance[method](param);
							} else if ($.fn.combo.methods[method]) {
								return $.fn.combo.methods[method]($(this), param);
							}
						}
					})
		}

		options = options || {};
		return this.each(function() {
					var instance = $.data(this, 'comboPicker');
					if (instance) {
						$.extend(instance.options, options);
						$.extend(instance.combo.options, options);
					} else {
						var t = $(this);
						options = $.extend({}, $.fn.combo.defaults,
								$.fn.comboPicker.defaults, $.fn.comboPicker
										.parseOptions(this), options);

						instance = new $.ComboPicker(this, options);

						$.data(this, 'comboPicker', instance);
					}
				});
	};

	$.fn.comboPicker.parseOptions = function(target) {
		var t = $(target);
		return $.extend($.fn.combo.parseOptions(target), {
					idField : (t.attr('idField') || undefined),
					textField : (t.attr('textField') || undefined)
				});
	}

	$.fn.comboPicker.defaults = {
		idField : null,
		textField : null,
		url : null,
		pageSize : 10,
		conditions : {},
		selectPrev : function() {
			var instance = $.data(this, 'comboPicker');
			instance.selectRow(-1);
		},
		selectNext : function() {
			var instance = $.data(this, 'comboPicker');
			instance.selectRow(1);
		},
		selectCurr : function() {
			var instance = $.data(this, 'comboPicker');
			instance.selectRow();
		},
		filter : function(query) {
			var instance = $.data(this, 'comboPicker');
			instance.setValue('');
			instance.bound = false;
			instance.query = query;
			instance.bindData();
		},
		onShowPanel : function() {
			var instance = $.data(this, 'comboPicker');
			if (!instance.bound) {
				instance.bindData();
			}
		}
	};
})(jQuery);
