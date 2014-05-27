/**
 * tooltip - jQuery EasyUI
 * 
 * Licensed under the GPL: http://www.gnu.org/licenses/gpl.txt
 * 
 * Copyright 2010 stworthy [ stworthy@gmail.com ]
 * 
 * Dependencies: panel validatebox
 * 
 */
(function($){
	
	var tooltips = [],
	curTips=null,
	reBgImage = /^url\(["']?([^"'\)]*)["']?\);?$/i,
	rePNG = /\.png$/i,
	ie6 = $.browser.msie && $.browser.version == 6;
	var toolKey=1;

	// make sure the tips' position is updated on resize
	function handleWindowResize() {
		//$.each(tooltips, function() {
		//	this.setPosition();
		//});
		if(curTips!=null){
			curTips.setPosition();
		}
	}
	$(window).resize(handleWindowResize);
	
	var $panel = null;
	
	$.Tooltip = function(content, options) {
		this.options = $.extend({}, $.fn.tooltip.defaults, options);
		
		if(!$panel){
			$panel = $('<div class="balloon" style="display: none;"><div style="position:relative;"> \
			        <div class="balloon_pointer"> \
					<div class="balloon_arrow_border"></div> \
			        <div class="balloon_arrow"></div>\
			      </div>  \
			      <div class="balloon_wrapper">\
					        <div class="balloon_content"> \
					        </div> \
					      </div> \
					    </div></div>').appendTo('body');
		}
		this.$panel = $panel;		
	
		this.$container = this.$panel.find('.balloon_content');
		this.$content = $(content);
		this.$content.data("toolTipKey",toolKey++);
		this.$pointer = this.$panel.find('.balloon_pointer');
		this.$refer = $(this.options.refer);
		this.showing = false;
		this.$wrapper=this.$panel.find('.balloon_wrapper');
		this.init();
		
				    
				    
	};

	$.Tooltip.prototype = {
		init: function() {
			tooltips.push(this);
//			this.setPointer();
			this.bindEvents();
		},
		initContent:function(){
			var content=$(this.$container);
			content.empty();
			content.append(this.$content);
		},
		setPointer : function(){
//			if(this.options.width){
//				this.$container.css('width', this.options.width);
//			}
//			if(this.options.height){
//				this.$container.css('height', this.options.height);
//			}
			this.$pointer.css('left', this.options.refer.outerWidth()/2-12);
			
		},
		setPosition : function(){
			var refer = this.options.refer;
			var panel = this.$panel;

			if(!refer.offset()){
				return;
			}
			var top = refer.offset().top + refer.outerHeight();
			if (top + panel.outerHeight() > $(window).height() + $(document).scrollTop()){
				top = refer.offset().top - panel.outerHeight();
			}
			if (top < $(document).scrollTop()){
				top = refer.offset().top + refer.outerHeight();
			}
			var cw=document.documentElement.clientWidth;
			var sw=this.$wrapper.width();
			var w=sw+refer.offset().left;
			if(w>cw){
				//调整位置 避免滚动条
				var len=w-cw+12;
				panel.css('left', refer.offset().left-len);
				this.$pointer.css("left",refer.outerWidth()/2-12+len);
			}
			else{
				panel.css('left', refer.offset().left);
			}
			panel.css('top', top+4);
		},
		//调整tooltip 支持不同content 保留事件处理
		show : function(){
			var content=$(this.$container);
			var toolKey=this.$content.data("toolTipKey");
			var hasFound=false;
			this.options.onShow.call(this.$content);
			if(!this.$container.children().length){				
				this.$content.appendTo(this.$container);	
				this.$content.show();				
			}
			this.$container.children().each(function(){
				var t=$(this);
				var key=t.data("toolTipKey");
				if(key==toolKey){
					hasFound=true;
					t.show();
				}
				else{
					t.hide();
				}
			});
			if(!hasFound){
				this.$content.appendTo(this.$container);	
				this.$content.show();	
			}
			curTips=this;
			this.$panel.show();
			this.setPointer();
			this.setPosition();	
			this.showing = true;
		},
		hide : function(eTarget){
			this.$panel.hide();
			this.options.onHide.call(this.$content, eTarget);
			this.showing = false;
		},
		bindEvents: function() {
			var _this = this;
			$(document).bind('mousedown.tooltip', function(e){
				if(_this.showing){					
					_this.hide(e.target);
				}
			});

			this.$refer.bind('click.tooltip', function() {
				if(!_this.showing){					
					_this.show();
				}
			});
			this.$panel.bind('mousedown.tooltip', function(e){
				e.stopPropagation();
			})
		}
	}



	$.fn.tooltip = function(options, param){
		if (typeof options == 'string'){
			var method = $.fn.tooltip.methods[options];
			if (method){
				return method(this, param);
			} else {
				return this.combo(options, param);
			}
		}
		
		options = $.extend({}, $.fn.tooltip.defaults, options);
		return this.each(function(){
			new $.Tooltip(this, options);
		});
	};
	
	$.fn.tooltip.methods = {
		options: function(jq){
			return $.data(jq[0], 'tooltip').options;
		},
		close:function(jq){
//			console.info('asdf');
			$(document).trigger('mousedown');
		}
	};
	
	$.fn.tooltip.defaults = {
		refer: null,
		show:false,
		onShow : function(){},
		onHide : function(){}
	};
})(jQuery);
