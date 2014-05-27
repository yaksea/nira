'''
Created on 2013-4-26

@author: Alex
'''
from nira.base.handlers.pageHandler import PageRequestHandler
from nira.base.wrapper import authenticate

class Default(PageRequestHandler):
    @authenticate
    def get(self):
        self.redirect("/project")
#         self.render("home.html")
        
        
if __name__ == '__main__':
    pass