#coding=utf-8
'''
Created on 2012-2-7

@author: Administrator
'''
import json
import os
import copy
from nira import settings
from nira.common.utility import parse_json




def getFieldOption(options, val):
    for op in options:
        if op[0] in (val, str(val)):
            return op[1]
    return ''


__formsDef = {}
__visibleFields = {}
__editableFields = {}

MODULES_DEF = parse_json(os.path.join(settings.PATH['root'], "modules/modules.json").replace('\\', '/'))

def __initFormsDef():
    for moduleName, modDef in MODULES_DEF.items():
        if modDef.get('isEntity'):
            print moduleName
            fp = '%s/%s.json'%(os.path.dirname(__file__), moduleName)
            __formsDef[moduleName] = parse_json(fp)
        
__initFormsDef()

def getFormDef(moduleName):
    fd = __formsDef[moduleName]
    if fd:
        return copy.deepcopy(fd)

def getFieldsDef(moduleName):
    fd = __formsDef[moduleName]
    if fd:
        return copy.deepcopy(fd['fields'])

def getVisibleFields(moduleName):
        if not __visibleFields.has_key(moduleName):
            __visibleFields[moduleName] = []
            formDef = __formsDef[moduleName]
            if formDef:
                fieldsDef = formDef['fields']
                for block in (formDef.get('blocks') or {}).values():
                    for field in block:
                        fdef = fieldsDef[field]
                        if not fdef.get('display') or 'view' in fdef['display']:
                            __visibleFields[moduleName].append(field)    
                
        
        return copy.deepcopy(__visibleFields[moduleName])

def getEditableFields(moduleName):
    if not __editableFields.has_key(moduleName):
        __editableFields[moduleName] = []
        fieldsDef = __formsDef[moduleName]['fields']
        for field in getVisibleFields(moduleName):
            fdef = fieldsDef[field]
            if not fdef.get('display') or 'edit' in fdef['display']:
                __editableFields[moduleName].append(field)    
    
    return copy.deepcopy(__visibleFields[moduleName])

   
if __name__ == '__main__':
#    cc = json.loads("")
    print len('qwer')
#    print xhtml_escape('&nbsp;')
    
    
#    print types
#    xx = ''
#    if not xx:
#        print 'werwe'
#    print type('asdfsdf') == types.["str"]
#    build()
#    u = User()
#    u.dx = 'asdf'
#    print u.dx
    
    pass
    
    
    
    
    
    
    
    
    
    
