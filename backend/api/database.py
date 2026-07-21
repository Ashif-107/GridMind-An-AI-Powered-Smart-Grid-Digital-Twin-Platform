from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

DATABASE_URL = "sqlite:///./gridmind.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class TickHistory(Base):
    __tablename__ = "tick_history"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    time_of_day = Column(Float)
    condition = Column(String)
    total_generation_kw = Column(Float)
    total_consumption_kw = Column(Float)
    net_power_kw = Column(Float)

Base.metadata.create_all(bind=engine)
