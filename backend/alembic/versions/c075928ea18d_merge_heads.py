"""merge heads

Revision ID: c075928ea18d
Revises: 552884b0e73b, a3605cd0422a
Create Date: 2026-09-27 22:42:55.695442

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c075928ea18d'
down_revision: Union[str, Sequence[str], None] = ('552884b0e73b', 'a3605cd0422a')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
