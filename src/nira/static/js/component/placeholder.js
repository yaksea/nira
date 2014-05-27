/*!
 * copyright c by zhangxinxu 2012-02-06
 * jquery.placeholder.js placeholder属性模拟插件
 * v1.0 2012-02-06 create
 * http://www.zhangxinxu.com/wordpress/2012/02/html5-placeholder%E4%BD%BF%E7%94%A8%E7%BB%8F%E9%AA%8C%E5%88%86%E4%BA%AB%E5%8F%8A%E6%8B%93%E5%B1%95/
*/

(function($) {
	$.fn.placeholder = function(options) {
		var defaults = {
			labelMode: true,
			labelStyle: {},
			labelAlpha: false,
			labelAcross: false
		};
		var params = $.extend({}, defaults, options || {});
		
		//方法
		var funLabelAlpha = function(elementEditable, elementCreateLabel) {
			if (elementEditable.val() === "") {
				elementCreateLabel.css("opacity", 0.4).html(elementEditable.data("placeholder"));
			} else {
				elementCreateLabel.html("");	
			}
		};
		
		$(this).each(function() {
			var element = $(this), isPlaceholder = "placeholder" in document.createElement("input"), placeholder = element.attr("placeholder");

			// 三种情况打酱油
			// ① 没有placeholder属性值
			// ② value模拟，同时是支持placeholder属性的浏览器
			// ③ label模拟，但是无需跨浏览器兼容，同时是支持placeholder属性的浏览器
			if (!placeholder || (!params.labelMode && isPlaceholder) || (params.labelMode && !params.labelAcross && isPlaceholder)) { return; }

			// 存储，因为有时会清除placeholder属性
			element.data("placeholder", placeholder);
			
			// label模拟
			if (params.labelMode) {			
				var idElement = element.attr("id"), elementLabel = null;
				if (!idElement) {
					idElement = "placeholder" + Math.random();	
					element.attr("id", idElement);
				}
				
				// 状态初始化
				elementLabel = $('<label for="'+ idElement +'"></label>').css($.extend({
					lineHeight: "1.3",
					position: "absolute",
					color: "graytext",
					cursor: "text",
					margin: "2px 0 0 3px"
				}, params.labelStyle)).insertBefore(element);				
				
				// 事件绑定
				if (params.labelAlpha) {
					// 如果是为空focus透明度改变交互
					element.bind({
						"focus": function() {
							funLabelAlpha($(this), elementLabel);
						},
						"input": function() {
							funLabelAlpha($(this), elementLabel);
						},
						"blur": function() {
							if (this.value === "") {
								elementLabel.css("opacity", 1).html(placeholder);  
							}	
						}
					});	
					
					//IE6~8不支持oninput事件，需要另行绑定
					if (!window.screenX) {
						element.bind("keyup", function() {
							funLabelAlpha($(this), elementLabel);	
						});
						element.get(0).onpaste = function() {
							setTimeout(function() {
								funLabelAlpha(element, elementLabel);	
							}, 30);	
						}
					}
					
					// 右键事件
					elementLabel.get(0).oncontextmenu = function() {
						element.trigger("focus");
						return false;	
					}
				} else {
					//如果是单纯的value交互
					element.bind({
						"focus": function() {
							elementLabel.html("");
						},
						"blur": function() {
							if ($(this).val() === "") {
								elementLabel.html(placeholder);	
							}
						}
					});	
				}
				
				// 内容初始化
				if (params.labelAcross) {
					element.removeAttr("placeholder");	
				}
				
				if (element.val() === "") {
					elementLabel.html(placeholder);	
				}
			} else {
				// value模拟
				element.bind({
					"focus": function() {
						if ($(this).val() === placeholder) {
							$(this).val("");
						}
						$(this).css("color", "");	
					},
					"blur": function() {
						if ($(this).val() === "") {
							$(this).val(placeholder).css("color", "graytext");    
						}	
					}
				});	
				
				// 初始化
				if (element.val() === "") {
					element.val(placeholder).css("color", "graytext");      
				}
			}	
		});
	};	
})(jQuery);