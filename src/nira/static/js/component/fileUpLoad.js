

(function($){
	$.fn.fileUpLoad=function(options){
		options = options || {};
		return this.each(function() {
				options = $.extend({},
						$.fn.fileUpLoad.defaults,options);
				instance = new $.fileUpLoad(this, options);
				$.data(this, 'fileInstance', instance);
				instance.init();
		});
	}
	//默认参数配置
	$.fn.fileUpLoad.defaults={
		//文件上传服务
		action:'/common/upload',
		//文件上传控件5部分组成  选中文件 文件上传 图片预览 文件路径预览 文件路径存放
		bind:{},
		//upload
		ajaxUpload:null,
		autoSubmit:true,
		//多个文件 数组存放
		fileList:[],
		//自动处理 文件名称显示
		defDesc:null,
		//返回schema
		returnKey:{
			_id:"message"
		},
		//文件筐
		eventLen:'200px',
		//默认最大
		zIndex:2147483647,
		//文件类型
		file_ext:{
			img:",jpg,png,bmp,gif,jpeg,tiff,svg,",
			psd:",psd,",
			swf:",swf,",
			doc:",doc,docx,",
			xls:",xls,xlsx,",
			wmv:",wmv,",
			wma:",wma,"
		},
		//413错误提示信息
		errorMes:'',
		//不自动提交 则需手动控制提交文件
		readySubmit:function(event){
			var ins=event.data;
			ins.ajaxUpload.submit();
		},
		//提交成功后 
		doComplete:function(file, data){
			var temp=$("<div>").html(data).text();
			var result=JSON.parse(temp);
			var ret=$.doAjaxRet(result);
			if(ret.direct){
				//已跳转页面 不处理
			}
			else if(!ret){
				$.messager.alert("&nbsp;",result.message);
			}
			else{
				this._src.bindFileDesc(result[this._src.opt.returnKey._id],file);
				this._src.opt.bind.fileDesc.val("");					
			}		
		},
		doSubmit:function(file,ext){
			//提交前检验 true 通过  false 失败
			return true;
		},
		doChange:function(file,ext){
			//选择文件后 返回文件名称
			var owner=this._src;
			//保存 文件后缀信息
			owner.opt.ext=ext;
			if(owner.opt.bind.fileDesc){
				owner.opt.bind.fileDesc.val(file);	
				owner.opt.bind.fileDesc.css("display","");
			}
			if(owner.opt.bind.submit){
				owner.opt.bind.submit.css("display","");
			}
			else if(owner.opt.defDesc){
				owner.opt.defDesc.val(file);
			}
		}
	}
	$.fileUpLoad=function(elem,options){
		this.src=elem;
		this.opt=options;
	}
	//无效的图片格式 则报错且删除数据
	$.fileUpLoad.delErrorImg=function(elem){
		try{
			elem.src="/static/images/gif/error.jpg";
			elem.onerror=null;
		}catch(e){
			//异常情况
		}
	}
	$.fileUpLoad.bindFile=function(val,data,key){
		if(window.operation&&window.operation=="detail"){
			if(!val||val=="")
				val=[];
			var elem=$.find("#"+key);
			var inst=new $.fileUpLoad(elem,
			$.extend({},$.fn.fileUpLoad.defaults,{
				fileList:val,
				bind:{}	
			}));
			inst.bindFileDetail();
		}
		else if($normalFileUp.length){
			if(!val||val=="")
				return;
			if(val.constructor!=window.Array){
				val=val.split(",");	
			}
			$normalFileUp.each(function(){
					var inst=$.data(this, 'fileInstance');
					$.each(val,function(i,domObj){
						inst.getFilePrefix(domObj);
						inst.bindFileDesc(domObj,inst.getFileName(domObj));
					});
			});
		}
	}
	$.fileUpLoad.prototype={
		bindFileDetail:function(){
			if(this.opt.fileList.constructor!=window.Array){
					this.opt.fileList=this.opt.fileList.split(",");
			}
			var pElem=$($.$parent(this.src[0],"DD"));
			//重构detail 界面
			var labelName=pElem.find("label").text();
			pElem.empty();
			pElem.addClass("full_width");
			var label=$("<label class='full_width' style='margin-bottom:10px;'>"+labelName+"</label>");
			this.opt.bind.imgDesc=$("<div class='ImgFileDesc' style='clear:none'></div>");
			pElem.append(label).append(this.opt.bind.imgDesc);
			var inst=this;
			$(this.opt.fileList).each(function(){
				 inst.getFilePrefix(this);
				 inst.bindFileDesc(this,inst.getFileName(this),true);
			});
		},
		delFile:function(data){
			$.initEvent(data);
			var index=$(data.src).attr("index");
			var inst=data.data.inst;
			inst.doDeleteFile(index);
			$(data.src.parentElement.parentElement).remove();
		},
		doDeleteFile:function(index){
			var len=this.opt.fileList.length;
			if(index==len){
				this.opt.fileList.pop();	
			}
			else{
				var last=	this.opt.fileList[len-1];
				this.opt.fileList[index-1]=last;
				this.opt.bind.imgDesc.find("._delFile:last-child").attr("index",index);
				this.opt.fileList.pop();	
			}
			if(this.opt.bind.filePath){
				this.opt.bind.filePath.val(this.opt.fileList.join(","));	
			}
		},
		getFileName:function(path){
			var i=path.lastIndexOf("/");
			if(path.indexOf("?id=")>-1){
				i=path.indexOf("?id=")+3;
			}
			i=i>-1?i:0;
			var str=path.substring(i+1,path.length);
			return str;
		},
		getFilePrefix:function(path){
			var i=path.lastIndexOf(".");
			i=i>-1?i:0;
			this.opt.ext=[path.substring(i+1,path.length)];
		},
		addOptions:function(obj){
			var instance = $.data(this, 'fileInstance');
			if (instance) {						
				$.extend(instance.options, obj);
			}
		},
		getFileType:function(){
			var ext=","+$(this.opt.ext).get(0)+",";
			for(var i in this.opt.file_ext){
				var config=this.opt.file_ext[i];
				if(config.indexOf(ext)>-1)
					return i;
			}
			return "undefined";
		},
		init:function(){
			//初始化 入参
			var bind=this.opt.bind;
			if(bind){
				this.ajaxUpload=new AjaxUpload(bind.chooseFile, {
							action :this.opt.action,
							name : 'file',
							onSubmit :this.opt.doSubmit,
							onComplete:this.opt.doComplete,
							autoSubmit:this.opt.autoSubmit,
							onChange:this.opt.doChange,
							eventLen:this.opt.eventLen, //感应区域 从按钮算起
							zIndex:this.opt.zIndex,
							errorMes:this.opt.errorMes
				});
				this.ajaxUpload._src=this;
				//如果show：block 则需调整 file位置 适合elem 已定位 未定位则无效果
				//bind.chooseFile.trigger("mouseover");
				if(!this.opt.autoSubmit&&bind.submit){
					bind.submit.bind("click",this,this.opt.readySubmit);
				}
				else if(!this.opt.autoSubmit){
					var btn=$("<button>上传</button>");
					btn.bind("click",this,this.opt.readySubmit);
					this.src.append(btn);
				}
			}
			else{
				this.doNormalFileLoad();
			}
		},
		doNormalFileLoad:function(){
			var btn=$("<button>选择文件</button>");
			this.ajaxUpload=new AjaxUpload(btn, {
							action :this.opt.action,
							name : 'file',
							onSubmit :this.opt.doSubmit,
							onComplete:this.opt.doComplete,
							autoSubmit:true,
							onChange:this.opt.doChange
			});
			this.defDesc=$("<input disabled=true type='text' />");
			this.src.append(btn);	
			this.src.append(defDesc);	
		},
		bindFileDesc:function(url,file,noEdit){
			if(!noEdit){
				url=url.replace(/[,]/g,"");
				this.opt.fileList.push(url);
			}
			if(this.opt.bind.imgDesc){
				var imgDesc=this.opt.bind.imgDesc;
				var file_ext=this.getFileType();
				var str="<span>";
				if(!noEdit){
					//允许删除图片	
					str+="<div style='height:15px;padding-left:15px;'><span class='_delFile hidden' index="+this.opt.fileList.length+"></span></div>";
				}
				if(file_ext=="img"){
					str+="<div><a href='"+url+"' target='_blank'><img src='"+url+"' onerror='$.fileUpLoad.delErrorImg(this)' ></img></a></div>";	
				}
				else{
					str+="<a href='"+url+"' target='_blank'><div class=fileUpload_"+file_ext+"></div></a>";
				}
				str+="<div title='"+file+"'><a href='"+url+"' target='_blank'>"+file+"</a></div>";
				str+="</span>";
				var obj=$(str);
				var ctrl=obj.find("._delFile");
				ctrl.bind("click",{inst:this},this.delFile);
				imgDesc.append(obj);
				obj.bind("mouseover",function(){
					ctrl.removeClass("hidden");
					ctrl.addClass("show");
				}).bind("mouseout",function(){
					ctrl.removeClass("show");
					ctrl.addClass("hidden");
				})
			}
			if(this.opt.bind.filePath){
				this.opt.bind.filePath.val(this.opt.fileList.join(","));	
			}
		}	
	}
	
})(jQuery);