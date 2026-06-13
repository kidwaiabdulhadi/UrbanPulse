"""Initial tables

Revision ID: d79685f8840d
Revises: 
Create Date: 2026-06-11 23:03:10.252424

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd79685f8840d'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create stations
    op.create_table(
        'stations',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('line_color', sa.String(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_stations_name'), 'stations', ['name'], unique=False)

    # Create users
    op.create_table(
        'users',
        sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('hashed_password', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Create crowd_telemetry
    op.create_table(
        'crowd_telemetry',
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('station_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entry_count', sa.Integer(), nullable=False),
        sa.Column('exit_count', sa.Integer(), nullable=False),
        sa.Column('current_occupancy', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['station_id'], ['stations.id'], ),
        sa.PrimaryKeyConstraint('timestamp', 'station_id')
    )

    # Create TimescaleDB hypertable
    # Only runs if TimescaleDB extension is enabled
    try:
        op.execute("SELECT create_hypertable('crowd_telemetry', 'timestamp');")
    except Exception as e:
        print(f"Hypertable creation failed (is TimescaleDB installed?): {e}")


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('crowd_telemetry')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
    op.drop_index(op.f('ix_stations_name'), table_name='stations')
    op.drop_table('stations')
