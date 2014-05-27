(function($){
	var curTable;
	var curData;
	var curCfg;
	var curTemp;
	var curRowData;
	var hasDefSortQry=false;
	var tableFunc={
		_bindRowRight:function(elem,data){
			if(!data.canEdit){
				elem.find("input.cbSelect").remove();
				elem.find("div.listTool").html("<a href='javascript:void(0)'>无修改权限</a>");
				//elem.find("div.normalTool").remove();
				elem.find("div.cust_img").find("img").css({marginLeft:'20px'});
				
			}
		}	
	};
	function bindQuery(key,type){
		//排序前处理
		if(listFuncCfg){			
			if(listFuncCfg.doSort){
				listFuncCfg.doSort.call({
					key:key,
					val:type
				});
			}
		}
	}
	function beforeSort(){
		if(listFuncCfg&&listFuncCfg.beforeSort){
			(listFuncCfg.beforeSort)();
		}
	}
	function bindAsc(e){
		$.stopEvent(e);
		beforeSort();
		var $this=$(this);
		var key=$this.attr("sortKey");
		$this.hide();
		$this.parent().find(".desc").show();
		bindQuery(key,'asc');
	}
	function bindDesc(e){
		$.stopEvent(e);
		beforeSort();
		var $this=$(this);
		var key=$this.attr("sortKey");
		$this.hide();
		$this.parent().find(".asc").show();
		bindQuery(key,'desc');
	}
	function doAscOrDesc(e){
		var pe=$(this);
		var asc=pe.find("li.asc");
		var desc=pe.find("li.desc");
		if(asc.get(0).style.display=="none"){
			desc.trigger("click");
		}
		else{
			asc.trigger("click");
		}
	}
	function bindSort(cfg,elem){
		var key=cfg.sortKey;
		//var span=$("<div class='table_sort' style='float:right' />");
		var asc=$("<li class='asc sort_li' title='降序' sortKey='"+key+"' ></li>").appendTo(elem);
		asc.bind({
			click:bindAsc
		});
		var desc=$("<li class='desc sort_li' title='升序' sortKey='"+key+"' ></li>").appendTo(elem);
		desc.bind({
			click:bindDesc
		});
		elem.bind("click",doAscOrDesc);
		elem.addClass("sortTd");
		if(cfg.sortByDefault){
			doAscOrDesc.call(elem);
			hasDefSortQry=true;
		}
		//elem.append(span);
	}
	$.fillTableFrombean=function(table,data,cfg,template){
		curTable=table;
		curData=$(data);
		curCfg=cfg;
		curTemp=template;
		fillRow();
	}
	$.fillTableFrombean.bindMethod={
	  	addMethod:function(opts){
	  		tableFunc[opts.key]=opts.val;
	  	},
	  	getTableId:function(elem){
			return elem.parents(".tableRow").attr("id").replace("tb_","");
	  	},
	  	bindRow:function(data){
	  		var old=curRowData;
	  		curRowData=data;
	  		var ret=insertRow();
	  		curRowData=old;
	  		return ret;
	  	},
	  	createHead:function(obj){
	  		var cfg=obj.cfg;
	  		var elem=obj.elem;
	  		for(var item in cfg){
	  			var temp=cfg[item];
	  			if(temp.noHead){
	  				continue;
	  			}
	  			else{
	  				var div=$("<div>").appendTo(elem);
	  				var name=temp["name"];
	  				var css=temp["css"];
	  				var headcss=temp["headcss"];
	  				div.html("<span>"+(name?name:"")+"</span>");
	  				if(headcss){
	  					div.css(headcss);
	  				}
	  				else if(css){
	  					div.css(css);
	  				}
	  				if(temp.sortKey){
	  					//排序
	  					bindSort(temp,div);
	  				}
	  			}
	  		}
	  		elem.children().get(elem.children().length-1).style.background="none";
	  	},
	  	bindEvent:function(opts){
	  		
	  	}
	}
	$.bindTable=function(method,opts){
		if(typeof(method)=="string"){
			return ($.fillTableFrombean.bindMethod[method])(opts);
		}
	}
	$.bindTable.defaults={
		addTags:function(e,data){
			var retDiv=$(this).find(".listTag");
			$(data).each(function(){
				var tag=$("<a href='javascript:void(0)' class='tag'></a>").appendTo(retDiv);
				tag.text(this);
				tag.click(tagClick);
				tag.mousedown(function(){return false});
			})			
		},
		changeOwner:function(e,data){
			var retDiv=$(this).find("div.owner");
			retDiv.text(data);
		},
		insertFirst:function(data){
			//data={"assets": "100~500\u4e07", "level": 3, "tags": ["\u6709", "\u73ab", "\u5728\uff0c\u8981", "sdf", "\u5728\u8981\u67af"], "_id": "be1ee31121a211e2aa8700219b625915", "type": 0, "canEdit": true, "name": "yqy"};
			curRowData=data;
			var row=insertRow();
			curTable.prepend(row);
			document.body.scrollTop=0;
		},
		//修改单条数据
		changeRow:function(data){
			//data={"assets": "100~500\u4e07", "level": 3, "tags": ["\u6709", "\u73ab", "\u5728\uff0c\u8981", "sdf", "\u5728\u8981\u67af"], "_id": "7e1afa6e401e11e2b27400219b625915", "type": 0, "canEdit": true, "name": "yqy"};
			var record=curTable.children("#tb_"+data._id);
			if(!record.length){
				this.insertFirst(data);
			}
			else{
				curRowData=data;
				var row=insertRow();
				row.insertAfter(record);
				record.remove();
			}
		}
	}
	function insertRow(){
		if(!curTemp){
			$.fillTableFrombean($block_list,[curRowData],listHeadCfg,renderTemplate);
			return;
		}
		$norecord.hide();
		curRowData._id=curRowData.id?curRowData.id:curRowData._id;
		glbdatas[curRowData._id] = curRowData;
		var str="<div class='"+curTemp.attr("class")+" tableRow'>"+curTemp.html()+"</div>";
		var curRow=$(str);
		curRow.attr("id","tb_"+curRowData._id);
		curRow.bind("mouseover",function(){
			curRow.addClass("rowOver");
			if(listFuncCfg&&listFuncCfg.showCtrl){
				listFuncCfg.showCtrl.call(curRow);
			}
		});
		curRow.bind("mouseout",function(){
			curRow.removeClass("rowOver");
			if(listFuncCfg&&listFuncCfg.hiddenCtrl){
				listFuncCfg.hiddenCtrl.call(curRow);
			}
		});
		curRow.bind("click",function(){
			if(listFuncCfg&&listFuncCfg.doCheck){
				listFuncCfg.doCheck.call(curRow);
			}
		});
		curRow.bind("delete",function(){
			if(count){
				count--;
			}
			curRow.remove();
		});
		curRow.bind($.bindTable.defaults);
		fillSub(curRow);
		//执行权限处理
		(tableFunc['_bindRowRight'])(curRow,curRowData);
		return curRow;
	}
	function fillRow(){
		curData.each(function(){
			curRowData=this;
			//已存在则不处理
			if(glbdatas[curRowData._id])
				return;
			
			insertRow().appendTo(curTable)
		});
	}
	function fillSub(elem){
		if(elem.hasClass("hasBind")){
			return;
		}
		var jtext=elem.attr("jtext");
		var temp=curCfg[jtext];
		if(temp){
			if(temp.bindFunc){
				var retObj=fillRowByFunc(jtext);
				if(retObj!=null&&retObj.length){
					elem.append(retObj);
				}
			}
			else{
				elem.text(curRowData[jtext]);
			}
		}
		if(temp&&temp.css){
			elem.css(temp.css);
		}
		if(elem.children().length){
			elem.children().each(function(){
				fillSub($(this));
			});
		} 
	}
	function fillRowByFunc(jtext){
		return tableFunc[jtext].call(curRowData,jtext);
	}
	window.tableParamQry={
			hasDefSort:function(){
				return hasDefSortQry;
			}
		}
})(jQuery);

$(document).bind("mousedown",function(){
	try{
		parent.$("#_tab_context_menu_div").hide();
	}
	catch(e){
//		alert(e);
	}
});
var mydlg={
	commonParam:"_openFrom_=mydlg",
	doc:$(document),
	checkIsMine:function(param){
		var tempName=moduleName;
		if(tempName=="singleCustomer"){
			tempName="customer";
		}
		if(param.from!="follow"){
			if(!param.data[tempName])
				return false;
			var moduleId=param.data[tempName]._id;
			return moduleId==id;
		}
		else{
			var hasFind=false;
			for(var i=0;i<param.data.contacts.length;i++){
				var temp=param.data.contacts[i];
				if(tempName=="customer"){
					if(temp.customer&&id==temp.customer._id){
						hasFind=true;
						break;
					}
				}
				else{
					var arr=temp.contacts;
					for(var k=0;k<arr.length;k++){
						if(id==arr[k]._id){
							hasFind=true;
							break;
						}
					}
				}
			}
			return hasFind;
		}
	},
	tabFuncCfg:{
		changeListRow:function(cfg){
			var fromModule=cfg.content.children("iframe").get(0).contentWindow.moduleName;
			//编辑时 如果是 个人客户转为企业客户  需删除个人客户
			if(moduleName=='customer' && fromModule=='contact'){
				if(this.type==2){
//					mydlg.tabFuncCfg.deleteListRow.call(this,cfg);
				}
			}
			else if(fromModule!=moduleName){//不同模块，忽略
				return;				
			}

			$.bindTable.defaults.changeRow(this);
		},
		deleteListRow:function(cfg){
			$block_list.find("#tb_" + this._id).trigger('delete');
			showCount();
		},
		//相关资料 添加
		relateInsert:function(cfg){
			var fromModule=cfg.content.children("iframe").get(0).contentWindow.moduleName;			
			var temp={
					data:this,
					from:fromModule
				};
			if(!mydlg.checkIsMine(temp))
				return;
			var relaTable=$("#module_"+fromModule+"_relate_table");
			mobiList.table=relaTable.children("div#relateTable");
			mobiList.initHead();
			mobiList.insertFirst(this);
		},
		relateTableChange:function(cfg){
			var fromModule=cfg.content.children("iframe").get(0).contentWindow.moduleName;
			var temp={
					data:this,
					from:fromModule
				};
			//删除 同样走编辑的 callback
			if(this._relateTableDoDelete){
				$("#module_"+fromModule+"_relate_table").find("#lb_"+this._id).remove();
				return;
			}
			if(!mydlg.checkIsMine(temp))
				return;
			$(document.body).children("div.window").find("div.moreWindow").window({
				closed:true
			});
			var relaTable=$("#module_"+fromModule+"_relate_table");
			mobiList.table=relaTable.children("div#relateTable");
			mobiList.initHead();
			mobiList.changeRow(this);
		},
		addListRow:function(cfg){
			var fromModule=cfg.content.children("iframe").get(0).contentWindow.moduleName;
			//不同模块不处理
			$.bindTable.defaults.insertFirst(this);
			count++;
			showCount();
		}
	},
	addEvent:function(param){
		param.elem.bind("click",function(e){
			$.stopEvent(e);
			delete param.elem;
			mydlg.openByTag(param);
		});
	},
	getInst:function(){
		return parent.$("#_crm_tab_ctrl_div_").data("jqueryTab");
	},
	openByTag:function(cfg){
		var inst=this.getInst();
		inst.createTab(cfg,true);
		if(cfg.closeKey){
			inst.closeTabByKey(cfg.closeKey);
		}
	},
	openDetailTab:function(param){
		var inst=this.getInst();
		inst.changeTabSrc(param);
	},
	openEditTab:function(param){
		var inst=this.getInst();
		inst.changeTabSrc(param,'(编辑)');
	},
	closeCurTab:function(param){
		var inst=this.getInst();
		if(param){
			inst.closeTabAndChange(param);
		}
		else{
			inst.closeCurTab(true);
		}
	},
	delTabById:function(key){
		this.getInst().closeTabByKey(key);
	},
	//以下为 方案1 窗口模式   不使用
	open:function(e){
		$.initEvent(e);
		mydlg.src=mydlg.addParam($(e.src).attr("frameLink"));
		mydlg.curRelate=$(e.src).parents("div.tabDiv");
		mydlg.curDateKey=mydlg.curRelate.attr("datakey");
		mydlg.hiddenOther();
		//mydlg.getMask();
		mydlg.getDlg();
		mydlg.getframe();
	},
	hiddenOther:function(){
		$(document.body).children("div.frame_main_content").hide();
		$(document.body).addClass("doOpenMyDlg");
	},
	addParam:function(info){
		if(info.indexOf("?")>-1){
			info+="&"+this.commonParam;
		}else{
			info+="?"+this.commonParam;
		}
		return info;
	},
	getMask:function(){
		this.mask=$(document.body).children("div.window-mask");
		if(!this.mask.length){
			this.mask=$("<div class='window-mask'>").appendTo($(document.body));
		}
		this.mask.css({
			width:mydlg.doc.width(),
			height:mydlg.doc.height()
		});
		this.mask.show();
	},
	getDlg:function(){
		this.dlg=$(document.body).children("div.my_dlg");
		if(!this.dlg.length){
			this.dlg=$("<div class='my_dlg'>").appendTo($(document.body));
			this.tool=$("<div class='my_dlg_tool'>").appendTo(this.dlg);
			this.content=$("<div class='my_dlg_content'>").appendTo(this.dlg);
		}
		this.dlg.show();
	},
	getframe:function(){
		this.frame=$("<iframe src='"+this.src+"' width='"+document.documentElement.clientWidth+"px' height='"+document.documentElement.clientHeight+"px' />").appendTo(this.content);
	},
	initframe:function(){
		this.from=$.getSearchValue("_openFrom_");
		if(this.checkFrom()){			
			$("#layout_header").hide();
			$("#layout_nav").hide();
		}
	},
	checkFrom:function(){
		if(this.from&&this.from=="mydlg"){	
			return true;
		}
		else
			return false;
	},
	doBack:function(param){
		//超时重新登录 跳转时  则无父对象
		if(this.checkFrom()&&parent&&parent.mydlg){
			parent.mydlg.doCloseDlg(param.hasChange);
		}
		else{
			location.href=param.href;
		}
	},
	doCloseDlg:function(hasChange){
		this.frame.remove();
		this.dlg.hide();
		$(document.body).children("div.frame_main_content").show();
		$(document.body).removeClass("doOpenMyDlg");
		if(hasChange){
			this.queryRelate();
		}
	},
	queryRelate:function(){
		var cfg=moduleTabCfg[moduleName];
		$(cfg.table).each(function(){
			if(this.key!=mydlg.curDateKey){
				return;
			}
			var url=this.page.url;
			var inst=this;
			var param={
				id: id
			}
			if(cfg.limit){
				param.l=cfg.limit;
			}
			$.getJSON(url,param,function(datas){	
				if(datas.rows){
					var temp=mydlg.curRelate.find("#relateTable");
					temp.children(".body").empty();
					mobiList.fillElemFromBean(temp,datas.rows);
				}				
			});
		})
	}
}
var mobiList={
	data:{},
	key:0,
	keyName:'jqMobi_',
	curKey:null,
	curData:null,
	table:null,
	head:null,
	body:null,
	pageCount:0,
	funcMap:{
		bindContact:function(elem,val){
			elem.html("");		
			var a=$("<a href='javascript:void(0)'/>").appendTo(elem);
			a.text(val.contact.name);
			mydlg.addEvent({
				elem:a,
				link:'/contact/detail?id='+val.contact._id,
				title:val.contact.name,
				key:val.contact._id+'_detail',
				change:'relateTableChange'
			});
		},
		bindTitle:function(elem,val){
			mobiList.getKey();
			var module=mobiList.paramMap[mobiList.curKey].key;
			elem.html("");
			var a=$("<a href='javascript:void(0)' />").appendTo(elem);
			a.text(val[elem.attr("jtext")]);
			mydlg.addEvent({
				elem:a,
				link:"/"+module+"/detail?id="+val._id,
				title:a.text(),
				key:val._id+'_detail',
				change:'relateTableChange'
			});
		}
	},
	paramMap:{},
	getTableParam:function(table){
		this.table=table;
		this.getKey();
		return this.paramMap[this.curKey];
	},
	setTableParam:function(table,param){
		this.table=table;
		this.getKey();
		this.paramMap[this.curKey]=param;
	},
	qryMore:function(){
		//获取关联表格信息
		var $this=$(this);
		var top=$this.parent().parent();
		var table=parent.find(".listTable");
		var param=mobiList.getTableParam(table);
		var title=parent.find(".tableTitle").text();
		//创建jquery window
		var win=$("<div class='moreWindow'>").appendTo(document.body);
		win.width(table.width());
		//var crtl=$("<div class='moreCtrl'>").appendTo(win);
		//var winTitle=$("<div class='moreTitle'>").text(title).appendTo(win);
		var moreTable=$("<div class='tableDiv listTable'>").appendTo(win);
		mobiList.setTableParam(moreTable,param);
		var head=$("<div class='head'>").appendTo(moreTable).html(table.find("div.head").html());
		var body=$("<div class='body'>").appendTo(moreTable);
		body.bind("scroll",mobiList.bindScrollPage);
		moreTable.css("min-height",table.height());
		mobiList.pageCount=0;
		mobiList.firePage(body);
		win.window({
			modal:true,
			collapsible: false,
			minimizable: false,
			maximizable: false,
			title:title,
			//closable: false,
			resizable:false,
			//noheader:true,
			shadow:false,
			onclose:function(){
				mobiList.destroy(moreTable);
			},
			closed:false
		});
		win.parent().find(".window-header").addClass("moreTableTitle");
	},
	destroy:function(table){
		this.table=table;
		this.getKey();
		this.paramMap[this.curKey]=null;
		this.funcMap[this.curKey]=null;
	},
	bindScrollPage:function(){
		var temp=$(this);
		var scrollTop=temp.scrollTop();
		var h=temp.height();
		var total=temp.get(0).scrollHeight;
		var pageCount=temp.attr("curPageI");
		if(total-h-scrollTop<2){
			if(!pageCount){
				pageCount=1;
			}
			else{
				pageCount=parseInt(pageCount);
			}
			mobiList.pageCount=pageCount;
			temp.attr("curPageI",pageCount+1);
			mobiList.firePage(temp);
		}
	},
	createHead:function(table,head,param){
		table.addClass("listTable");
		var th=$("<div class='head'>").appendTo(table);
		var total=head.length;
		var width=100/total-0.5+"%";
		$(head).each(function(i){
			var tr=$("<div>").appendTo(th);
			var td;
			if(this.type){
				td=$(this.type).appendTo(tr);
			}
			else{
				td=$("<div>").appendTo(tr);
			}
			td.addClass("td");
			if(this.cl){				
				td.addClass(this.cl);				
			}
			td.css("width",width);
			td.text(this.name);
			td.attr('jtext',this.jtext);
			td.attr('bindFunc',this.func);
			if(i==total-1){
				td.css("backgroundImage","none");
			}
		});
		this.table=table;
		this.getKey();
		this.paramMap[this.curKey]=param;
		this.table=null;
	},
	doTrOver:function(){
		$(this).addClass("rowOver")
	},
	doTrOut:function(){
		$(this).removeClass("rowOver")
	},
	createBody:function(table,param){
		var body=$("<div class='body'>").appendTo(table);
		if(param){
			if(param.css!=null){
				body.css(param.css);
			}
		}
		var pageCfg=this.paramMap[this.curKey];
		//分页方式  滚动条模式  其他待续
		if(pageCfg&&pageCfg.page&&pageCfg.page.type=="scroll"){
			body.bind("scroll",mobiList.bindScrollPage);
		}
	},
	//触发分页查询
	firePage:function(body){
		this.table=body.parent();
		var noData=this.table.attr("noData");
		if(noData&&noData=='y'){
			return;
		}
		this.getKey();
		var param=this.paramMap[this.curKey];
		if(!param||!param.page){
			return;
		}
		var pageParam={
			id:id,
			l:param.pageSize,
			i:param.pageSize*this.pageCount++
		}
		$.getJSON(param.page.url,pageParam, function(data) {
			if(!data||data.rows.length<1){
				mobiList.table.attr("noData","y");
			}
			else{
				mobiList.fillElemFromBean(mobiList.table,data.rows);
			}
		});
	},
	fillElemFromBean:function(elem,data){
		this.table=elem;
		this.getKey();
		this.data[this.curKey]=data;
		this.curData=data;
		this.initHead();
		var inst=this;
		$(data).each(function(){
			inst.body.append(inst.renderSub.call(this));
		});
	},
	addFunc:function(elem,key,param){
		this.table=elem;
		this.getKey();
		this.funcMap[key]=param;
	},
	getKey:function(){
		if(!this.table.attr("mobiTAbleKey")){
			this.curKey=this.keyName+this.key++;
			this.table.attr("mobiTAbleKey",this.curKey);
		}
		else{
			this.curKey=this.table.attr("mobiTAbleKey");
		}
	},
	initHead:function(){
		this.head=this.table.find("div.head").children();
		this.body=this.table.find("div.body");
		if(this.body.length==0){
			this.body=$("<div class='body' />");
			this.table.append(this.body);
		}
	},
	insertFirst:function(data){
		var tr=this.renderSub.call(data);
		this.body.prepend(tr);
	},
	changeRow:function(data){
		var record=this.body.children("#lb_"+data._id);
		if(!record.length){
			this.insertFirst(data);
			return;
		}
		var tr=this.renderSub.call(data);
		tr.insertBefore(record);
		record.remove();
	},
	renderSub:function(){
		var row=this;
		var tr=$("<div class='tr' id='lb_"+this._id+"'/>");
		var param=mobiList.paramMap[mobiList.curKey];
		if(param!=null&&param.css!=null){
			tr.css(param.css);
		}
		tr.bind({
			mouseout:mobiList.doTrOut,
			mouseover:mobiList.doTrOver
		});
		//tr.data("rowData",row);
		$(mobiList.head).each(function(){
				var cell=$(this);
				var td=$(cell.html());
				mobiList.bindCell(td,row);							
				tr.append(td);
		});
		return tr;
	},
	bindCell:function(elem,data){
		var jtext=elem.attr("jtext");
		var val=data[jtext];
		if(!val){
			val='';
		}
		switch(this.type(elem,data)){
			case 'func':break;
			case 'img':elem.attr("src",val);break;
			case 'input|text':elem.val(val);break; 
			case 'other':elem.text(val);break;	
			case 'link':elem.attr("href",elem.attr("href")+data['_id']);elem.text(val);break;
		}
	},
	type:function(elem,val){
		var isFunc=elem.attr("bindFunc");
		if(isFunc&&isFunc!=""){
			 (this.funcMap[isFunc])(elem,val);
			 return "func";
		}
		var name=elem.get(0).tagName.toLowerCase();
		if(name=="img")
			return name;
		if(name=='a')
			return "link";
		if(name=="input")
			return name+"|"+elem.get(0).type;
			
		return "other";
	}
};