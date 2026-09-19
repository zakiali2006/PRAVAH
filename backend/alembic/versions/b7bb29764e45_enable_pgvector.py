"""enable pgvector

Revision ID: b7bb29764e45
Revises: 003c1e99ce20
Create Date: 2026-09-19 15:17:17.965756

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7bb29764e45'
down_revision: Union[str, Sequence[str], None] = '003c1e99ce20'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP EXTENSION IF EXISTS vector;")
