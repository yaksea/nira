#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.data.mongodbManager import mongo
from nira.base.handlers.formHandler import FormRequestHandler
import json
from nira import settings
from tornado import template
from nira.common.cache.sessionManager import Session
from nira.common.cache.sysCacheManager import SysCache

class DetailRequestHandler(FormRequestHandler):
    # 查看
    @property
    def formTemplate(self):
        key = SysCache.Keys.DetailTemplate % self.module.name
        tempalte = self.sysCache[key]   
        
        if not tempalte:
            formDef = self.formDef
            fieldsDef = formDef['fields']
            forms = []  
            for blockName in formDef['sequence']:
                forms.append('<dl class="form_module expand"><dt>%s</dt>' % blockName)
                for fieldName in formDef['blocks'][blockName]:                    
                    self._buildField(fieldsDef[fieldName], forms)
                forms.append('</dl>')            
  
            forms = ''.join(forms)
            tempalte = {'forms': forms}  
            self.sysCache[key] = tempalte            
                   
        return tempalte


    def _buildField(self, field, formStr):     
        if field.has_key('display') and 'detail' not in field['display']:
            return        
        
        type = field.get('formType')    
        
        if self.identity.sysId <0 and type in ('UserPicker','DeptPicker', 'CategoryPicker', 
                                                  'MultiUserPicker', 'OrderPicker', 'ProductPicker'):
            return         
        
        field['required'] = field.has_key('required')
        
        css = field.get('css') or ""

        prefix = ''
        
        if type == 'ImageUploader':
            formStr.append('<dd class="height logo"><img class="value" id="%s" src="/static/images/defaultlogo.jpg" /></dd>' % 
                           (field['name']))
        elif type in ('ProductPicker', 'OrderPicker', 'FileUpload', 'MultiContactPicker', 'AddressSignOn'):
            loader = template.Loader("templates/form")
            formStr.append(loader.load("%s.html"%field['formType']).generate(field=field, prefix=prefix, xconfig='', context=self)) 
        elif type in ['TextArea', 'MultiUserPicker']:
            formStr.append('<dd class="full_width %s"><label class="full_width">%s：</label><span class="value" id="%s"></span></dd>' % (css, field['label'], prefix+field['name']))        
        elif type in ('RichText',):
            formStr.append('<dd class="full_width %s"><label class="full_width">%s：</label><div class="value" id="%s"></div></dd>' % (css, field['label'], prefix+field['name']))        
        elif field.has_key('css'):
            formStr.append('<dd class="%s"><span class="field"><label>%s：</label></span><span class="value" id="%s"></span></dd>' % (css, field['label'], prefix+field['name']))
        else:
            formStr.append('<dd><span class="field"><label>%s：</label></span><span class="value" id="%s"></span></dd>' % (field['label'], prefix+field['name']))

