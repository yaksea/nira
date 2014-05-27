#encoding=utf-8
"""
Created by Eric Lo on 2010-05-20.
Copyright (c) 2010 __lxneng@gmail.com__. http://lxneng.com All rights reserved.
"""
import os

class Pinyin():
    def __init__(self):
        data_path = os.path.join(os.path.dirname(__file__), 'mandarin.dat')
        self.dict = {}
        ff = open(data_path)
        for line in ff:
            k, v = line.split('\t')
            self.dict[k] = v
        self.splitter = ''
        
    
    def _get_char_pinyin(self, char):     
        char = unicode(char.strip())
        if not char:
            return ''
           
        char = char[0]
        key = "%X" % ord(char)
        try:
            resutls = set()
            for r in self.dict[key].split(" "):
                resutls.add(r.strip()[:-1].upper())
            return list(resutls)
        except:
            return [char.upper()]
        
    
    def get_pinyin_list(self, chars="你好吗"):
        chars = unicode(chars)
        
        results = ['']
        for char in chars:     
            py = self._get_char_pinyin(char)  
            if not py:
                continue 
              
            tempR = []
            for ri in py:
                for rj in results:
                    tempR.append((rj+ri).lower())
            results = tempR
                                  
        return results.pop() if len(results)==1 else list(results)
    
    def get_jianpin(self, chars="你好吗"):
        chars = unicode(chars)
        
        results = ['']
        for char in chars:
            py = self._get_char_pinyin(char)  
            if not py:
                continue 
              
            tempR = []
            for ri in py[:11-len(results)]:
                for rj in results:
                    tempR.append((rj+ri[0]).lower())
            results = list(set(tempR))[:10]
            
                                  
        return results.pop() if len(results)==1 else results
    
    def get_pinyin_single(self, chars="你好吗"):
        chars = unicode(chars)
        
        results = []
        for char in chars: 
            py = self._get_char_pinyin(char)
            if py:
                results.append(py[0].lower())
                                  
        return ''.join(results)
    
    
    def get_initials(self, char='你'):
        char = unicode(char)[0]
        results = set()
        for r in self._get_char_pinyin(char):
            ri = r[0].upper()
            ri = '#' if not ri.isalpha() else ri
            results.add(ri)
        return results.pop() if len(results)==1 else list(results)

        
p = Pinyin()

def getInitial(strs):
    return p.get_initials(strs)

def getPinyin(strs):
    return p.get_pinyin_single(strs)

def getJianpin(strs):
    return p.get_jianpin(strs)
        
if __name__ == '__main__':
    print "%X" % ord(u'台')
#    print p.get_pinyin_list(u'台')
#    print p.get_pinyin_single(u'光隆羽绒制品（苏州）有限公司')
#    timestamp =  'pulse in %s' % (getFormattedTime(time.time()))
#    print timestamp    
#    print('pulse in %s' % (datetime.datetime.now))
#    print '$'.isalpha()
#    print getPinyin('#sasdf')
#    print os.path.dirname(__file__)
#    s = '海在'
#    b = bytearray(s)
#    for i in b:
#        print i
##    print bytearray('枯')[1]
#    dt = time.time()
#    p = Pinyin()
#    for i in range(1, 100000):
#        getInitial(u"海在")
#        #输出: 'shanghai'
##        print p.get_initials("要上")
#        #输出 'S'
#    dt = time.time()-dt
#    print dt
