"""
Firecrawl Scrape Job Domain Model
Represents a single URL scraping operation
"""
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum


class JobStatus(Enum):
    """Job execution status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ScrapeFormat(Enum):
    """Supported scrape output formats"""
    MARKDOWN = "markdown"
    HTML = "html"
    JSON = "json"
    SCREENSHOT = "screenshot"
    LINKS = "links"


@dataclass
class ScrapeJob:
    """
    Domain model for scrape job aggregate root
    Represents a single URL scraping operation with its complete lifecycle
    """
    id: str
    url: str
    api_key_id: str
    team_id: Optional[str] = None
    status: JobStatus = JobStatus.PENDING
    formats: List[str] = field(default_factory=lambda: ["markdown"])
    options: Dict[str, Any] = field(default_factory=dict)
    actions: Optional[List[Dict[str, Any]]] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    retry_count: int = 0
    credits_used: int = 1
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime = field(default_factory=datetime.utcnow)

    def start(self) -> None:
        """Mark job as started"""
        self.status = JobStatus.PROCESSING
        self.started_at = datetime.utcnow()

    def complete(self, result: Dict[str, Any]) -> None:
        """Mark job as completed with result"""
        self.status = JobStatus.COMPLETED
        self.result = result
        self.completed_at = datetime.utcnow()

    def fail(self, error: str) -> None:
        """Mark job as failed with error"""
        self.status = JobStatus.FAILED
        self.error = error
        self.completed_at = datetime.utcnow()

    def retry(self) -> bool:
        """
        Retry the job if retry count allows
        Returns True if retry is allowed, False otherwise
        """
        max_retries = self.options.get('max_retries', 3)
        if self.retry_count < max_retries:
            self.retry_count += 1
            self.status = JobStatus.PENDING
            self.error = None
            return True
        return False

    def cancel(self) -> None:
        """Cancel the job"""
        self.status = JobStatus.CANCELLED
        self.completed_at = datetime.utcnow()

    def is_terminal_state(self) -> bool:
        """Check if job is in a terminal state"""
        return self.status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.CANCELLED]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation"""
        return {
            'id': self.id,
            'url': self.url,
            'api_key_id': self.api_key_id,
            'team_id': self.team_id,
            'status': self.status.value,
            'formats': self.formats,
            'options': self.options,
            'actions': self.actions,
            'result': self.result,
            'error': self.error,
            'retry_count': self.retry_count,
            'credits_used': self.credits_used,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
