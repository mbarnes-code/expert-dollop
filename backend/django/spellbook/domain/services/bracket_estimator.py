"""
Bracket estimator domain service.

Provides domain logic for estimating deck power level brackets.
"""

import sys
from abc import abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Optional

# Add shared libs to path for imports
libs_path = Path(__file__).resolve().parents[6] / 'libs' / 'shared' / 'python'
if str(libs_path) not in sys.path:
    sys.path.insert(0, str(libs_path))

from ddd.services import DomainService


@dataclass
class BracketEstimateRequest:
    """Request for bracket estimation."""
    card_names: List[str]
    commander_names: Optional[List[str]] = None


@dataclass
class BracketBreakdown:
    """Breakdown of bracket contribution factors."""
    mass_land_denial_count: int = 0
    extra_turn_count: int = 0
    tutor_count: int = 0
    fast_mana_count: int = 0
    combo_count: int = 0


@dataclass
class BracketEstimateResult:
    """Result of bracket estimation."""
    bracket: int
    confidence: float
    breakdown: BracketBreakdown = field(default_factory=BracketBreakdown)
    warnings: List[str] = field(default_factory=list)


class BracketEstimatorService(DomainService):
    """
    Domain service for estimating Commander deck power brackets.
    
    This service analyzes a deck's card composition to estimate
    its power level bracket (1-4) based on various factors like
    combo presence, tutors, fast mana, etc.
    """
    
    @abstractmethod
    def estimate_bracket(self, request: BracketEstimateRequest) -> BracketEstimateResult:
        """
        Estimate the power bracket for a deck.
        
        Args:
            request: The estimation request with deck cards.
            
        Returns:
            Bracket estimation result with confidence score.
        """
        pass
    
    @abstractmethod
    def get_bracket_factors(self, card_names: List[str]) -> BracketBreakdown:
        """
        Get the individual factors contributing to bracket estimation.
        
        Args:
            card_names: List of card names in the deck.
            
        Returns:
            Breakdown of contributing factors.
        """
        pass
    
    def execute(self, *args, **kwargs):
        """Execute the bracket estimator service."""
        if 'request' in kwargs:
            return self.estimate_bracket(kwargs['request'])
        return None
