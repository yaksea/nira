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
from nira.form import webFields
from nira.common.cache.sessionManager import Session
from nira.common.cache.sysCacheManager import SysCache
import smtplib
#import email
from email.mime.text import MIMEText


class EmailRequestHandler(FormRequestHandler):
    def sendEmail(self, to, subject, content):
        smtpserver = smtplib.SMTP(settings.EMAIL['host'])
        smtpserver.starttls()
        smtpserver.login(settings.EMAIL['user'], settings.EMAIL['password'])
        msg = MIMEText(content)  
        msg['From'] = settings.EMAIL['user']
        if type(to) == list:
            to = ';'.join(to) 
        
        msg['To'] = to
        
        msg['Subject']=subject
        smtpserver.sendmail('xx@dsf.com',to,msg.as_string())  
#        smtpserver.sendmail(settings.EMAIL['user'],to,msg.as_string())  
        
        smtpserver.close()        
        