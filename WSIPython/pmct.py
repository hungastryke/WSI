from browsermobproxy import Server
from selenium import webdriver
import time

BROWSERMOB_LOCATION = r"C:\Pointmarc\QAbot\utils\browsermob-proxy-2.1.0-beta-3\bin\browsermob-proxy"
ANSI_STORE = "\x1b[93;41m"
ANSI_PASS = "\x1b[32m"
ANSI_FAIL = "\x1b[31m"
ANSI_WARNING = "\x1b[33m"
ANSI_ERROR = "\x1b[30;41m"
ANSI_CLEAR = "\x1b[0m"
beacon_url = ""


def print_pass(msg):
    print(ANSI_PASS + "Pass: " + msg + ANSI_CLEAR)


def print_fail(msg):
    print(ANSI_FAIL + "FAIL: " + msg + ANSI_CLEAR)


def print_warning(msg):
    print(ANSI_WARNING + "WARNING: " + msg + ANSI_CLEAR)


def print_error(msg):
    print(ANSI_ERROR + "ERROR: " + msg + ANSI_CLEAR)


class Expect:
    def __init__(self, key, queries, case):
        self.key = key
        self.queries = queries
        self.case = case

    def exists(self):
        if self.queries is None:
            return

        if self.key in self.queries:
            self.case.pass_test()
            print_pass("'" + self.key + "' exists: set to '" + self.queries[self.key] + "'")
        else:
            self.case.fail_test()
            print_fail("'" + self.key + "' is not set!")

    def equals(self, val):
        if self.queries is None:
            return

        if self.key in self.queries:
            if self.queries[self.key] == val:
                self.case.pass_test()
                print_pass("'" + self.key + "' is '" + val + "'")
            else:
                self.case.fail_test()
                print_fail("Expected '" + self.key + "' to be '" + val + "', was '" + self.queries[self.key] + "' instead!")
        else:
            self.case.error_test()
            print_error("Key '" + self.key + "' not found!")
            print(self.queries)

    def contains(self, val):
        if self.queries is None:
            return

        if self.key in self.queries:
            if val in self.queries[self.key]:
                self.case.pass_test()
                print_pass("'" + self.key + "' contains '" + val + "'")
            else:
                self.case.fail_test()
                print_fail("Expected '" + self.key + "' to contain '" + val + "', was '" + self.queries[self.key] + "' instead!")
        else:
            self.case.error_test()
            print_error("Key '" + self.key + "' not found!")
            print(self.queries)


class Pmct:
    def __init__(self):
        self.cases = []
        self.queries = None
        self.proxy = None
        self.beacon_url = ""
        self.watch_event = ""
        self.current_case = None

    def get_driver(self, browser, start_beacon_url):
        server = Server(BROWSERMOB_LOCATION)
        server.start()
        self.proxy = server.create_proxy()
        driver = webdriver.Firefox(proxy=self.proxy.selenium_proxy())
        self.proxy.new_har()
        self.beacon_url = start_beacon_url
        return driver

    def new_case(self, case_name):
        print("\n" + case_name)
        self.current_case = Case(case_name)
        self.cases.append(self.current_case)

    def watch_for(self, tag_event):
        print("Watching for '" + tag_event + "'...")
        self.proxy.new_har()
        self.queries = None
        self.watch_event = tag_event

    def expect(self, key):
        if self.queries is None:
            entry_list = self.proxy.har['log']['entries']
            matched_queries = [entry['request']['queryString'] for entry in entry_list if self.beacon_url in entry['request']['url']]

            if len(matched_queries) == 0:
                self.current_case.error_test()
                print_error("No requests found with url fragment '" + self.beacon_url + "'")
                return Expect(key, None)

            query_dicts = {}
            i = 0
            for query in matched_queries:
                query_dicts[i] = {}
                for the_dict in query:
                    query_dicts[i][the_dict['name']] = the_dict['value']
                i += 1

            for i, query in query_dicts.iteritems():
                if 'events' not in query:
                    continue
                events = query['events'].split(',')
                if self.watch_event in events:
                    # if self.queries is not None:
                    #     print_warning("multiple beacons fired with event '" + self.watch_event + "'!")
                    self.queries = query

            if self.queries is None:
                self.current_case.error_test()
                print_error("event '" + self.watch_event + "' not found!")

        return Expect(key, self.queries, self.current_case)

    def report(self):
        print("\nREPORT")
        for case in self.cases:
            msg = "{}: {} / {}".format(case.name, case.passed_tests, case.total_tests)
            if case.errored:
                print_error(msg)
            elif case.failed:
                print_fail(msg)
            else:
                print_pass(msg)


class Case:
    def __init__(self, name):
        self.name = name
        self._passed_tests = 0
        self._failed_tests = 0
        self._errors = 0

    def pass_test(self):
        self._passed_tests += 1

    def fail_test(self):
        self._failed_tests += 1

    def error_test(self):
        self._errors += 1

    @property
    def passed_tests(self):
        return self._passed_tests

    @property
    def total_tests(self):
        return self._passed_tests + self._failed_tests

    @property
    def failed(self):
        return self._failed_tests > 0

    @property
    def errored(self):
        return self._errors > 0
