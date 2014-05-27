'''
Created on 2012-9-17

@author: Administrator
'''
import tornado
import re
from tornado.util import import_object
import logging

class URLSpec(tornado.web.URLSpec):
    """Specifies mappings between URLs and handlers."""
    def __init__(self, pattern, handler_class, kwargs={}, name=None):
        """Creates a URLSpec.

        Parameters:

        pattern: Regular expression to be matched.  Any groups in the regex
            will be passed in to the handler's get/post/etc methods as
            arguments.

        handler_class: RequestHandler subclass to be invoked.

        kwargs (optional): A dictionary of additional arguments to be passed
            to the handler's constructor.

        name (optional): A name for this handler.  Used by
            Application.reverse_url.
        """
        if not pattern.endswith('$'):
            pattern += '$'
        self.regex = re.compile(pattern, re.IGNORECASE)
        assert len(self.regex.groupindex) in (0, self.regex.groups), \
            ("groups in url regexes must either be all named or all "
             "positional: %r" % self.regex.pattern)
        self.handler_class = handler_class
        self.kwargs = kwargs
        self.name = name
        self._path, self._group_count = self._find_groups()
        
class Application(tornado.web.Application):
    def add_handlers(self, host_pattern, host_handlers):
        """Appends the given handlers to our handler list.

        Note that host patterns are processed sequentially in the
        order they were added, and only the first matching pattern is
        used.  This means that all handlers for a given host must be
        added in a single add_handlers call.
        """
        if not host_pattern.endswith("$"):
            host_pattern += "$"
        handlers = []
        # The handlers with the wildcard host_pattern are a special
        # case - they're added in the constructor but should have lower
        # precedence than the more-precise handlers added later.
        # If a wildcard handler group exists, it should always be last
        # in the list, so insert new groups just before it.
        if self.handlers and self.handlers[-1][0].pattern == '.*$':
            self.handlers.insert(-1, (re.compile(host_pattern, re.IGNORECASE), handlers))
        else:
            self.handlers.append((re.compile(host_pattern, re.IGNORECASE), handlers))

        for spec in host_handlers:
            if type(spec) is type(()):
                assert len(spec) in (2, 3)
                pattern = spec[0]
                handler = spec[1]

                if isinstance(handler, str):
                    # import the Module and instantiate the class
                    # Must be a fully qualified name (module.ClassName)
                    handler = import_object(handler)

                if len(spec) == 3:
                    kwargs = spec[2]
                else:
                    kwargs = {}
                spec = URLSpec(pattern, handler, kwargs)
            handlers.append(spec)
            if spec.name:
                if spec.name in self.named_handlers:
                    logging.warning(
                        "Multiple handlers named %s; replacing previous value",
                        spec.name)
                self.named_handlers[spec.name] = spec