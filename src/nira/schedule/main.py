#encoding=utf-8
'''
Created on 2012-6-5

@author: Administrator
'''
import datetime
import time
import traceback
import sys
from nira.common.utility import getFormattedTime, getSecondCode, getMinuteCode,\
    getDateCode
from nira.common import log
import thread
from nira.schedule import sendEmails
reload(sys)
sys.setdefaultencoding('utf8') 

class ScheduleTasks():
#    def __init__(self):        
#        self.oapSync = Sync()
    
        
    def executeDaily(self):
        
        dt = time.time()
        log.out('    re-calculate anniversary start at %s'%getFormattedTime(dt))
        try:
          pass
        except:
            traceback.print_exc()                  
#        log.out('    done re-calculate anniversary in %d seconds, count: %d'% (time.time() - dt, total))

        
        
    
    def executeMinutely(self):
        dt = time.time()
        log.out('    oap sync [half full] start at %s'%(getFormattedTime(dt)))
        try:            
            pass
            
        except:
            traceback.print_exc()    
        log.out('    done oap sync [half full] in %d seconds.'% (time.time() - dt))
    

    def executeTenSecondly(self):
        dt = time.time()
        log.out('    oap sync [increment] start at %s'%(getFormattedTime(dt)))
        try:            
            pass
        except:
            traceback.print_exc()    
        log.out('    done oap sync [increment] in %d seconds.'% (time.time() - dt))
        


#同步oap, 10秒
#纪念日计算，24小时
#清除临时文件夹，24小时
#清除GridFS临时文件，24小时

if __name__ == '__main__':    
    sendEmails.run() 
#    thread.start_new_thread(sendEmails.run, ())  
    
    
#    lastDailyTaskCode = None
#    lastMinutelyTaskCode = None
#    lastTenSecondlyTaskCode = None
#    tasks = ScheduleTasks()
#    
#
#    while 1:
#        log.out('    pulse at %s' % (getFormattedTime(time.time())))
#        
#        #ten second task
#        tenSecondlyTaskCode = getSecondCode()[:-1]
#        if lastTenSecondlyTaskCode != tenSecondlyTaskCode:  
#            lastTenSecondlyTaskCode = tenSecondlyTaskCode
#            dt = time.time()
#            log.out('Ten second task [%s] start at %s' % (tenSecondlyTaskCode, getFormattedTime(dt)))
#            tasks.executeTenSecondly()
#                
#            dt = time.time() - dt
#            log.out('Finished Ten second task [%s] in %d seconds' % (tenSecondlyTaskCode, dt))
#            
#        #minutely task
#        minutelyTaskCode = getMinuteCode()
#        if lastMinutelyTaskCode != minutelyTaskCode:  
#            lastMinutelyTaskCode = minutelyTaskCode
#            dt = time.time()
#            log.out('Minutely task [%s] start at %s' % (minutelyTaskCode, getFormattedTime(dt)))
#            tasks.executeMinutely()
#                
#            dt = time.time() - dt
#            log.out('Finished minutely task [%s] in %d seconds' % (minutelyTaskCode, dt))
#
#                    
#        #daily task
#        dailyTaskCode = getDateCode()
#        if lastDailyTaskCode != dailyTaskCode:  
#            lastDailyTaskCode = dailyTaskCode
#            dt = time.time()
#            log.out('Daily task [%s] start at %s' % (dailyTaskCode, getFormattedTime(dt)))
#            tasks.executeDaily()
#            
#
#            dt = time.time() - dt
#            log.out('Finished daily task [%s] in %d seconds' % (dailyTaskCode, dt))
#
#        
#                        
#        time.sleep(5)
#        
        
        
        
        
        
        
