"""
Firecrawl Backend API Module
DDD-based modular monolith for web scraping and crawling
"""

__version__ = "1.0.0"

from .domain.models.scrape_job import ScrapeJob, JobStatus, ScrapeFormat
from .domain.models.crawl_job import CrawlJob, CrawlStatus
from .domain.services.scrape_service import ScrapeService

__all__ = [
    "ScrapeJob",
    "JobStatus",
    "ScrapeFormat",
    "CrawlJob",
    "CrawlStatus",
    "ScrapeService",
]
