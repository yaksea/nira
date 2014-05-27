#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.base.handlers.formHandler import FormRequestHandler
from nira.form.formAdapter import getFieldOption
from nira.data.mongodbManager import mongo
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.common import utility
from nira.form import formAdapter
import decimal
import datetime

CHINESE_CALENDAR = {'month': ('正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '腊'),
                    'day': ('初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '廿十',
                            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '卅十')                        
                    }
decimal.getcontext().prec = 2

class DataParseRequestHandler(FormRequestHandler):    
#    数据输出处理
    def __init__(self, *args, **kwargs):
        super(DataParseRequestHandler, self).__init__(*args, **kwargs)


        
    def parseTable(self, value):
        if type(value) == list:
            tt = []
            for item in value:
                ti = item.get('number') or item.get('text') or ''
                if item.get('type'):
                    ti += '(%s)' % item['type']
                tt.append(ti)
            return ','.join(tt)
        else:
            return value
    

            
    def parseSingleFieldValue(self, fieldName, value, parseMode=1, moduleName=None):
#        parseMode 0:做编辑用， 1：做显示用， >1：特殊处理
        fieldsDef = self.getFieldsDef(moduleName or self.module.name)
        field = fieldsDef.get(fieldName)
        if field:
            ft = field.get('formType') or ''
            vt = field['valueType'] 
            
            if ft in ('Select', 'RadioButton'):
                if vt=='int' and parseMode in (0, 2):
                    return value
                return getFieldOption(field['options'], value) 
            elif ft == 'VersionPicker':
                return "%s.%s"%(value['major'], value['minor'])               
            elif ft == 'TagEditor':
                return ', '.join(value)            
            elif ft in ('CustomerPicker', 'ContactPicker'):
                return value.get('name')
            elif ft in ('InternalAddress', 'ExternalAddress', 'Education'):
                return ','.join([i['detailDesc'] for i in value])
            elif ft in ('DetailAddress','Address'):
                return value['detailDesc']
            elif ft.endswith('Table'): 
                return self.parseTable(value)                        
            elif vt == "date":
                if fieldName=='comingDate':
                    return self.parseComingDate(value)
                else:
                    return utility.getFormattedTime(value, 2)
            elif vt == "time":
                return utility.getFormattedTime(value, 1)  
            elif vt == "anniversary":
                return self.parseAnniversary(value)                 
            elif vt == "money":
                if parseMode==0:
                    value['amount'] = '%0.2f'%value['amount']           
                elif parseMode==1:
                    value = '%0.2f%s'%(value['amount'], value.get('currency') or '元')   
                elif parseMode==2:
                    value = value['amount']
                return value
            elif vt == "sign": #{'time':,'location':}
                value['time'] = utility.getFormattedTime(value['time'], 1)     
                return value
            elif self.identity.sysId > 0:
                if ft == 'MultiUserPicker':
                    pv = []
                    for userId in value:
                        pv.append(self.parseUser(userId))
                    if parseMode==1:
                        value = ','.join([u['userName'] for u in pv])
                    else:
                        value = pv                        
                    return value                
                if ft == 'MultiContactPicker':
                    contacts = []
                    for cs in value:
                        contacts.extend(cs['contacts'])
                    return  ','.join([c['name'] for c in contacts])       
                elif ft == 'CategoryPicker':
                    return self.parseCategory(value, parseMode) 
                                
        elif fieldName == 'createTime':
            return utility.getFormattedTime(value, 2)               
        elif fieldName == 'owner':
            return self.parseUser(value['_id'])
        elif fieldName == 'sharers' :
            pv = []
            for user in value:
                pv.append(self.parseUser(user['_id']))
            return pv 
            
        return value 
                        
    def parseForDisplay(self, rawData, moduleName=None):
        moduleName = moduleName or self.module.name
        parsedData = {}
        for fieldName, rawValue in rawData.items():
            if fieldName in ('projectId', 'versionId', 'userId'):#project version user, _id-->name
                fn = fieldName[:-2]
                _dict = getattr(self, fn+'Dict')
                parsedData[fn] = _dict[rawValue]
                parsedValue = rawValue           
            else:
                parsedValue = self.parseSingleFieldValue(fieldName, rawValue, 1, moduleName)            
            
            if parsedValue or parsedValue==0:
                parsedData[fieldName] = parsedValue
                    
        return parsedData
        

   
    
    def parseForPicker(self, rawData):
        moduleName = self.module.name
        fieldsDef = self.getFieldsDef(moduleName or self.module.name)
        parsedData = {}
        for fieldName, rawValue in rawData.items():
            field = fieldsDef.get(fieldName) 
            vt = field['valueType']
             
            if vt == "money":
                parsedValue = self.parseSingleFieldValue(fieldName, rawValue, 2, moduleName)
            else:
                parsedValue = self.parseSingleFieldValue(fieldName, rawValue, 1, moduleName)
            
            if parsedValue or parsedValue==0:
                parsedData[fieldName] = parsedValue
        return parsedData
        

                
                        
        
    
    def parseValue(self, data={}, parseOption=True, moduleName=None, parseExcel=False, parsePicker=False, parseMobile=False):
        sysId = self.identity.sysId
        moduleName = moduleName or self.module.name
        handler = self.module.handler
#        c = dict(pagedList, mobileList, edit, detail, excelExport)
        fieldsDef = self.getFieldsDef(moduleName)
        
        for key, value in data.items():
            field = fieldsDef.get(key)
            if field:
                type = field.get('formType') or ''
                ft = field['valueType'] 
                
                if type in ('Select', 'RadioButton') and ft!='int' and parseOption:
                    value = getFieldOption(field['options'], value)    
                elif type == 'TagEditor' and handler in ('Data',) and parseOption:
                    value = ', '.join(value)            
                elif type in ('CustomerPicker', 'ContactPicker'):
                    if value and parseExcel:
                        value = value.get('name')
                elif type.endswith('Table') and parseOption and not parseMobile: #详情页
                    value = self.parseTable(value)                        
                elif ft == "date":
                    if key=='comingDate':
                        value = self.parseComingDate(value)
                    else:
                        value = utility.getFormattedTime(value, 2)
                elif ft == "time":
                    value = utility.getFormattedTime(value, 1)  
                elif ft == "anniversary" and parseOption:
                    value = self.parseAnniversary(value)                 
                elif ft == "money" and not parseMobile:
                    if parsePicker:
                        value = value['amount']
                    elif parseOption:
                        value = '%0.2f%s'%(value['amount'], value.get('currency') or '元')   
                    else:
                        value['amount'] = '%0.2f'%value['amount']           
                elif ft == "sign": #{'time':,'location':}
                    value['time'] = utility.getFormattedTime(value['time'], 1)     
                elif sysId > 0:
                    if type == 'MultiUserPicker':
                        pv = []
                        for userId in value:
                            pv.append(self.parseUser(userId))
                        if parseOption:
                            value = ','.join([u['userName'] for u in pv])
                        else:
                            value = pv
                    elif type == 'CategoryPicker':
                        value = self.parseCategory(value, parseOption)                 
                
                if value!=None and value!='':
                    data[key] = value
                else:
                    data.pop(key)
                 
                                                       
                    
            elif sysId > 0:
                if key == 'owner':
                    data[key] = self.parseUser(value['_id'])
                elif key == 'sharers' :
                    pv = []
                    for user in value:
                        pv.append(self.parseUser(user['_id']))
                    data[key] = pv  
                            
            
            if key == 'createTime':
                data[key] = utility.getFormattedTime(value, 2)                   
                              
        return data   

















