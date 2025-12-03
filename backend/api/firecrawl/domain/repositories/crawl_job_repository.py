"""
Repository interface for Crawl Jobs
Following DDD repository pattern for aggregate persistence
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from ..models.crawl_job import CrawlJob, CrawlStatus


class ICrawlJobRepository(ABC):
    """
    Repository interface for CrawlJob aggregate
    Defines contract for persistence operations
    """

    @abstractmethod
    async def create(self, job: CrawlJob) -> CrawlJob:
        """
        Create a new crawl job
        
        Args:
            job: CrawlJob instance to persist
            
        Returns:
            Persisted CrawlJob with generated ID
        """
        pass

    @abstractmethod
    async def get_by_id(self, job_id: str) -> Optional[CrawlJob]:
        """
        Retrieve crawl job by ID
        
        Args:
            job_id: Unique job identifier
            
        Returns:
            CrawlJob if found, None otherwise
        """
        pass

    @abstractmethod
    async def update(self, job: CrawlJob) -> CrawlJob:
        """
        Update existing crawl job
        
        Args:
            job: CrawlJob instance with updated values
            
        Returns:
            Updated CrawlJob
        """
        pass

    @abstractmethod
    async def delete(self, job_id: str) -> bool:
        """
        Delete crawl job
        
        Args:
            job_id: Unique job identifier
            
        Returns:
            True if deleted, False if not found
        """
        pass

    @abstractmethod
    async def find_by_status(self, status: CrawlStatus, limit: int = 100) -> List[CrawlJob]:
        """
        Find crawl jobs by status
        
        Args:
            status: Job status to filter by
            limit: Maximum number of results
            
        Returns:
            List of matching CrawlJob instances
        """
        pass

    @abstractmethod
    async def find_by_team(self, team_id: str, limit: int = 100, offset: int = 0) -> List[CrawlJob]:
        """
        Find crawl jobs by team ID
        
        Args:
            team_id: Team identifier
            limit: Maximum number of results
            offset: Number of records to skip
            
        Returns:
            List of CrawlJob instances for the team
        """
        pass

    @abstractmethod
    async def count_by_team(self, team_id: str) -> int:
        """
        Count crawl jobs for a team
        
        Args:
            team_id: Team identifier
            
        Returns:
            Number of crawl jobs
        """
        pass

    @abstractmethod
    async def find_expired(self, limit: int = 100) -> List[CrawlJob]:
        """
        Find expired crawl jobs
        
        Args:
            limit: Maximum number of results
            
        Returns:
            List of expired CrawlJob instances
        """
        pass
