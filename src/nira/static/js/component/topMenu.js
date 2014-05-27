(function($){
	var menu = null;
	$(function(){
		menu = $('.nav-menu');
		items = menu.children().first().children('li');
		items.hover(function(){
			var $this=$(this);
			$this.children('a').addClass("selected");
			$this.children('ul').show();
		},
		function(){
			var $this=$(this);
			$this.children('a').removeClass("selected");			
			$this.children('ul').hide();
		})
	})
	
})(jQuery);
