//depends on comboPicker, searchBox
(function($) {
	var $project, $version, $build;
	$(function(){
		$project = $('#pathNav-project');
		$version = $('#pathNav-version');
		$build = $('#pathNav-build');
		
		if($project){
			$project.searchBox({url:'/project/pickerlist', textField:'name', onSelectChange:function(rowData){
				$.setCookie('projectId', rowData._id);
				if($version){					
					$version.searchBox({url:'/version/pickerlist','conditions':{'projectId':rowData._id},
						textField:'name', onSelectChange:function(rowData){
							$.setCookie('versionId', rowData._id);
//							if($build){
//								$build.searchBox({url:'/build/pickerlist','conditions':{'projectId':rowData._id},
//									textField:'name', onSelectChange:function(rowData){
//										$.setCookie('versionId', rowData._id);
//										if($build){
//											
//										}
//									},onBound:function(){
//										
//										this.selectIndex(0);
//									}}).searchBox('bindData');
//							}
						},onBound:function(){
							this.selectIndex(0);
						}}).searchBox('bindData');
				}
			}, onBound:function(){
//				console.info(this);
				this.selectIndex(0);
				this.setValue($.getCookie('projectId'));
			}})
		}
//		if($version){
//			$version.searchBox({url:'/version/pickerlist', textField:'name'});
//		}
	})
	
})(jQuery);