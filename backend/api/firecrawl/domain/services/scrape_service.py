"""
Domain Service for Scraping Operations
Encapsulates core scraping business logic
"""
import uuid
from typing import Dict, Any, List, Optional
from ..models.scrape_job import ScrapeJob, JobStatus
from ..repositories.scrape_job_repository import IScrapeJobRepository


class ScrapeService:
    """
    Domain service for scraping operations
    Handles business logic for scrape job lifecycle
    """

    def __init__(self, repository: IScrapeJobRepository):
        """
        Initialize scrape service
        
        Args:
            repository: Scrape job repository instance
        """
        self.repository = repository

    async def create_scrape_job(
        self,
        url: str,
        api_key_id: str,
        team_id: Optional[str] = None,
        formats: List[str] = None,
        options: Dict[str, Any] = None,
        actions: List[Dict[str, Any]] = None
    ) -> ScrapeJob:
        """
        Create a new scrape job
        
        Args:
            url: URL to scrape
            api_key_id: API key identifier
            team_id: Team identifier (optional)
            formats: List of output formats
            options: Scraping options
            actions: Browser actions to perform
            
        Returns:
            Created ScrapeJob instance
        """
        # Generate unique job ID
        job_id = str(uuid.uuid4())

        # Create job instance
        job = ScrapeJob(
            id=job_id,
            url=url,
            api_key_id=api_key_id,
            team_id=team_id,
            formats=formats or ["markdown"],
            options=options or {},
            actions=actions
        )

        # Persist job
        return await self.repository.create(job)

    async def get_job(self, job_id: str) -> Optional[ScrapeJob]:
        """
        Retrieve scrape job by ID
        
        Args:
            job_id: Job identifier
            
        Returns:
            ScrapeJob if found, None otherwise
        """
        return await self.repository.get_by_id(job_id)

    async def start_job(self, job_id: str) -> ScrapeJob:
        """
        Mark job as started
        
        Args:
            job_id: Job identifier
            
        Returns:
            Updated ScrapeJob
            
        Raises:
            ValueError: If job not found or already started
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        if job.status != JobStatus.PENDING:
            raise ValueError(f"Job {job_id} is not in pending state")

        job.start()
        return await self.repository.update(job)

    async def complete_job(self, job_id: str, result: Dict[str, Any]) -> ScrapeJob:
        """
        Mark job as completed with result
        
        Args:
            job_id: Job identifier
            result: Scraping result data
            
        Returns:
            Updated ScrapeJob
            
        Raises:
            ValueError: If job not found
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        job.complete(result)
        return await self.repository.update(job)

    async def fail_job(self, job_id: str, error: str) -> ScrapeJob:
        """
        Mark job as failed
        
        Args:
            job_id: Job identifier
            error: Error message
            
        Returns:
            Updated ScrapeJob
            
        Raises:
            ValueError: If job not found
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        # Try to retry if possible
        if job.retry():
            return await self.repository.update(job)
        else:
            job.fail(error)
            return await self.repository.update(job)

    async def cancel_job(self, job_id: str) -> ScrapeJob:
        """
        Cancel a job
        
        Args:
            job_id: Job identifier
            
        Returns:
            Updated ScrapeJob
            
        Raises:
            ValueError: If job not found or already in terminal state
        """
        job = await self.repository.get_by_id(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        if job.is_terminal_state():
            raise ValueError(f"Job {job_id} is already in terminal state")

        job.cancel()
        return await self.repository.update(job)

    async def get_pending_jobs(self, limit: int = 100) -> List[ScrapeJob]:
        """
        Get pending jobs for processing
        
        Args:
            limit: Maximum number of jobs to retrieve
            
        Returns:
            List of pending ScrapeJob instances
        """
        return await self.repository.find_by_status(JobStatus.PENDING, limit)

    async def get_team_jobs(self, team_id: str, limit: int = 100, offset: int = 0) -> List[ScrapeJob]:
        """
        Get jobs for a specific team
        
        Args:
            team_id: Team identifier
            limit: Maximum number of jobs
            offset: Number of jobs to skip
            
        Returns:
            List of ScrapeJob instances
        """
        return await self.repository.find_by_team(team_id, limit, offset)
