#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.data.mongodbManager import mongo, notDeleted
from nira.base.handlers.formHandler import FormRequestHandler
import json
from nira import settings
from tornado import template
from nira import data as dh
from nira.common import utility, log
from nira.common.utility import tryParse
from nira.form import webFields, formAdapter
from nira.common.cache.sessionManager import Session
from nira.common.cache.sysCacheManager import SysCache



TYPES = {'str':unicode, 'list': list, 'float': float, 'int': int, 'dict': dict}

class BaseEditRequestHandler(FormRequestHandler):
    def verifyTable(self, value):
        tt = []
        for item in value:
            ti = item.get('number') or item.get('text')
            if ti:
                tt.append(item)
        return tt
 
    def preprocessing(self, params):
        pass
    
    def dataReprocessing(self, vals):
        pass
    
    def outputProcessing(self, vals):
        pass    
    
                
    def returnFields(self, row):
        fields = webFields.listFields.get(self.module.name)
        if fields:
            fields = set(fields)            
            fields.update(('_id', 'isDeleted', 'version', 'owner', 'sharers'))  
            return list(set(row) & set(fields))
        else:            
            return row.keys()
        
    def getVerifiedValue(self, formName):
        fields = formAdapter.getFieldsDef('task')
        params = self.params
        id = params.pop('id')
        newValues = {}
        for k,v in params.items():
            fd = fields.get(k)
            if not fd:
                continue
            vt = fd['valueType']
            pt = type(vt)
            if pt==str:
                value = tryParse(v, TYPES[vt], fd.get('default'))
                if value != None:
                    newValues[k] = value             
            elif pt==dict:
                if type(v) == dict:
                    value = {}
                    for sk, sv in v:
                        st = pt.get(sk)
                        if st:
                            value[sk] = tryParse(sv, TYPES[st])
                    if value:
                        newValues[k] = value
        return id, newValues
        
    def verifyValues(self, data=None, verifyRequired=True):
        params = data or self.params
        fieldsDef = self.fieldsDef
        if not fieldsDef or not self.editableFields:#skip verify
            return params
        
        doc = {}
        
        self.preprocessing(params)
        log.out(params)
        sysId = self.identity.sysId
        formName = self.module.name
        
        #域完整性约束
        if verifyRequired:
            for k,v in fieldsDef.items():
                if k in self.editableFields:
                    if v.get('required')==True and (params.get(k)==None or params.get(k)==''):
                        self.sendMsg_WrongParameter("%s为必填"%v['label'])                

            
        for fieldName, val in params.items():                    
            if fieldName in self.editableFields:
                if val=="":
                    continue
                
                field = fieldsDef[fieldName]
                
                    
                vt = field['valueType']
                ft = field.get('formType') or ''
        
                
                typedVal = val
                if  vt == 'json':
                    if type(val) != dict:
                        typedVal = json.loads(val)
                elif vt == 'str':
                    typedVal = val
    #                typedVal = xhtml_escape(val)
                    maxLen = field.get('maxLen')
                    if maxLen and len(typedVal) > int(maxLen):
                        self.sendMsg("请适当控制 [" + field['label'] + "] 的文字长度。", 500)
                elif vt == "date":
                    typedVal = utility.getTimeFromStr(val, 2)
                elif vt == "time":
                    typedVal = utility.getTimeFromStr(val, 1)
                elif vt == "money":
                    if type(val) != dict:
                        val = json.loads(val)
                    if not val.has_key('amount'):
                        continue
                    typedVal = {'amount':tryParse(val['amount'], float, 0)}
                    if val.get('currency'):
                        typedVal['currency'] = str(val['currency'])
                elif vt == "anniversary":
                    if type(val) != dict:
                        val = json.loads(val)
                    
                    typedVal = {'calendar':tryParse(val['calendar'], int),
                                        'month':tryParse(val['month'], int),
                                        'day':tryParse(val['day'], int)}
                    if val.get('year'):
                        typedVal['year'] = tryParse(val['year'], int)
                    
                elif vt.startswith('list'):
                    if type(val) != list:
                        try:
                            val = json.loads(val)
                        except:                        
                            val = val.split(',')
                            
                    typedVal = val or None
                    
                    if typedVal and type(typedVal) != list:
                        typedVal = [typedVal]
                          
                    if typedVal and vt.startswith('list|'):
                        subtype = vt.split('|')[1]
                        if TYPES.has_key(subtype):
                            typedVal = [TYPES[subtype](subval) for subval in typedVal]
                    
                    if typedVal and ft.endswith('Table'): 
                        typedVal = self.verifyTable(typedVal) or None
                         
                elif TYPES.has_key(vt):
                    try:
                        typedVal = TYPES[vt](val)
                    except:
                        self.sendMsg("请填写正确的" + field['label'], 500)   

                                            
                if typedVal!=None:
                    doc[fieldName] = typedVal
                
                

                
                         
                #唯一性约束
                if field.get('unique'):
                    conditions = {'sysId':sysId, 'isDeleted': notDeleted, fieldName: typedVal}
                    id = self.params['id']  #编辑
                    if id:
                        conditions['_id'] = {'$ne': id}
                    row = mongo.db[formName].find_one(conditions)
                    if row:
                        self.sendMsg_Duplicated(field['label'] + "不能重复。")
                     
        if not doc:
            self.sendMsg_WrongParameter()
        else:
            return doc         

            
    @property
    def formTempalte(self):
        key = SysCache.Keys.EditTemplate % self.module.name
        tempalte = self.sysCache[key] 
        if not tempalte:
            formDef = self.formDef
            
            forms = []  
            for blockName in formDef['sequence']:
                forms.append('<dl class="form_module"><dt>%s</dt>' % blockName)
                for fieldName in formDef['blocks'][blockName]:                    
                    self._buildField(fieldName, forms)
                forms.append('</dl>')            
  
            tempalte = ''.join(forms) 
            self.sysCache[key] = tempalte
        
        return tempalte

    def _buildField(self, fieldName, formStr):   
        fieldDef = self.fieldsDef[fieldName]
        
        if fieldDef.has_key('display') and 'edit' not in fieldDef['display']:
            return
        
        fieldDef['default'] = fieldDef.get('default') or ""

        fieldDef['required'] = fieldDef.has_key('required')
        

        xconfig = "";
        if fieldDef['required'] or fieldDef.has_key('validator'): 
            if type in ["TextBox", "OrderCode" , "ContractCode", "ProductCode"]:
                xconfig += ' class="easyui-validatebox"'
            if fieldDef.has_key('validator'):
                xconfig += ' validType="%s"' % fieldDef['validator']
            if fieldDef.has_key('invalidMessage'):
                xconfig += ' invalidMessage="%s"' % fieldDef['invalidMessage']

        
        if fieldDef['required']:
            xconfig += ' required="true"'                                    
    
        loader = template.Loader("templates/form")
        formStr.append(loader.load("%s.html" % fieldDef['formType']).generate(fieldDef=fieldDef, fieldName=fieldName, xconfig=xconfig, context=self))
