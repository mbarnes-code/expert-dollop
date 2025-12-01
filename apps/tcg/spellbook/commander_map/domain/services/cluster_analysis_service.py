"""
Cluster Analysis Service.

Handles analysis of cluster traits, defining cards, and average decklists.
"""

from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd


class ClusterAnalysisService:
    """
    Domain service for analyzing cluster characteristics.
    
    Provides methods to:
    - Get defining traits per cluster
    - Calculate card counts and synergies
    - Identify defining cards
    - Find representative decklists
    """
    
    def get_cluster_traits(
        self,
        commander_decks: pd.DataFrame,
        topn: int = 20,
        min_perc: int = 1,
        drop_categories: Tuple[str, ...] = (),
        columns: Tuple[str, ...] = (
            'commander-partnerID', 'colorIdentityID', 'themeID', 'tribeID'
        )
    ) -> pd.DataFrame:
        """
        Get the defining traits for each cluster.
        
        Args:
            commander_decks: DataFrame with deck data and clusterID column
            topn: Maximum traits to show per category
            min_perc: Minimum percentage threshold
            drop_categories: Categories to exclude
            columns: Categories to analyze
            
        Returns:
            DataFrame with columns [clusterID, category, value, percent]
        """
        if 'clusterID' not in commander_decks.columns:
            raise ValueError('Must have clusterID column in commander_decks')
        
        func_df = commander_decks.copy()
        columns = [col for col in columns if col not in drop_categories]
        
        missing_cols = set(columns) - set(func_df.columns)
        if missing_cols:
            raise ValueError(f'Missing columns: {missing_cols}')
        
        num_clusters = len(set(func_df['clusterID']))
        output_df = []
        
        for col in columns:
            groups = func_df.groupby(['clusterID', col]).size().to_frame('percent').reset_index()
            
            if num_clusters == 1:
                groups['percent'] = (
                    groups['percent'] / groups['percent'].sum() * 100
                ).round(0).astype(int)
            else:
                groups['percent'] = groups.groupby(['clusterID']).apply(
                    lambda x: (x['percent'] / x['percent'].sum() * 100)
                ).round(0).astype(int).values
            
            groups = groups.sort_values(by=['clusterID', 'percent'], ascending=[True, False])
            groups = groups[groups['percent'] >= min_perc]
            groups = groups.groupby('clusterID').head(topn).reset_index(drop=True)
            groups = groups.rename(columns={col: 'value'})
            groups['category'] = col
            
            output_df.append(groups[['clusterID', 'category', 'value', 'percent']])
        
        return pd.concat(output_df).reset_index(drop=True)
    
    def get_cluster_card_counts(
        self,
        commander_decks: pd.DataFrame,
        decklist_matrix: Any,
        card_idx_lookup: Dict[str, int],
        date_matrix: np.ndarray,
        ci_matrix: np.ndarray,
        deck_date_idx_lookup: Dict[int, int],
        card_date_idx_lookup: Dict[str, int],
        deck_ci_idx_lookup: Dict[int, int],
        card_ci_idx_lookup: Dict[str, int],
        color_rule: str = 'ignore',
        include_commanders: bool = False,
        chunksize: int = 1000,
        precomputed_noncard: Dict = None,
        verbose: bool = False
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Calculate card counts per cluster with date/CI filtering.
        
        Args:
            commander_decks: DataFrame with deck data
            decklist_matrix: Sparse matrix of decklists
            card_idx_lookup: Card name to column index
            date_matrix: Matrix for date-based filtering
            ci_matrix: Matrix for color identity filtering
            deck_date_idx_lookup: Deck ID to date matrix row
            card_date_idx_lookup: Card name to date matrix column
            deck_ci_idx_lookup: Deck ID to CI matrix row
            card_ci_idx_lookup: Card name to CI matrix column
            color_rule: 'ignore' to skip CI checks
            include_commanders: Include commanders in counts
            chunksize: Chunk size for memory efficiency
            precomputed_noncard: Precomputed data for optimization
            verbose: Print progress
            
        Returns:
            Tuple of (cluster_card_df, cluster_noncard_df)
        """
        precomputed_noncard = precomputed_noncard or {}
        
        # Build card count matrix
        max_cluster = commander_decks['clusterID'].max() + 1
        n_cards = len(card_idx_lookup)
        cluster_card_df = np.zeros(shape=(max_cluster, n_cards))
        
        if verbose:
            print('Building cluster counts...', end='')
        
        clusters = sorted(list(set(commander_decks['clusterID'])))
        breaks = len(clusters) // 20 if len(clusters) >= 20 else 1
        
        for clust in clusters:
            if verbose and (clust % breaks == 0 or clust == -1):
                print(clust, end=', ')
            
            cluster_plot_df = commander_decks[commander_decks['clusterID'] == clust]
            cluster_card_counts = decklist_matrix[cluster_plot_df.index, :].sum(axis=0)
            cluster_card_df[clust, :] = cluster_card_counts
            
            # Remove commanders if needed
            if include_commanders:
                commander_partners = cluster_plot_df['commanderID'].value_counts()
                commander_partners = commander_partners.add(
                    cluster_plot_df['partnerID'].value_counts(), fill_value=0
                )
                commander_partners = commander_partners.add(
                    cluster_plot_df['companionID'].value_counts(), fill_value=0
                )
                commander_partners = commander_partners.drop(index=[''], errors='ignore')
                
                commander_partner_indices = [
                    card_idx_lookup[name] for name in commander_partners.index
                ]
                cluster_card_df[clust, commander_partner_indices] -= commander_partners.values
        
        cluster_card_df = pd.DataFrame(
            cluster_card_df, 
            index=clusters,
            columns=list(card_idx_lookup.keys())
        )
        
        if verbose:
            print('done')
        
        # Build noncard matrix (decks that COULD play each card)
        cluster_noncard_df = np.zeros(shape=(max_cluster, n_cards))
        
        if verbose:
            print('\tCalculating potential card counts...', end='')
        
        card_dates = np.array([
            card_date_idx_lookup[name] for name in card_idx_lookup.keys()
        ]).reshape(1, -1)
        card_cis = np.array([
            card_ci_idx_lookup[name] for name in card_idx_lookup.keys()
        ]).reshape(1, -1)
        
        for clust in clusters:
            if verbose and (clust % breaks == 0 or clust == -1):
                print(clust, end=', ')
            
            if clust in precomputed_noncard:
                cluster_noncard_df[clust, :] = precomputed_noncard[clust].values
                continue
            
            cluster_plot_df = commander_decks[commander_decks['clusterID'] == clust]
            
            deck_dates = np.array([
                deck_date_idx_lookup[deck_id] for deck_id in cluster_plot_df['deckID']
            ]).reshape(-1, 1)
            
            deck_date_chunks = np.array_split(
                deck_dates, deck_dates.shape[0] // chunksize + 1
            )
            
            if color_rule != 'ignore':
                deck_cis = np.array([
                    deck_ci_idx_lookup[deck_id] for deck_id in cluster_plot_df['deckID']
                ]).reshape(-1, 1)
                deck_ci_chunks = np.array_split(
                    deck_cis, deck_cis.shape[0] // chunksize + 1
                )
            
            total_can_play = np.zeros(shape=(n_cards,))
            
            for i, date_chunk in enumerate(deck_date_chunks):
                date_chunk_play = date_matrix[date_chunk, card_dates]
                
                if color_rule != 'ignore':
                    ci_chunk = deck_ci_chunks[i]
                    ci_chunk_play = ci_matrix[ci_chunk, card_cis]
                else:
                    ci_chunk_play = np.ones(shape=date_chunk_play.shape)
                
                total_can_play += np.logical_and(date_chunk_play, ci_chunk_play).sum(axis=0)
            
            cluster_noncard_df[clust, :] = total_can_play
        
        # Calculate non-playing decks
        cluster_noncard_df = (cluster_noncard_df - cluster_card_df).clip(lower=0)
        
        if verbose:
            print('done')
        
        return cluster_card_df, cluster_noncard_df
    
    def get_defining_cards(
        self,
        commander_decks: pd.DataFrame,
        cluster_card_df: pd.DataFrame,
        cluster_noncard_df: pd.DataFrame,
        include_synergy: bool = True,
        n_scope: int = 200,
        verbose: bool = False
    ) -> pd.DataFrame:
        """
        Extract cards that define each cluster.
        
        Args:
            commander_decks: DataFrame with deck data
            cluster_card_df: Card counts per cluster
            cluster_noncard_df: Non-card counts per cluster
            include_synergy: Calculate synergy scores
            n_scope: Number of top cards to analyze
            verbose: Print progress
            
        Returns:
            DataFrame with [clusterID, card, play_rate, synergy]
        """
        # Single cluster case
        if len(set(commander_decks['clusterID'])) == 1:
            include_synergy = False
        
        if verbose:
            print('\tCalculating card synergies...', end='')
        
        # Calculate play rates
        play_rate_df = (
            cluster_card_df / (cluster_card_df + cluster_noncard_df)
        ).fillna(0)
        
        if include_synergy:
            play_other_cluster = cluster_card_df.sum(axis=0) - cluster_card_df
            nonplay_other_cluster = cluster_noncard_df.sum(axis=0) - cluster_noncard_df
            other_play_rate = (
                play_other_cluster / (nonplay_other_cluster + play_other_cluster)
            ).fillna(0)
            synergies = play_rate_df - other_play_rate
        
        clusters = sorted(list(set(commander_decks['clusterID'])))
        combined_output = []
        
        for clust in clusters:
            if verbose and clust % 100 == 0:
                print(clust, end=', ')
            
            cluster_play_rates = play_rate_df.loc[clust]
            topn_cards = cluster_play_rates.sort_values(ascending=False).head(n_scope).index
            
            output = pd.DataFrame()
            output['card'] = topn_cards
            output.insert(0, 'clusterID', clust)
            output['play_rate'] = cluster_play_rates.loc[topn_cards].round(2).values
            
            if include_synergy:
                output['synergy'] = synergies.loc[clust, topn_cards].round(2).values
                output = output.sort_values(by='synergy', ascending=False)
            else:
                output = output.sort_values(by='play_rate', ascending=False)
            
            combined_output.append(output)
        
        if verbose:
            print('done')
        
        return pd.concat(combined_output)
    
    def calculate_average_decklists(
        self,
        commander_decks: pd.DataFrame,
        decklist_matrix: Any,
        card_idx_lookup: Dict[str, int],
        cluster_defining_cards: pd.DataFrame,
        ignore_clusters: Tuple[int, ...] = (),
        verbose: bool = False
    ) -> Dict[int, int]:
        """
        Calculate representative decklist for each cluster.
        
        Args:
            commander_decks: DataFrame with deck data
            decklist_matrix: Sparse decklist matrix
            card_idx_lookup: Card to index mapping
            cluster_defining_cards: Defining cards per cluster
            ignore_clusters: Clusters to skip
            verbose: Print progress
            
        Returns:
            Dict mapping cluster_id to deck_id
        """
        if verbose:
            print('Calculating average decklists...', end='')
        
        idx_to_card = {v: k for k, v in card_idx_lookup.items()}
        clusters = sorted(list(set(commander_decks['clusterID'])))
        average_decklists = {}
        
        for clust in clusters:
            if clust in ignore_clusters:
                continue
            
            if verbose and clust % 100 == 0:
                print(clust, end=', ')
            
            clust_data = commander_decks[commander_decks['clusterID'] == clust]
            clust_cards = cluster_defining_cards[
                cluster_defining_cards['clusterID'] == clust
            ]
            clust_decklists = decklist_matrix[clust_data.index]
            
            # Get value lookup (synergy or play_rate)
            if 'synergy' in clust_cards.columns:
                val_lookup = dict(zip(clust_cards['card'], clust_cards['synergy']))
            else:
                val_lookup = dict(zip(clust_cards['card'], clust_cards['play_rate']))
            
            # Score each decklist
            scores, list_sizes = [], []
            for decklist in clust_decklists.tolil().rows:
                cardnames = [idx_to_card[idx] for idx in decklist]
                avg_score = np.mean([val_lookup.get(c, 0) for c in cardnames])
                scores.append(avg_score)
                list_sizes.append(len(cardnames))
            
            # Find best scoring deck within normal size range
            score_df = pd.DataFrame([scores, list_sizes], index=['score', 'size']).T
            percentiles = np.percentile(score_df['size'], [20, 80])
            score_df_filtered = score_df[score_df['size'].between(*percentiles)]
            
            if len(score_df_filtered) == 0:
                score_df_filtered = score_df.copy()
            
            max_synergy_idx = score_df_filtered['score'].idxmax()
            deck_id = clust_data.iloc[max_synergy_idx]['deckID']
            average_decklists[clust] = deck_id
        
        if verbose:
            print('done')
        
        return average_decklists
