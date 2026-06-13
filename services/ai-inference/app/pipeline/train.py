import pytorch_lightning as pl
from pytorch_lightning.callbacks import EarlyStopping
import mlflow
import os
from app.data.dataset import load_telemetry_data, preprocess_for_tft
from app.models.tft import create_tft_model
from app.core.config import settings

def train_tft_model(station_id: str = None):
    # Set up MLflow
    mlflow.set_tracking_uri(settings.MLFLOW_TRACKING_URI)
    mlflow.set_experiment("UrbanPulse_TFT_Forecasting")
    
    with mlflow.start_run():
        # Load Data
        df = load_telemetry_data(station_id=station_id, days=60)
        if df.empty:
            raise ValueError("No telemetry data found for training.")
        
        training = preprocess_for_tft(df)
        
        # Create DataLoaders
        train_dataloader = training.to_dataloader(train=True, batch_size=64, num_workers=0)
        # For simplicity, using same as train for val just as placeholder in skeleton
        val_dataloader = training.to_dataloader(train=False, batch_size=64, num_workers=0)
        
        # Model
        tft = create_tft_model(training)
        
        # Training
        early_stop_callback = EarlyStopping(monitor="val_loss", min_delta=1e-4, patience=5, verbose=False, mode="min")
        trainer = pl.Trainer(
            max_epochs=10,
            accelerator=settings.TORCH_DEVICE if settings.TORCH_DEVICE == "cpu" else "gpu",
            gradient_clip_val=0.1,
            callbacks=[early_stop_callback],
            logger=False, # We use MLflow directly if needed
        )
        
        mlflow.log_param("model_type", "TemporalFusionTransformer")
        mlflow.log_param("max_epochs", 10)
        mlflow.log_param("station_id", station_id if station_id else "ALL")
        
        trainer.fit(
            tft,
            train_dataloaders=train_dataloader,
            val_dataloaders=val_dataloader,
        )
        
        # Save model
        os.makedirs(settings.MODEL_DIR, exist_ok=True)
        model_path = os.path.join(settings.MODEL_DIR, f"tft_model_{station_id if station_id else 'all'}.ckpt")
        trainer.save_checkpoint(model_path)
        mlflow.log_artifact(model_path)
        
        return {"status": "success", "model_path": model_path}
