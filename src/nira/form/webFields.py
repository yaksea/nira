'''
Created on 2012-10-9

@author: Administrator
'''
from nira.common.utility import parse_json

#searchFields = {
#'customer':[u'companySize', u'assets', u'level', u'initial', u'filter', u'source', u'tags', u'turnover', u'customerType', u'registeredCapital', u'name'],
#'contact':[u'filter', u'phone', u'name', u'tags', u'department', u'gender', u'initial'],
#'follow':[u'filter', u'attendants', u'tags', u'startTime', u'contactType', u'address', u'subject'],
#'opportunity':[u'status', u'expectedDate', u'expectedAmount', u'possibility', u'filter', u'tags', u'milestone', u'subject'],
#'order':[u'status', u'code', u'payType', u'filter', u'phone', u'amount', u'tags', u'address', u'createTime', u'subject'],
#'contract':[u'status', u'code', u'effectiveDate', u'payType', u'signedDate', u'filter', u'amount', u'tags', u'address', u'createTime', u'subject'],
#'customer_care':[u'subject', 'tags','type','status'],
#'anniversary':[u'subject','tags', 'type'],
#'product':[u'name','tags', 'code', 'model']
#}
#orderFields = {
#'customer':[u'companySize', u'assets', u'level', u'source', u'turnover', u'customerType', u'registeredCapital', u'name'],
#'contact':['name', 'department'],
#'follow':['startTime', 'contactType', 'subject'],
#'opportunity':[u'status', u'expectedDate', u'expectedAmount', u'possibility', 'milestone', u'subject'],
#'order':[u'status', u'code', u'payType','amount', 'createTime', u'subject'],
#'contract':[u'status', u'code', u'effectiveDate', u'payType', u'signedDate', u'amount', u'createTime', u'subject'],
#'customer_care':[u'subject', 'type','progress'],
#'anniversary':[u'subject', 'type', 'anniversary'],
#'product':[u'name', 'code', 'model']
#}

listFields = {
'customer':['tags','type', u'companySize', u'assets', u'level', u'source', u'logo_thumbnail', u'version', u'turnover', u'owner', u'_id', u'customerType', u'registeredCapital', u'name'],
'contact':['tags', 'type', 'taobao_flag',u'customer', u'name', u'gender', u'department', u'photo_thumbnail', u'phone', u'version', u'internalAddress',u'externalAddress', u'owner', u'position', u'_id'],
'follow':['tags',u'attendants', u'endTime', u'contacts', u'contactType', u'version', u'startTime', u'address', u'owner', u'_id', u'subject'],
'opportunity':['tags',u'customer', u'opportunityStatus', u'expectedDate', u'expectedAmount', u'possibility', u'contact', u'version', u'milestone', u'owner', u'_id', u'subject'],
'order':['tags', u'customer', u'status', u'payType', u'contact', u'phone', u'amount', u'version', u'address', u'owner', u'_id', u'createTime', u'subject'],
'contract':['tags', 'approvers', u'customer', u'status', u'effectiveDate', u'payType', u'signedDate', u'contact', u'amount', u'version', u'address', u'owner', u'_id', u'createTime', u'subject'],
'customer_care':['tags', u'subject', 'progress', 'type','_id', 'customer', 'contact', 'date'],
'anniversary':['tags', u'subject', 'type','_id', 'contact', 'date', 'comingDate'],
'product':[u'name','tags', 'code', 'model','_id', 'category', 'count', 'unitType', 'image_thumbnail','specification', 'color']
}

pickerListFields = {
              'project':['name', 'code'],
              'version':['name', ],
              'order':['subject', 'code', 'phone', 'createTime', 'customer'],
              'product':['name', 'category', 'model','suggestPrice', 'code'],
              'sys_user':['realName'],
              'role':['name'],
              'module':['name']
              }

relatedListFields = {          
              'contact':['position',  'name', 'department'],
              'follow':['subject','startTime'],
              'opportunity':['milestone', 'subject', 'contact'],
              'customer_care':['subject', 'date'],
              'anniversary':['subject', 'date'],
              'order':['subject', 'amount', 'createTime', 'status'],
              'contract':['subject', 'amount', 'createTime', 'status']              
              }

nameFields = {
              'customer':'name',
              'contact':'name',
              'follow':'subject',
              'order':'subject',
              'contract':'subject',
              'opportunity':'subject',
              'anniversary':'subject',
              'customer_care':'subject',
              'product':'name'  
              }

if __name__ == '__main__':  
    for moduleName in ('customer', 'contact', 'follow', 'opportunity', 'order', 'contract', 'product'):
        data = parse_json('../data/demo/pagedList.json')
        item = data['common']['request']['conditions']
        if data.get(moduleName):
            item.update(data[moduleName]['request']['conditions'])
            print moduleName
            print item.keys() 
            
    for moduleName in ('customer', 'contact', 'follow', 'opportunity', 'order', 'contract', 'product'):
        data = parse_json('../data/demo/pagedList.json')
        item = data['common']['response']
        if data.get(moduleName):
            item.update(data[moduleName]['response'])
            print moduleName
            print item.keys()

