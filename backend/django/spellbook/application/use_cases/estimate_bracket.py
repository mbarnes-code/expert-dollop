"""
Estimate Bracket use case.

Application service for estimating Commander deck power level brackets.
"""

from dataclasses import dataclass, field
from typing import List, Optional

# Domain imports (handles shared lib path setup)
from ...domain.services import BracketEstimatorService
from ...domain.services.bracket_estimator import BracketBreakdown

from ddd.services import ApplicationService


@dataclass
class EstimateBracketRequest:
    """Request DTO for Estimate Bracket use case."""
    card_names: List[str]
    commander_names: Optional[List[str]] = None


@dataclass
class EstimateBracketResponse:
    """Response DTO for Estimate Bracket use case."""
    bracket: int = 1
    confidence: float = 0.0
    breakdown: Optional[BracketBreakdown] = None
    warnings: List[str] = field(default_factory=list)
    error: Optional[str] = None


class EstimateBracketUseCase(ApplicationService[EstimateBracketRequest, EstimateBracketResponse]):
    """
    Application service for estimating deck power brackets.
    
    Orchestrates bracket estimation using the domain service.
    """
    
    def __init__(self, bracket_estimator: BracketEstimatorService):
        self._bracket_estimator = bracket_estimator
    
    def execute(self, request: EstimateBracketRequest) -> EstimateBracketResponse:
        """
        Execute the bracket estimation use case.
        
        Args:
            request: The request containing deck card names.
            
        Returns:
            Response with bracket estimation.
        """
        try:
            from ...domain.services.bracket_estimator import BracketEstimateRequest
            
            domain_request = BracketEstimateRequest(
                card_names=request.card_names,
                commander_names=request.commander_names
            )
            
            result = self._bracket_estimator.estimate_bracket(domain_request)
            
            return EstimateBracketResponse(
                bracket=result.bracket,
                confidence=result.confidence,
                breakdown=result.breakdown,
                warnings=result.warnings
            )
            
        except Exception as e:
            return EstimateBracketResponse(error=str(e))
