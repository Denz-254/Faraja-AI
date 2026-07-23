"""Initial schema

Revision ID: 001_initial
Revises:
Create Date: 2026-07-23
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("pin_hash", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("family_email", sa.String(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "checkins",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("mood", sa.String(), nullable=False),
        sa.Column("text_notes", sa.String(), nullable=True),
        sa.Column("voice_note_url", sa.String(), nullable=True),
        sa.Column("ai_response", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_checkins_user_id"), "checkins", ["user_id"], unique=False)

    op.create_table(
        "family_members",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("notification_preferences", sa.String(), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_family_members_user_id"), "family_members", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_family_members_user_id"), table_name="family_members")
    op.drop_table("family_members")
    op.drop_index(op.f("ix_checkins_user_id"), table_name="checkins")
    op.drop_table("checkins")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
