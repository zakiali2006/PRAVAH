"""Add application risk scores table

Revision ID: 2a3b4c5d6e7f
Revises: 19f2fb7427ca
Create Date: 2026-09-25 22:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "2a3b4c5d6e7f"
down_revision: Union[str, Sequence[str], None] = "19f2fb7427ca"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "application_risk_scores",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("application_id", sa.String(), nullable=False),
        sa.Column("score", sa.Float(), nullable=False, server_default="0.0"),
        sa.Column(
            "risk_level", sa.String(length=50), nullable=False, server_default="LOW"
        ),
        sa.Column(
            "triage_category",
            sa.String(length=50),
            nullable=False,
            server_default="STANDARD_REVIEW",
        ),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("factors", sa.JSON(), nullable=True),
        sa.Column(
            "calculated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["application_id"], ["applications.id"], ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_application_risk_scores_id"),
        "application_risk_scores",
        ["id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_application_risk_scores_application_id"),
        "application_risk_scores",
        ["application_id"],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_application_risk_scores_application_id"),
        table_name="application_risk_scores",
    )
    op.drop_index(
        op.f("ix_application_risk_scores_id"), table_name="application_risk_scores"
    )
    op.drop_table("application_risk_scores")
