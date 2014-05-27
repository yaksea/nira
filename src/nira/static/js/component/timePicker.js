(function($){
	$.fn.timePicker=function(options,param){
		options = options || {};
		return this.each(function() {
			var inst = $.data(this, 'timePicker');
			if (inst) {						
				$.extend(inst.options, options);
			} else {
				options = $.extend({},$.fn.timePicker.defaults, options);
				var inst = new $.timePicker(this, options);
				inst.init();
				$.data(this, 'timePicker', inst);
				$.data(this, 'defValid', inst);
			}
		});
	};
	$.timePicker=function(target,opt){
		this.target=target;
		this.opt=opt;
	};
	//绑定日期
	$.timePicker.bindTime=function(value,data,key){
		if(!value||value=="")
			return;
		var input=$("#"+key);
		var inst=input.data("timePicker");
		var arr=value.split(' ');
		input.combo("setText",arr[0]);
		input.combo("setValue",value);
		var timeConfig={
			0:'h',
			1:'M',
			2:'s'	
		}
		var time={h:0,m:0,s:0};
		if(arr[1]){
			$(arr[1].split(":")).each(function(i){
					time[timeConfig[i.toString()]]=this.toString();
			});	
		}
		inst.reset(time);
	};
	$.timePicker.prototype={
		init:function(){
			//为空则默认setDateTime处理
			var $target=$(this.target);
			//选择日期后处理函数 
			if(this.opt.onSelect==null){
				this.opt.onSelect=this.setDateTime;
			}
			if(this.opt.onToday==null){
				this.opt.onToday=this.setToday;
			}
			//指向timepicker对象 用于datebox反调
			this.opt.timeInst=this;
			
			$target.datebox(this.opt);
			this.date=$target.data("combo");
			//firefox 样式有问题 设为float布局
			this.date.combo.css("float","left");
			this.datebox=$target.data("datebox");
			this.panel=$("<span class='combo-time' />");
			this.panel.data("defValid",this);
			//添加校验 指向组件的valid方法
			if($target.attr("validtype")){
				this.panel.addClass("validatebox-text");
				this.panel.attr("invalidmessage",$target.attr("invalidmessage"));
				this.panel.attr("validtype","def_"+$target.attr("validtype"));
				this.panel.validatebox({
					validtype:this.panel.attr("validtype")
				});
			}
			this.initTime();
			$(document).bind("mousedown.timePicker",function(e){
					$(".combo-time-show").css("display","none");
			});
		},
		initTime:function(){
			if(this.opt.showHour){
					this.panel.append(this.createTimePanel("hour"));
			}
			if(this.opt.showMinute){
				  if(this.opt.showHour)
				  	this.panel.append(this.cSpilit());
					this.panel.append(this.createTimePanel("minute"));
			}	
			if(this.opt.showSecond){
					if(this.opt.showMinute)
					  	this.panel.append(this.cSpilit());
					this.panel.append(this.createTimePanel("second"));
			}	
			this.date.combo.parent().append(this.panel);
		},
		cSpilit:function(){
			return $("<span class='spilit'>"+this.opt.spilit+"</span>");
		},
		createTimePanel:function(type){
			var input=$("<input class='combo-time-"+type+"' type='text' >");
			input.bind("mousedown",{inst:this,type:type},this.showPanel);
			input.bind("blur",{inst:this},this.setTime);
			return input;
		},
		showPanel:function(e){
			$(document).trigger("mousedown");
			e.stopPropagation();
			$.initEvent(e);
			var inst=e.data.inst;
			var type=e.data.type;
			var temp=inst[type+"_timePanel"];
			if(!temp){
				inst.timePanel=inst.cTimePanel();
				inst.timePanel.bind("mousedown",function(e){
					inst.doMouseDown=true;
					e.stopPropagation();
				});
				inst[type+"_timePanel"]=inst.timePanel;
				inst.initTimePanel(type);
			}
			else{
				inst.timePanel=temp;
			}
			inst.showTimePanel(e.src); 
		},
		showTimePanel:function(target){
			var t=$(target);
			this.timePanel.css("top",t.offset().top+t.height()+"px");
			this.timePanel.css("left",t.offset().left+"px");
			this.timePanel.css("display","block");
			this.timePanel.width(t.width());
		},
		hiddenTimePanel:function(){
			this.timePanel.css("display","none");
			this.doMouseDown=false;
		},
		cTimePanel:function(){
			return $("<div class='combo-time-show'>").appendTo(document.body);	
		},
		initTimePanel:function(type){
			var $t=this;
			var data=eval("this.opt."+this.opt.config[type.toString()]);
			if(!data)
				return;
			else{
				$(data).each(function(){
						var row=$("<div class='time-rows'>");
						row.text(this<10?"0"+this:this);
						row.attr("real_value",this);
						row.bind("mouseover",function(){
							$(this).removeClass("hover").addClass("hover");	
						}).bind("mouseout",function(){
							$(this).removeClass("hover");
						}).bind("click",{inst:$t,type:type},$t.doSetValue);
						
						$t.timePanel.append(row);
				});	
			}
		},
		doSetValue:function(e){
			$.initEvent(e);
			var type=e.data.type;
			var inst=e.data.inst;
			var val=inst.getRowValue(e.src);
			inst.setValue(inst.panel.find(".combo-time-"+type),val);
			inst.hiddenTimePanel();
		},
		getRowValue:function(elem){
			var obj={};
			obj["value"]=$(elem).attr("real_value");
			obj["name"]=$(elem).text();
			return obj;	
		},
		//暂时不使用real_value 适合target不是input类型
		setValue:function(input,val){
			//input.text(val.name);	 ie下input 设置text报错
			input.val(val.name);
			input.attr("real_value",val.value);
			this.setTime();	
		},
		setTime:function(e){
			var inst;
			if(!e)
				inst=this;
			else{
				inst=e.data.inst;
				//选中时间不处理blur事件
				if(inst.doMouseDown)
					return;
			}
			//IE下new Date不支持 yyyy-mm-dd格式
			var date=new Date($(inst.target).combo('getText').replace(/[-]/g,'/'));
			inst.setDateTime.call(inst.target,date);
		},
		getTime:function(){
			var time={
				h:this.panel.find(".combo-time-hour").val(),
				m:this.panel.find(".combo-time-minute").val(),
				s:this.panel.find(".combo-time-second").val()
			}
			if(!this.opt.showHour||time.h=="")
				time.h=0;
			if(!this.opt.showMinute||time.m=="")
				time.m=0;
			if(!this.opt.showSecond||time.s=="")
				time.s=0;
			return time;
		},
		setToday:function(date){
			var datebox=$(this).data("datebox");
			var inst=datebox.options.timeInst;
			inst.fillTime($(this),date);
		},
		fillTime:function(target,date){
			var inst=this;
			var dateObj=inst.formatDate(date);
			//显示调整后的值
			target.combo('setValue', dateObj.dateTime).combo('setText', dateObj.date);
			
			inst.reset(dateObj);
			if(inst.panel.attr("validtype")){
				inst.validate();
			}
			//关联校验调用  统一调用控件validate方法
			for(var rela in inst.opt.validConfig){
				inst.opt.validConfig[rela].validate();
			}
		},
		setDateTime:function(date){
			var datebox=$(this).data("datebox");
			var inst=datebox.options.timeInst;
			//未选择日期 则默认今日
			if(!date.getTime()){
				//$.messager.alert("&nbsp;","请选择有效日期");	
				date=new Date();
				date.setHours(0);
				date.setMinutes(0);
				date.setSeconds(0);
				//inst.reset({h:'',M:'',s:''});
				//return;
			}
			var time=inst.getTime();
			var millisec=Number(time.h)*60*60*1000+Number(time.m)*60*1000+Number(time.s)*1000;
			if(!millisec&&millisec!=0){
				//$.messager.alert("&nbsp;","请输入有效时间");	
				millisec=0;
			}
			date=new Date(date.getTime()+millisec);	
			inst.fillTime($(this),date);
		},
		validate:function(){
			this.panel.validatebox('validate');
		},
		parseParam:function(valid){
			var obj={};
			var start=valid.indexOf("[");
			var end=valid.indexOf("]");
			if(start==-1)
				start=valid.length;
			else{
				obj.param=valid.substring(start+1,end);
			}
			obj.name=valid.substring(0,start);
			return obj;
		},
		reset:function(obj){
				this.panel.find(".combo-time-hour").val(obj.h),
				this.panel.find(".combo-time-minute").val(obj.M),
				this.panel.find(".combo-time-second").val(obj.s)
		},
		formatDate:function(date){
			var str=this.opt.format;
			var dateObj={};
			//毫秒
			dateObj.millisec=date.getTime();
			//日期
			dateObj.curDate=date;
			
			dateObj.y=this.toStr(date.getFullYear());
			dateObj.m=this.toStr(date.getMonth()+1);
			dateObj.d=this.toStr(date.getDate());
			dateObj.h=this.toStr(date.getHours());
			dateObj.M=this.toStr(date.getMinutes());
			dateObj.s=this.toStr(date.getSeconds());
			//日期 字符串
			dateObj.date=dateObj.y+this.opt.dateSplit+dateObj.m+this.opt.dateSplit+dateObj.d;
			
			str=str.replace('yyyy',dateObj.y);
			str=str.replace('mm',dateObj.m);
			str=str.replace('dd',dateObj.d);
			
			if(this.opt.showHour)
				str=str.replace('hh',dateObj.h);
			if(this.opt.showHour)
				str=str.replace('MM',dateObj.M);
			if(this.opt.showHour)
				str=str.replace('ss',dateObj.s);
				
			//完整时间字符串	
			dateObj.dateTime=str;
			return dateObj;
		},
		toStr:function(val){
			return val<10?"0"+val:val;
		},
		//用于返回日期
		getValue:function(){
			return $(this.target).combo("getValue");
		},
		addRelaValid:function(relaObj,key){
			if(!this.opt.validConfig[key]){
					this.opt.validConfig[key]=relaObj;
			}
		}
	};
	$.fn.timePicker.defaults={
		showHour:true,
		showMinute:true,
		showSecond:true,
		config:{
			hour:'defHour',
			minute:'defMinute',
			second:'defSecond'
		},
		defHour:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
		defMinute:[0,10,20,30,40,50],
		defSecond:[],
		spilit:":",
		//设置日期方法 null 则默认处理
		onSelect:null,
		dateSplit:"-",
		//值格式
		format:'yyyy-mm-dd hh:MM',
		//校验配置
		validConfig:{}
	}
	//组件内部调用 显示校验信息  不影响form校验
	function showTip(target,msg) {
		var box = $(target);
		var inst=$.data(target, 'validatebox');
		if(!inst){
			inst={};
			$.data(target, 'validatebox',inst);
		}
		var tip=inst.tip;
		if(!tip){
			tip = $(
					'<div class="validatebox-tip">'
				+ '<span class="validatebox-tip-content">'
				+ '</span>'
				+ '<span class="validatebox-tip-pointer">'
				+ '</span>' + '</div>').appendTo('body');
			inst.tip=tip;
		}
		tip.find('.validatebox-tip-content').html(msg);
		tip.css({
			display : 'block',
			left : box.offset().left + box.outerWidth(),
			top : box.offset().top
		})
	}

	/**
	 * hide tip message.
	 */
	function hideTip(target) {
		var tip = $.data(target, 'validatebox').tip;
		if (tip) {
			tip.remove();
			$.data(target, 'validatebox').tip = null;
		}
	}
})(jQuery);