import pandas as pd
import os
import numpy as np

class TNEBDataLoader:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(TNEBDataLoader, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        self.profiles = {}
        # Path to dataset (assumes backend is run from /backend)
        dataset_path = os.path.join(os.path.dirname(__file__), '..', '..', 'documents', 'TN_ECBoard.csv')
        
        if not os.path.exists(dataset_path):
            print(f"WARNING: Dataset not found at {dataset_path}. Using fallback math models.")
            self.has_data = False
            return
            
        print("Loading TNEB Dataset for Data-Driven Simulation...")
        try:
            df = pd.read_csv(dataset_path)
            
            # Categories we care about mapping to our models
            categories = {
                "ResidentialLoad": "Residential(individual)",
                "IndustrialLoad": "TextileIndustry",
                "AgriculturalLoad": "Farmers1",
                "Hospital": "Hospital"
            }
            
            for model_type, csv_type in categories.items():
                # Filter by type
                subset = df[df['Type'] == csv_type].copy()
                
                # The data is sequential hourly readings. We want an average 24-hour profile.
                # We will assign an 'Hour' column by taking index modulo 24.
                # Note: This assumes the sequence starts at midnight (Hour 0).
                subset['Hour'] = np.arange(len(subset)) % 24
                
                # Group by hour and calculate the mean of ForkW (Real Power in kW)
                hourly_mean = subset.groupby('Hour')['ForkW'].mean().to_dict()
                
                # The dataset values seem small (e.g. 0.8 kW). We'll scale them up 
                # so they fit the visual scale of a neighborhood/city in our UI.
                # Residential: scale to ~2-3 kW peak
                # Industrial: scale to ~200 kW peak
                # Agricultural: scale to ~15 kW peak
                # Hospital: scale to ~50 kW peak
                
                max_val = max(hourly_mean.values()) if hourly_mean else 1.0
                
                scales = {
                    "ResidentialLoad": 3.0 / max_val,
                    "IndustrialLoad": 200.0 / max_val,
                    "AgriculturalLoad": 15.0 / max_val,
                    "Hospital": 50.0 / max_val
                }
                scale = scales.get(model_type, 1.0)
                
                self.profiles[model_type] = {hour: val * scale for hour, val in hourly_mean.items()}
                
            self.has_data = True
            print("TNEB Dataset successfully loaded and processed into 24-hour profiles.")
            
        except Exception as e:
            print(f"Failed to load dataset: {e}")
            self.has_data = False

    def get_load(self, model_type: str, time_of_day_hours: float) -> float:
        """Get the power consumption (kW) for a specific model type at a specific time."""
        if not self.has_data or model_type not in self.profiles:
            return None # Signal to use fallback math
            
        # Convert float time to nearest hour index (0-23)
        hour = int(time_of_day_hours) % 24
        
        # Simple linear interpolation for minute-level resolution
        next_hour = (hour + 1) % 24
        fraction = time_of_day_hours - int(time_of_day_hours)
        
        current_val = self.profiles[model_type].get(hour, 0.0)
        next_val = self.profiles[model_type].get(next_hour, 0.0)
        
        interpolated = current_val + fraction * (next_val - current_val)
        return interpolated

# Global singleton instance
data_loader = TNEBDataLoader()
