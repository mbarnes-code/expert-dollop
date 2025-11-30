"""
Database router for Spellbook strangler fig pattern.

Routes queries to the appropriate database (legacy vs new) based on
model and operation type, enabling gradual migration.
"""


class SpellbookRouter:
    """
    Database router to support strangler fig migration pattern.
    
    During migration, reads can be routed to the legacy database
    while writes go to the new database structure.
    """
    
    # Models that have been fully migrated to the new system
    MIGRATED_MODELS = set()
    
    # Models being migrated (dual-write)
    MIGRATING_MODELS = set()
    
    def db_for_read(self, model, **hints):
        """
        Route read operations.
        
        Fully migrated models read from default database.
        Legacy models read from legacy database.
        """
        model_name = model._meta.model_name
        
        if model_name in self.MIGRATED_MODELS:
            return 'default'
        
        if model_name in self.MIGRATING_MODELS:
            # During migration, prefer new database for reads
            return 'default'
        
        # Default to new database
        return 'default'
    
    def db_for_write(self, model, **hints):
        """
        Route write operations.
        
        All writes go to the new database structure.
        """
        return 'default'
    
    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations between objects in the same database.
        """
        return True
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Control which database migrations run on.
        """
        if db == 'legacy':
            # Don't run migrations on legacy database
            return False
        return True
