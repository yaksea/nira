from nira.base.wrapper import authenticate
from nira.data.mongodbManager import mongo
from nira.form import webFields
from nira.base.handlers.dataHandler import DataRequestHandler

class PickerListRequestHandler(DataRequestHandler):
    @property
    def fields(self):
        return mongo.getFieldsDict(webFields.pickerListFields[self.module.name])
#        return ','.join(webFields.pickerListFields[self.module.name] + ['_id'])
    
    def outputProcessing(self, dataRow):
        return dataRow
            
    @authenticate
    def post(self):
        self.get()
        
    @authenticate
    def get(self):
        moduleName = self.module.name
        
        
        
        
        rows = mongo.db[moduleName].find({},self.fields);
        results = []
        for row in rows:
            results.append(self.parseForDisplay(row, moduleName))
        self.sendMsg(rows=results)
        
        
        
        self.filterByPermission()
        
        keywords = self.params['keywords'] or self.params['q']
        keywords = keywords.strip()
        
        nameField = nameFields[moduleName]
          
        if keywords:
            sc = [WildcardQuery(nameField, '*%s*' % keywords)]
            if moduleName in ('customer', 'contact'):                
                sc.append(WildcardQuery('name_jianpin', '*%s*' % keywords.lower()))
            self._conditions.append(BoolQuery(should=sc))
        
        customerId = self.params['customerId']
        if customerId:
            self._conditions.append(TermQuery('customer._id', customerId))
            
        type = self.params['type']
        if type:
            type = tryParse(type, int, 0)
            self._conditions.append(TermQuery('type', type))                 
            
        q = BoolQuery(must=self._conditions, must_not=TermQuery("isDeleted", True))
        kwargs = dict(fields=self.fields)
        
        kwargs['start'] = tryParse(self.params['i'], int, 0)
        kwargs['size'] = tryParse(self.params['l'], int, 1000)  
        kwargs['sort'] = nameField + '_pinyin'
        
        results = searcher.search(moduleName, q, **kwargs)       
        
        rows = []
        for row in results:
            row = self.parseForDisplay(row)
            row = self.outputProcessing(row)
            rows.append(row)

        self.sendMsg(total=results.count(), rows=rows)   