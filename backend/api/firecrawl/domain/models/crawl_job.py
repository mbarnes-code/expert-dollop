"""
Firecrawl Crawl Job Domain Model
Represents a multi-page crawling operation
"""
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from enum import Enum


class CrawlStatus(Enum):
    """Crawl job execution status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class CrawlJob:
    """
    Domain model for crawl job aggregate root
    Represents a multi-page crawling operation with its complete lifecycle
    """
    id: str
    url: str
    api_key_id: str
    team_id: Optional[str] = None
    status: CrawlStatus = CrawlStatus.PENDING
    limit_pages: int = 100
    max_depth: int = 3
    scrape_options: Dict[str, Any] = field(default_factory=dict)
    crawl_options: Dict[str, Any] = field(default_factory=dict)
    discovered_urls: int = 0
    completed_urls: int = 0
    failed_urls: int = 0
    total_credits_used: int = 0
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    def __post_init__(self):
        """Set expiration time on creation"""
        if self.expires_at is None:
            # Default expiration: 7 days from creation
            expiry_days = self.crawl_options.get('expiry_days', 7)
            self.expires_at = self.created_at + timedelta(days=expiry_days)

    def start(self) -> None:
        """Mark crawl job as started"""
        self.status = CrawlStatus.PROCESSING
        self.started_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def add_discovered_url(self) -> None:
        """Increment discovered URLs counter"""
        self.discovered_urls += 1
        self.updated_at = datetime.utcnow()

    def mark_url_completed(self, credits: int = 1) -> None:
        """Mark a URL as completed and update credits"""
        self.completed_urls += 1
        self.total_credits_used += credits
        self.updated_at = datetime.utcnow()

    def mark_url_failed(self) -> None:
        """Mark a URL as failed"""
        self.failed_urls += 1
        self.updated_at = datetime.utcnow()

    def is_complete(self) -> bool:
        """Check if all discovered URLs have been processed"""
        return (self.completed_urls + self.failed_urls) >= self.discovered_urls

    def has_reached_limit(self) -> bool:
        """Check if page limit has been reached"""
        return self.discovered_urls >= self.limit_pages

    def complete(self) -> None:
        """Mark crawl job as completed"""
        self.status = CrawlStatus.COMPLETED
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def fail(self, error: str = None) -> None:
        """Mark crawl job as failed"""
        self.status = CrawlStatus.FAILED
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def cancel(self) -> None:
        """Cancel the crawl job"""
        self.status = CrawlStatus.CANCELLED
        self.completed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def is_terminal_state(self) -> bool:
        """Check if crawl job is in a terminal state"""
        return self.status in [CrawlStatus.COMPLETED, CrawlStatus.FAILED, CrawlStatus.CANCELLED]

    def is_expired(self) -> bool:
        """Check if the crawl results have expired"""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at

    def get_progress(self) -> float:
        """Get crawl progress as percentage"""
        if self.discovered_urls == 0:
            return 0.0
        processed = self.completed_urls + self.failed_urls
        return (processed / self.discovered_urls) * 100

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'url': self.url,
            'api_key_id': self.api_key_id,
            'team_id': self.team_id,
            'status': self.status.value,
            'limit_pages': self.limit_pages,
            'max_depth': self.max_depth,
            'scrape_options': self.scrape_options,
            'crawl_options': self.crawl_options,
            'discovered_urls': self.discovered_urls,
            'completed_urls': self.completed_urls,
            'failed_urls': self.failed_urls,
            'total_credits_used': self.total_credits_used,
            'progress': self.get_progress(),
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
