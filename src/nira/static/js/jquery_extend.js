(function($) {
	$.extend({
				stringFormat : function(str) {
					for ( var i = 0; i < arguments.length - 1; i++) {
						str = str.replace("{" + i + "}", arguments[i + 1]);
					}
					return str;
				},
				getDateString : function(str) {
					if (str) {
						var date = new Date(parseInt(str.substr(6)));
						var str = date.getFullYear() + "-"
								+ (date.getMonth() + 1) + "-" + date.getDate();
					}
					return str;
				},
				getDateObj : function(str) {
					return new Date(parseInt(str.substr(6)));
				},
				getFormValues : function($form) {
					values = {};
					$form.find(":input").each(function(index, elm) {
						if (elm.name && elm.name.indexOf('__') < 0) {
							values[elm.name] = $(elm).val();
						}
					});
					return values;
				},
				getUrl : function() {
					return location.href.split('?')[0];
				},
				getUrlParams : function() {
					var vars = [], hash;
					var hashes = window.location.href.slice(
							window.location.href.indexOf('?') + 1).split('&');
					for ( var i = 0; i < hashes.length; i++) {
						hash = hashes[i].split('=');
						vars.push(hash[0]);
						vars[hash[0]] = hash[1];
					}
					return vars;
				},
				getUrlParam : function(name) {
					return $.getUrlParams()[name];
				},
				removeFromArray : function(array, removeItem) {
					return jQuery.grep(array, function(value) {
						return value != removeItem;
					})
				},
				uniqueArray : function(array) {
					var ret = [], done = {};
					try {
						for ( var i = 0, length = array.length; i < length; i++) {
							var tmp = array[i]; // jQuery native code : var id =
							// jQuery.data(array[i]);
							if (!done[tmp]) {
								done[tmp] = true;
								ret.push(tmp);
							}
						}
					} catch (e) {
						ret = array;
					}
					return ret;
				},
				// 写入cookies
				setCookie : function(name, value, expiresDays) {
					var Days = expiresDays || 30;
					var d = new Date();
					var exp = new Date(d.getFullYear(), d.getMonth(), d
							.getDate());
					exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
					document.cookie = name + "=" + escape(value) + ";expires="
							+ exp.toGMTString();
				},
				// 读取cookies
				getCookie : function(name) {
					var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
					if (arr = document.cookie.match(reg))
						return unescape(arr[2]);
					else
						return null;
				},
				// 删除cookies
				delCookie : function(name) {
					var exp = new Date();
					exp.setTime(exp.getTime() - 1);
					var cval = this.getCookie(name);
					if (cval != null)
						document.cookie = name + "=" + cval + ";expires="
								+ exp.toGMTString();
				},
				initEvent : function(e) {
					// firefox 下 绑定 srcElement=target
					// 简写srcElement
					if (e.target)
						e.srcElement = e.target;
					if (e.which)
						e.keyCode = e.which;
					e.src = e.srcElement;
				},
				debug : function(message) {
					var dev = (location.hostname == "127.0.0.1"
							|| location.hostname == "0.0.0.0"
							|| location.hostname == "localhost" || location.port.length > 0)
					dev && typeof console != "undefined"
							&& console.log(message);
				}
			});
	$.fn.findParent = function(expr) {
		var parents = this.parentsUntil(expr);
		return $(parents[parents.length - 1]).parent();
	}
	$.fn.isChildOf = function(b) {
		return (this.parents(b).length > 0);
	}, $.fn.isChildOrSelfOf = function(b) {
		return (this.closest(b).length > 0);
	}
})(jQuery);

