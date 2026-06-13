import pandas as pd
import numpy as np
import uuid
import os
import matplotlib.pyplot as plt
import seaborn as sns
from sqlalchemy import create_engine, text
from datetime import datetime, timedelta

# Configurations
START_DATE = "2025-01-01"
END_DATE = "2025-12-31 23:55:00"
FREQ = "5min"

STATIONS = [
    {"name": "Union Station", "id": str(uuid.uuid4()), "type": "commuter_hub", "base_vol": 500},
    {"name": "Stadium Station", "id": str(uuid.uuid4()), "type": "event_hub", "base_vol": 200},
    {"name": "Residential Station", "id": str(uuid.uuid4()), "type": "residential", "base_vol": 150},
]

def generate_diurnal_curve(times, station_type, base_vol):
    hours = times.hour + times.minute / 60.0
    day_of_week = times.dayofweek
    
    # Base sinusoidal wave
    vol = np.zeros(len(times))
    
    # AM Peak (7-9) and PM Peak (17-19)
    am_peak = np.exp(-0.5 * ((hours - 8.0) / 1.0)**2)
    pm_peak = np.exp(-0.5 * ((hours - 18.0) / 1.5)**2)
    
    for i, t in enumerate(times):
        is_weekend = day_of_week[i] >= 5
        multiplier = 0.4 if is_weekend else 1.0
        
        if is_weekend:
            # Weekend peak is around noon
            weekend_peak = np.exp(-0.5 * ((hours[i] - 13.0) / 3.0)**2)
            vol[i] = base_vol * multiplier * (0.2 + 0.8 * weekend_peak)
        else:
            if station_type == "residential":
                # High AM exit to city, High PM enter to residential
                vol[i] = base_vol * (0.2 + 1.2 * am_peak[i] + 0.8 * pm_peak[i])
            elif station_type == "commuter_hub":
                vol[i] = base_vol * (0.2 + 0.8 * am_peak[i] + 1.5 * pm_peak[i])
            else:
                vol[i] = base_vol * (0.2 + 0.6 * am_peak[i] + 0.7 * pm_peak[i])
                
    return vol

def add_events(df, station_type):
    # Add random event spikes for Stadium
    if station_type == "event_hub":
        # Let's say there are 20 events in a year, usually between 19:00 and 22:00
        np.random.seed(42)
        event_days = np.random.choice(df.index.date, size=20, replace=False)
        for d in event_days:
            # Event ends at 21:00, massive spike
            mask = (df.index.date == d) & (df.index.hour == 21) & (df.index.minute <= 30)
            df.loc[mask, 'volume'] += np.random.randint(1000, 3000, size=mask.sum())
    return df

def apply_weather_holidays(df):
    np.random.seed(10)
    # 5% chance of bad weather per day -> drops volume by 20%
    dates = np.unique(df.index.date)
    bad_weather_dates = np.random.choice(dates, size=int(len(dates)*0.05), replace=False)
    for d in bad_weather_dates:
        mask = df.index.date == d
        df.loc[mask, 'volume'] *= 0.8
        
    # Holidays: 10 public holidays, behaves like a weekend
    holidays = np.random.choice(dates, size=10, replace=False)
    for h in holidays:
        mask = df.index.date == h
        # dampen everything
        df.loc[mask, 'volume'] *= 0.5
    return df

def apply_delays(df):
    # simulate train delays: 0 volume for 15 mins, then massive spike
    np.random.seed(99)
    delay_indices = np.random.choice(len(df)-5, size=50, replace=False)
    for idx in delay_indices:
        # Build up
        accumulated = df.iloc[idx:idx+3]['volume'].sum()
        df.iloc[idx:idx+3, df.columns.get_loc('volume')] = 0
        df.iloc[idx+4, df.columns.get_loc('volume')] += accumulated * 1.5 # sudden rush
    return df

def generate_station_data(station, times):
    vol = generate_diurnal_curve(times, station["type"], station["base_vol"])
    df = pd.DataFrame({"timestamp": times, "volume": vol}).set_index("timestamp")
    
    df = add_events(df, station["type"])
    df = apply_weather_holidays(df)
    df = apply_delays(df)
    
    # Add random anomaly/noise
    noise = np.random.normal(0, station["base_vol"] * 0.1, len(df))
    df['volume'] += noise
    
    df['volume'] = np.maximum(0, df['volume']).astype(int) # No negative volume
    
    df['station_id'] = station['id']
    
    # Split into entry, exit, occupancy
    df['entry_count'] = (df['volume'] * np.random.uniform(0.4, 0.6, len(df))).astype(int)
    df['exit_count'] = df['volume'] - df['entry_count']
    
    # Mock occupancy (rolling sum of net)
    net_flow = df['entry_count'] - df['exit_count']
    # Add a base decay so occupancy doesn't grow infinitely
    occupancy = []
    curr = 0
    for flow in net_flow:
        curr = max(0, curr + flow)
        # 10% leave platform
        curr = int(curr * 0.9)
        occupancy.append(curr)
    df['current_occupancy'] = occupancy
    
    return df.reset_index()

def plot_validations(df, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # Plot 1: Normal Week vs Weekend
    sample_week = df[(df['timestamp'] >= '2025-02-03') & (df['timestamp'] < '2025-02-10')]
    plt.figure(figsize=(15, 5))
    sns.lineplot(data=sample_week, x='timestamp', y='volume', hue='station_id')
    plt.title("One Week of Telemetry (Showing Weekdays vs Weekend)")
    plt.savefig(f"{output_dir}/validation_week.png")
    
    # Plot 2: Event Spike
    plt.figure(figsize=(15, 5))
    stadium = STATIONS[1]['id']
    stadium_data = df[df['station_id'] == stadium]
    # Find max volume day
    max_day = stadium_data.loc[stadium_data['volume'].idxmax(), 'timestamp'].date()
    event_day_data = stadium_data[stadium_data['timestamp'].dt.date == max_day]
    sns.lineplot(data=event_day_data, x='timestamp', y='volume')
    plt.title(f"Event Spike at Stadium Station on {max_day}")
    plt.savefig(f"{output_dir}/validation_event.png")

def main():
    print("Generating synthetic data for UrbanPulse AI...")
    times = pd.date_range(start=START_DATE, end=END_DATE, freq=FREQ)
    
    dfs = []
    for s in STATIONS:
        print(f"Generating for {s['name']}...")
        station_df = generate_station_data(s, times)
        dfs.append(station_df)
        
    final_df = pd.concat(dfs, ignore_index=True)
    
    # Save CSV
    out_dir = "data"
    os.makedirs(out_dir, exist_ok=True)
    csv_path = f"{out_dir}/synthetic_telemetry.csv"
    final_df.to_csv(csv_path, index=False)
    print(f"Saved {len(final_df)} rows to {csv_path}")
    
    # Visualizations
    plot_validations(final_df, "visualizations")
    print("Visualizations saved to visualizations/")
    
    # DB Export
    db_url = os.environ.get("DATABASE_URL", "postgresql://urbanpulse_admin:secure_password@localhost:5432/urbanpulse")
    try:
        engine = create_engine(db_url)
        print("Exporting stations to PostgreSQL...")
        stations_df = pd.DataFrame(STATIONS).rename(columns={"base_vol": "capacity"})
        stations_df['latitude'] = np.random.uniform(25.0, 25.3, len(STATIONS))
        stations_df['longitude'] = np.random.uniform(55.1, 55.4, len(STATIONS))
        stations_df['line_color'] = ["Red", "Green", "Blue"]
        
        with engine.connect() as con:
            con.execute(text("TRUNCATE TABLE crowd_telemetry CASCADE;"))
            con.execute(text("TRUNCATE TABLE stations CASCADE;"))
            con.commit()
            
        stations_df[['id', 'name', 'line_color', 'latitude', 'longitude', 'capacity']].to_sql("stations", engine, if_exists="append", index=False)
        
        print("Exporting telemetry to PostgreSQL (this may take a minute)...")
        export_df = final_df[['timestamp', 'station_id', 'entry_count', 'exit_count', 'current_occupancy']]
        export_df.to_sql("crowd_telemetry", engine, if_exists="append", index=False, chunksize=10000)
        print("Database export successful!")
    except Exception as e:
        print(f"Database export skipped/failed: {e}")

if __name__ == "__main__":
    main()
