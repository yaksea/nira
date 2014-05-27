'''
Created on 2013-5-27

@author: Alex
'''
from nira.common.queue.queueManager import QueueManager
import smtplib
from email.mime.text import MIMEText
from nira import settings
import time
from nira.common.queue import queueManager
import json
import traceback


def run():
    queueName = queueManager.QueueManager.Keys.SendEmails
    while 1:
        smtpserver = smtplib.SMTP(settings.EMAIL['host'])
        smtpserver.starttls()
        smtpserver.login(settings.EMAIL['user'], settings.EMAIL['password'])
                
        while not queueManager.queue.isEmpty(queueName):
            item = queueManager.queue.pop(queueName)
            msg = MIMEText(item['content'])  
            msg['From'] = settings.EMAIL['user']
            if type(item['to']) == list:
                item['to'] = ';'.join(item['to']) 
            
            msg['To'] = item['to']
            print item['to']
            
            msg['Subject']= item['subject']
            try:
                smtpserver.sendmail(settings.EMAIL['user'], item['to'], msg.as_string())
            except:
                traceback.print_exc()  
#            smtpserver.sendmail('', '', msg.as_string())  
        
        smtpserver.close()
        time.sleep(1)
        
        



if __name__ == '__main__':
    x = json.loads('["df","wer"]')
    print x