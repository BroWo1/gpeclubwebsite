
#import sys,os

#sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings
from powerschool.powerschool.spiders import psl

from gpeclub.models import psl as psl_model
def crawl_account(username, pwd):
    psl_model.objects.all().delete()
    process = CrawlerProcess(get_project_settings())
    psl.USERNAME = username
    psl.PWD = pwd
    process.crawl(psl.PslSpider)
    process.start()

"""
from twisted.internet import reactor
from scrapy.crawler import CrawlerRunner
from scrapy.utils.project import get_project_settings
from powerschool.powerschool.spiders import psl


def crawl_account(username, pwd):
    settings = get_project_settings()
    settings.set('REQUEST_FINGERPRINTER_IMPLEMENTATION', '2.7')

    runner = CrawlerRunner(settings)
    psl.USERNAME = username
    psl.PWD = pwd
    deferred = runner.crawl(psl.PslSpider)
    deferred.addBoth(lambda _: reactor.stop())
    reactor.run()
"""