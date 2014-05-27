#encoding=utf-8
'''
Created on 2012-2-8

@author: Administrator
'''



class Params(dict):       
    def __init__(self, *args, **kwargs):
        super(Params, self).__init__(*args, **kwargs)
    
    def __getitem__(self, key):
        if self.has_key(key):
            return super(Params, self).__getitem__(key)
        else:
            return ''

        
        
if __name__ == '__main__':
    p = Params({'weqr':'wqerqwer'});
    print p.pop('weqr')
    print 'done.'
        
        
        