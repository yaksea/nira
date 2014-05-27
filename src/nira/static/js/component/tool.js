//depends on messager.js

(function($){
	$.extend({
		postJSON: function( url, data, callback ) {
			if ( jQuery.isFunction( data ) ) {
				callback = data;
				data = undefined;
			}

			return jQuery.ajax({
				type: 'post',
				url: url,
				data: JSON.stringify(data),
				dataType: 'json',
				contentType: "application/json; charset=UTF-8",
				success: function(returnData){
					var ret=$.doAjaxRet(returnData);
					if(ret.direct){
						//已跳转页面 不处理
					}
					else if(!ret){
						$.messager.alert("&nbsp;",returnData.message);
					}
					else if(callback){
						(callback)(returnData);	
					}					
				},
			});
		},
		//增加了 statusCode的校验
		getJSON: function( url, params, callback ) {
			return jQuery.get(url, params, function(data){
				var ret=$.doAjaxRet(data);
				if(ret.direct){
					//已跳转页面 不处理
				}
				else if(!ret){
					$.messager.alert("&nbsp;",data.message);
				}
				else if(callback){
					(callback)(data);	
				}
			},"json");	
		}		
	});
	$.isFireFox=function(){
		var ua=navigator.userAgent.toLowerCase();
		return ua.indexOf("firefox")>-1?true:false;
	};
	$.encodeUTF=function(obj){
		for(var key in obj){
			if(obj[key].constructor==window.Array){
				encodeArray(obj[key]);
			}
			if(obj[key].constructor==String){
				obj[key]=escape(obj[key]);
			}
		}
	}
	function encodeArray(obj){
		$(obj).each(function(i){
			if(this.constructor==String){
				obj[i]=escape(this);
			}
			else{
				encodeUTF(this);
			}
		});
	}
	$.decodeUTF=function(data){
		return JSON.parse(unescape(JSON.stringify(data)));
	}
	$.$parent=function(elem,tag){
			if(elem&&elem.tagName.toUpperCase()==tag)
				return elem;
			else if(elem&&elem.parentElement){
				return $.$parent(elem.parentElement,tag);	
			}
			else
				return null;
	}
	$.stopEvent=function(e){
		e.stopPropagation();
		e.preventDefault();	
	}
	$.getPostion=function(e){
		return {
			x:e.pageX,
			y:e.pageY
		}
	},

	$.doAjaxRet=function(data){
		if(data.statusCode){
			if(data.statusCode==200)
				return true;
			if(data.statusCode==400){
				//doErrorRedirect(data);
				return false;
			}
			if(data.statusCode==409){
				//doErrorRedirect(data);
				return false;
			}
			if(data.statusCode==401){
				doBackHome();
				return {direct:true};
			}
			if(data.statusCode==403||data.statusCode==404){
				doErrorRedirect(data.statusCode);
				return {direct:true};
			}
			if(data.statusCode==500)
				return false;
			//其他情况返回true
			return true;
		}
		else
			return true;
	};
	$.getSearchValue=function(key){
		var _pathInfo=location.search;
		var start=_pathInfo.indexOf("?"+key+"=");
		if(start==-1){
			 start=_pathInfo.indexOf("&"+key+"=");	
		}
		_pathInfo=_pathInfo.substring(start+key.length+2);
		var end=_pathInfo.indexOf("&");
		if(start>-1){
			if(end==-1)
				end=_pathInfo.length;
			return _pathInfo.substring(0,end).trim();
		}
		else
			return null;	
	};
	$.checkResponse=function(res){
			try{
				var data=JSON.parse(res.responseText);
				if(!$.doAjaxRet(data)){
					$.messager.alert("&nbsp;",data.message);
					return false;	
				}
			}catch(e){
				//error
			}
			return true;
	};
	$.doLogin=function(){
			$.getJSON("/common/checkoapticket",function(data){
				if(data.statusCode&&data.statusCode!=200){
					doBackHome();
				}	
			});
	};
	$.startInterval=function(){
			$.loginInter=window.setInterval($.doLogin,5*60*1000);
	};
	$.clearInter=function(){
			window.clearInterval($.loginInter);
	};
	$.fileUpSuccess=function(response,self){
		//非STRING类型不处理
		if(typeof(response)!="string"){
			return true;
		}
		
		if(response.indexOf($.headStr['413'])>-1){
			$.messager.alert("&nbsp;",self._settings.errorMes);
			return false;
		}
		
		return true;
	
	};
	$.headStr={
		413:'Request Entity Too Large'	
	}
	function doErrorRedirect(statusCode){
		try{
			var curTab=mydlg.getInst().getCurTab();
			location.href='/prompt?='+moduleName+"&statusCode="+statusCode+"&tabKey="+curTab.key;
		}catch(e){
			location.href='/prompt?='+moduleName+"&statusCode="+statusCode;
		}
	}
	function doBackHome(){
		parent.location.href= "/user/logout";
	};
})(jQuery);