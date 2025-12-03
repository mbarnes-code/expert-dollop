"""
Repository interface for Scrape Jobs
Following DDD repository pattern for aggregate persistence
"""
from abc import ABC, abstractmethod
from typing import Optional, List
from ..models.scrape_job import ScrapeJob, JobStatus


class IScrapeJobRepository(ABC):
    """
    Repository interface for ScrapeJob aggregate
    Defines contract for persistence operations
    """

    @abstractmethod
    async def create(self, job: ScrapeJob) -> ScrapeJob:
        """
        Create a new scrape job
        
        Args:
            job: ScrapeJob instance to persist
            
        Returns:
            Persisted ScrapeJob with generated ID
        """
        pass

    @abstractmethod
    async def get_by_id(self, job_id: str) -> Optional[ScrapeJob]:
        """
        Retrieve scrape job by ID
        
        Args:
            job_id: Unique job identifier
            
        Returns:
            ScrapeJob if found, None otherwise
        """
        pass

    @abstractmethod
    async def update(self, job: ScrapeJob) -> ScrapeJob:
        """
        Update existing scrape job
        
        Args:
            job: ScrapeJob instance with updated values
            
        Returns:
            Updated ScrapeJob
        """
        pass

    @abstractmethod
    async def delete(self, job_id: str) -> bool:
        """
        Delete scrape job
        
        Args:
            job_id: Unique job identifier
            
        Returns:
            True if deleted, False if not found
        """
        pass

    @abstractmethod
    async def find_by_status(self, status: JobStatus, limit: int = 100) -> List[ScrapeJob]:
        """
        Find scrape jobs by status
        
        Args:
            status: Job status to filter by
            limit: Maximum number of results
            
        Returns:
            List of matching ScrapeJob instances
        """
        pass

    @abstractmethod
    async def find_by_team(self, team_id: str, limit: int = 100, offset: int = 0) -> List[ScrapeJob]:
        """
        Find scrape jobs by team ID
        
        Args:
            team_id: Team identifier
            limit: Maximum number of results
            offset: Number of records to skip
            
        Returns:
            List of ScrapeJob instances for the team
        """
        pass

    @abstractmethod
    async def count_by_team(self, team_id: str) -> int:
        """
        Count scrape jobs for a team
        
        Args:
            team_id: Team identifier
            
        Returns:
            Number of scrape jobs
        """
        pass
