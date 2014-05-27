(function($) {
	/**
	 * show window with animate, after sometime close the window
	 */
	var messageLabel = null;
	
	$(window).resize(function(){
		if(messageLabel && messageLabel.showing){
			messageLabel.setPosition();
		}
	});
	
	$.MessageLabel = function() {
		this.text = "";
		var iebrws=document.all;
		this.cssfixedsupport=!iebrws || iebrws && document.compatMode=="CSS1Compat" && window.XMLHttpRequest //not IE or IE7+ browsers in standards mode
		this.panel = $("<div style='border:solid 1px #CCC; z-index:999999; background:yellow; padding:2px 20px;'/>").appendTo($("body"));
		this.panel.css({position:this.cssfixedsupport? 'fixed' : 'absolute'});
		if (this.cssfixedsupport){
			this.panel.css({top: '0px', right : '0px'});
		}
		this.showing = false;
	};
	$.MessageLabel.prototype = {
		setPosition:function(){
			if (!this.cssfixedsupport){
				var width = this.panel.width();
				var height = this.panel.height();
				var $window=$(window);
				var controlx=$window.scrollLeft() + $window.width() - width;
				var controly=$window.scrollTop() + $window.height() - height;
				this.panel.css({left:controlx+'px', top:controly+'px'});
			}
		},
		show : function(text) {			
			this.panel.text(text);
			
			this.setPosition();
			this.panel.fadeIn("slow");
			this.showing = true;
			var _this = this;
			window.setTimeout(function(){
				_this.panel.fadeOut("slow");
				this.showing = false;
			}, 3000);
			
		}
	}

	$.messagelabel = {
		show : function(text) {
			if(!messageLabel){
				messageLabel = new $.MessageLabel();
			}
			messageLabel.show(text);
		}
	}

})(jQuery);
