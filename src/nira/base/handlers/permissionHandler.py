#encoding=utf-8
'''
Created on 2012-9-24

@author: Administrator
'''
from nira.base.handlers.formHandler import FormRequestHandler
from nira.form.formAdapter import getFieldOption
from nira.data.mongodbManager import mongo
from nira.base.handlers.jsonHandler import JsonRequestHandler
from nira.base.handlers.sessionHandler import SessionRequestHandler
from nira.common import log

class PermissionRequestHandler(SessionRequestHandler):
    # type: ['read', 'edit']
    def permit(self, data, type='read'):
        if data.has_key('sysId') and data['sysId'] != self.identity.sysId:
            return False
        
        userId = self.identity.userId
        moduleName = self.module.name
         
        if userId < 0 or self.identity.isAdmin:
            return True
        
        if 'contract' in self.identity.roles and moduleName in ('order', 'contract'):
            return True
    
        if moduleName in ('product', 'productcategory'):
            if type == 'read':
                return True
            elif 'product' in self.identity.roles:
                return True
            else:
                return False
        
        if data.has_key('owner') and data['owner']['_id'] == userId:
            return True
        
        if self.identity.isManager and self.identity.deptId in data['owner']['deptIdPath']:
            return True
            
        if type == 'read' and data.has_key('sharers'):
            for sharer in data['sharers']:
                if sharer['_id'] == userId:
                    return True 
                if self.identity.isManager and self.identity.deptId in sharer['deptIdPath']:
                    return True 
                 
        if type == 'read' and moduleName in ('order', 'contract'):
            if data.get('approvers') and userId in data['approvers']:
                return True
            if data.get('signers') and userId in data['signers']:
                return True
                       
        
        return False
    
    def getReadCondition(self, moduleName=None):
        moduleName = moduleName or self.module.name
        condition = {}
        if self.identity.sysId > 0:
            if self.identity.isAdmin or \
                (moduleName in ('order', 'contract') and 'contract' in self.identity.roles) or\
                moduleName in ('product',):
                pass 
            else:
                cor = []
                cor.append({'owner._id':self.identity.userId})
                cor.append({'sharers._id':self.identity.userId})          
            
            
                if self.identity.isManager:
                    deptId = self.identity.deptId
                    cor.append({'owner.deptIdPath':deptId})
                    cor.append({'sharers.deptIdPath':deptId})
                     
                if moduleName in ('order', 'contract'):
                    cor.append({'approvers':self.identity.userId})
                    cor.append({'signers':self.identity.userId})
                
                condition['$or'] = cor
                
        return condition        

        
    @property
    def editCondition(self):        
        if self.identity.isAdmin or \
            (self.module.name in ('order', 'contract') and 'contract' in self.identity.roles) or\
            (self.module.name in ('product',) and 'product' in self.identity.roles):
            condition = {'sysId':self.identity.sysId}           
        elif self.identity.isManager:
            condition = {'$or':[{'owner._id':self.identity.userId}, {'owner.deptIdPath':self.identity.deptId}]}         
        else:
            condition = {'owner._id':self.identity.userId}            
        
        return condition        
 
















