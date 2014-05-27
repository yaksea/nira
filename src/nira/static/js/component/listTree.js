(function($){
var qryFlag='y';
var qryAttr='hasQry';
var defClass='open';
var hasRole='_hasRole';
var listKey="_listTreeKey";
var hoverClass='treeHover';
function hasSub(elem,inst){
	
	return true;
}
$.fn.listTree=function(opt,param){
	this.each(function(){
		var $this=$(this);
		var inst=$this.data("listTree");
		if(!inst){
			inst=new $.listTree($this,$.extend({},$.listTree.defaults,opt));
			$this.data("listTree",inst);
		}
		else{
			inst.opt=$.extend({},$.listTree.defaults,opt);
			inst.init();
		}
	});
}
$.listTree=function(target,opt){
	this.dataMap={};
	this.keyAssist=0;
	this.target=target;
	this.opt=opt;
	//初始化查询参数
	//this.conditions={};
	this.init();
	this.drag=false;
}
$.listTree.prototype={
	init:function(){
		this.tree=$("<div class='listTree'>").appendTo(this.target);
		//自定义样式
		if(this.opt.myClass){
			this.tree.addClass(this.opt.myClass);
		}
		if(this.opt.hasQryTool){
			this.opt.bindTool.call(this);
			//创建qryList
			this.qryList=$("<div class='qryList' style='display:none'>").appendTo(this.target);
		}
		this.body=$("<div class='listBody'>").appendTo(this.tree);
		this.curTop=this.body;
		this.bindQry();
	},
	//用于自定义静态数据 绑定
	bindTree:function(data){
		var len=data.length;
		var hasChild;
		for(var i=0;i<len;i++){
			hasChild=false;
			if(data[i][this.opt.schema.subKey]&&data[i][this.opt.schema.subKey].length){
				hasChild=true;
			}
			var temp=this.initRow(data[i],hasChild).appendTo(this.curTop);
			this.opt.fillItem.call(this,data[i]);
			if(hasChild){
				var old=this.curTop;
				this.curTop=temp;
				this.bindTree(data[i][this.opt.schema.subKey]);
				this.curTop=old;
			}
		}
	},
	bindToolQry:function(qryName){
		var inst=this;
		if(!qryName||qryName.trim()==""){
			this.qryList.hide();
			this.body.show();
		}
		else{
			this.qryList.show();
			this.body.hide();
			//查询用户
			$.postJSON(this.opt.qryUrl,JSON.stringify({q:qryName.trim()}), function(data) {
				//data=$.decodeUTF(data);
				inst.qryList.html("");
				inst.curTop=inst.qryList;
				inst.bindItem(data.rows);
			});
		}
	},
	bindQry:function(){
		var inst=this;
		if(!this.opt.dataUrl){
			return;
		}
		$.getJSON(this.opt.dataUrl,this.opt.conditions, function(data) {
			
			inst.bindData(data);
		})
	},
	bindCheck:function(span,cl,id){
		var ctrl=$("<input type='"+this.opt.checkType+"' name='name_"+this.opt.checkType+"' />").appendTo(span);
		if(id!=null){
			ctrl.attr("id","check_"+id);
		}
		if(this.opt.checkType=="checkbox"){
			  span.bind("subChange",function(e,isCheck){			  	
			  	var pe=$(this).parent();			  	
			  	var topSpan=$(">.checkSpan",pe.parent());
			  	var topCtrl=topSpan.find("input");
			  	if(pe.hasClass("listBody")){
			  		return;	
			  	}
			  	else{
			  		if(isCheck){
			  			topCtrl.attr("checked",isCheck);
			  		}	
			  		else{
			  			var hasCheck=false;
			  			pe.parent().children().each(function(){
			  				var $this=$(this);
			  				var ctrl=$(">.checkSpan",$this).find("input");
			  				if(ctrl.attr("checked")){
			  					hasCheck=true;
			  					return false;
			  				}
			  			});
			  			if(!hasCheck){
			  				topCtrl.attr("checked",isCheck);		  					
			  			}
			  			else{
			  				return;	
			  			}
			  		}
			  		topSpan.trigger("subChange",[isCheck]);	
			  	}
			  });
				//多选情况				
				ctrl.bind("change",function(){
					if(cl=="parent"){	
						var check=this.checked;
						//先触发查询子节点
						$(">.parent_ctrl",span.parent()).trigger("click");
						span.parent().find("input[type='checkbox']").each(function(){
							this.checked=	check;
						});		
					}
					span.trigger("subChange",[this.checked]);				
				})																		
		}
	},
	getCanDelRow:function(elem){
		var ret;
		if(elem.hasClass(".tree_canDel")){
			ret=elem;
		}
		else{
			ret=elem.parent(".tree_canDel");
		}
		return ret;
	},
	initRow:function(data,flag){
		var cl="";
		var showText='';
		if(flag){
			cl='parent';
			showText=this.opt.schema.parentName;
			this.curRow=$("<ul class='tree_canDel'>");
		}
		else{
			cl='sub';
			showText=this.opt.schema.subName;
			this.curRow=$("<li class='tree_canDel'>");
		}
		this.curRow.bind(this.opt.otherEvent);
		var inst=this;
		if(this.opt.hasCtrl&&flag){
			var ctrl=$("<span class='"+cl+"_ctrl' />").appendTo(this.curRow);
			ctrl.bind("click",function(e){
				$.stopEvent(e);
				var $this=$(this);
				var pe=$this.parent();
				var hasQry=pe.attr("hasQry");
				if(!hasQry||hasQry!="y"){
					inst.qryChild(pe);	
				}
				if(pe.hasClass(defClass)){
					pe.removeClass(defClass);
				}
				else{
					pe.addClass(defClass);
				}
			});
		}
		else if(this.opt.hasCtrl&&!flag){
			$("<span class='empty'></span>").appendTo(this.curRow);
		}
		if(this.opt.hasImg){
			$("<span class='"+cl+"_img' />").appendTo(this.curRow);
		}
		if(this.opt.checkType){
			var checkSpan=$("<span class='"+cl+"_checkSpan checkSpan' />").appendTo(this.curRow);
			var id=data[this.opt.schema[cl+"IdKey"]];
			this.bindCheck(checkSpan,cl,id);			
		}
		//添加text
		var text=$("<span class='treeText' />").appendTo(this.curRow);
		text.text(data[showText]);
		if(cl=='parent'){
			text.bind("click",function(){
				ctrl.trigger("click");	
			})
			//text.draggable("enable");
			this.curRow.attr("text",data[showText]);	
			if(this.opt.parentDrag){
				dragHandle.myDrag({
					src:text,
					onDrop:this.opt.onDrop,
					isFocus:this.opt.noFocusDrag
				});
			}
		}
		else if(this.opt.subDrag){
			dragHandle.myDrag({
				src:text,
				onDrop:this.opt.onDrop,
				isFocus:this.opt.noFocusDrag
			});
		}	
		return this.curRow;
	},
	qryChild:function(elem){
		this.curTop=elem;
		var inst=this;
		this.curTop.attr("hasQry",'y');
		if(this.opt.staticTree){
			if(!this.opt.bindAll){
					var data=this.getData(this.curTop);
					this.bindData(data);
			}
		}
		else{
			//调用查询 待续
			inst.getQryCond()
			$.getJSON(this.opt.qrySubUrl,this.opt.conditions,function(data){
				inst.bindQrySub(data);
			});
		}
	},
	getQryCond:function(){
		if(this.opt.schema.parentId){
			this.opt.conditions[this.opt.schema.parentId]=this.getData(this.curTop)[this.opt.schema.parentIdKey];
		}
	},
	bindData:function(data){
		if(this.opt.staticTree){
			this.bindFullTree(data);
		}
		else{
			this.bindRow(data);
		}
	},
	bindFullTree:function(data){
		var schema=this.opt.schema;
		this.fullData=data;
		this.fullModel=true;
		this.bindItem(data[schema.subKey]);
		this.bindChild(data[schema.parentKey]);
	},
	bindItem:function(data){
		var inst=this;
		$(data).each(function(){
				inst.curTop.append(inst.initRow(this,false));
				inst.saveData(this);
				inst.opt.fillItem.call(inst,this);				
		});
	},
	bindChild:function(data){
		var inst=this;
		$(data).each(function(){
			inst.curTop.append(inst.initRow(this,true));
			inst.saveData(this);
			inst.opt.fillParent.call(inst,this);
			var temp=inst.curTop;
			if(inst.opt.staticTree&&inst.opt.bindAll){
				inst.curTop=inst.curRow;	
				inst.bindData(this);
				inst.curTop=temp;
			}			
		});
	},
	bindRow:function(obj){
		//待修改
		var schema=this.opt.schema;
		this.bindChild(obj[schema.parentKey]);
		//this.bindChild(data[schema.parentKey]);
	},
	bindQrySub:function(obj){
		var schema=this.opt.schema;
		this.bindItem(obj[schema.subKey]);
	},
	closeSub:function(elem){
		elem.removeClass(defClass);
	},
	openSub:function(elem){
		elem.addClass(defClass);
		var hasQry=elem.attr(qryAttr);
		if(hasQry==qryFlag){
			return;
		}
		if(hasSub(elem,this)){
			this.initCondition(elem);
			this.bindQry();
		}
	},
	saveData:function(data){
		var key=this.getKey(this.curRow);
		this.dataMap[key]=data;
	},
	getData:function(elem){
		var key=this.getKey(elem);
		return this.dataMap[key];
	},
	getKey:function(elem){
		var key=elem.attr(listKey);
		if(!key){
			key=listKey+"_"+this.keyAssist++;	
			elem.attr(listKey,key);
		}
		return key;
	},
	getDept:function(elem){
		var pa=elem.parent();
		if(!this.deptArr){
			this.deptArr=[];
		}
		if(pa.hasClass("listBody")){
			var temp=[];
			var len=this.deptArr.length;
			for(var i=len-1;i>=0;i--){
				temp[temp.length]=this.deptArr[i];
			}
			this.deptArr=null;
			return temp; 
		}
		else if(pa.get(0).tagName.toUpperCase()=="UL"){
			this.deptArr.push(pa.attr("text"));
			return this.getDept(pa);
		}
		else if(pa.get(0).tagName.toUpperCase()=="LI"){			
			return this.getDept(pa);
		}
	}
}
$.listTree.defaults={
	myClass:null,
	//展现+号
	hasCtrl:true,
	//展现图标
	hasImg:true,
	conditions:{},
	//数据声明  判断是否有子节点
	schema:{
		subKey:'users',
		subName:'userName',
		subIdKey:'userId',
		parentIdKey:'deptId',
		parentKey:"depts",
		parentName:'deptName'
	},
	hasQryTool:true,
	qryHint:'搜索用户',
	//一次性返回所有数据模式
	staticTree:true,
	//是否全部生成html 用于allData模式 
	bindAll:false,
	//单选 或多选 默认没有 
	checkType:null,
	//是否可以拖动
	parentDrag:true,
	//拖动时是否设置为焦点   用于是否需要获取拖动结束时 所处对象
	noFocusDrag:false,
	subDrag:false,
	//停止拖动事件
	onDrop:function(){},
	fillItem:function(data){},
	fillParent:function(data){},
	bindTool:function(){
		var tool=$("<div class='listTool'>").appendTo(this.tree);
		var img=$("<span class='listToolImg' />").appendTo(tool);
		var input=$("<input type='text' class='qryInput' >").appendTo($("<span class='qryInputSpan' />").appendTo(tool));
		if(this.opt.qryHint){
			input.val(this.opt.qryHint);
			var hint=this.opt.qryHint;
			input.addClass("nothing");
			input.bind("focus",function(){
				if(this.value==hint){
						$(this).removeClass("nothing");
						this.value="";
				}	
			})
			input.bind("blur",function(){
				if(this.value==""){
						$(this).addClass("nothing");
						this.value=hint;
				}	
			})
		}
		var inst=this;
		var del=$("<a class='qryCtrl noShow' href='javascript:void(0)' />").appendTo(tool);
		del.bind("click",function(){
			input.val('');
			input.trigger("blur");
			del.addClass("noShow");
			inst.bindToolQry("");
		});
		input.bind("keyup",function(){
			if(input.val()==''){
				 del.addClass("noShow");	
			}
			else if(del.hasClass("noShow")){
				 del.removeClass("noShow");	
			}
			inst.bindToolQry(input.val());
		});
	},
	otherEvent:{}
}	
})(jQuery);