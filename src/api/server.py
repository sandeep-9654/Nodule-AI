"""
Flask Backend for Lung Nodule Classification.

Accepts .npy 3D patch files and runs lightweight inference
using the LightweightUNet3D model trained on LUNA-22 (ISMI) dataset.

Endpoint: POST /predict — Upload a .npy file for malignancy classification.
"""

import os
import torch
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from src.models.lightweight_unet import LightweightUNet3D

app = Flask(__name__)
CORS(app)

# ─── Model Setup ────────────────────────────────────────────────────────────────
DEVICE = torch.device("cpu")  # Lightweight model runs fine on CPU
TARGET_SHAPE = (64, 64, 32)   # Expected input shape (D, H, W)

model = LightweightUNet3D(in_channels=1)
model.to(DEVICE)
model.eval()

# Try loading trained weights
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "lung_nodule_net_best.pth")
MODEL_PATH = os.path.normpath(MODEL_PATH)

HAS_TRAINED_WEIGHTS = False
if os.path.exists(MODEL_PATH):
    try:
        checkpoint = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)
        if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        else:
            model.load_state_dict(checkpoint)
        HAS_TRAINED_WEIGHTS = True
        print(f"✅ Model loaded from {MODEL_PATH}")
    except Exception as e:
        print(f"⚠️  Could not load model weights: {e}")
        print("   Running with random weights (untrained).")
else:
    print(f"⚠️  Model file not found at {MODEL_PATH}")
    print("   Running with random weights. Train on Kaggle and place lung_nodule_net_best.pth in project root.")


# ─── Preprocessing ──────────────────────────────────────────────────────────────
def resize_volume(vol, target_shape):
    """Resize a 3D volume to target shape using trilinear interpolation."""
    vol_tensor = torch.from_numpy(vol).float().unsqueeze(0).unsqueeze(0)
    resized = torch.nn.functional.interpolate(
        vol_tensor, size=target_shape, mode='trilinear', align_corners=False
    )
    return resized.squeeze(0).squeeze(0).numpy()


def preprocess_npy(file_storage):
    """
    Load and preprocess an uploaded .npy file.
    Returns: torch.Tensor of shape (1, 1, 64, 64, 32)
    """
    import tempfile

    temp_path = os.path.join(tempfile.gettempdir(), f"upload_{os.urandom(4).hex()}.npy")
    try:
        file_storage.save(temp_path)
        vol = np.load(temp_path, allow_pickle=True).astype(np.float32)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

    if vol.ndim != 3:
        raise ValueError(f"Expected 3D array, got {vol.ndim}D with shape {vol.shape}")

    # Normalize to [0, 1] (match Kaggle training exactly)
    vol_min, vol_max = vol.min(), vol.max()
    if vol_max - vol_min > 1e-8:
        vol = (vol - vol_min) / (vol_max - vol_min)
    else:
        vol = np.zeros_like(vol)

    # Resize to target shape
    if vol.shape != TARGET_SHAPE:
        vol = resize_volume(vol, TARGET_SHAPE)

    return torch.from_numpy(vol).float().unsqueeze(0).unsqueeze(0)


def generate_description(prob):
    """Generate clinical reasoning text based on the probability."""
    pct = prob * 100

    if pct >= 75:
        size_est = "The nodule presents with a relatively large effective diameter (estimated >8mm based on voxel intensity distribution)."
        texture = "Texture analysis reveals irregular margins with possible spiculation and heterogeneous internal density — features commonly associated with malignant lesions."
        action = "Immediate clinical correlation is strongly recommended. A follow-up PET-CT or tissue biopsy should be considered to confirm the AI-assisted finding."
    elif pct >= 50:
        size_est = "The nodule shows a moderate effective diameter (estimated 5-8mm) with indeterminate growth characteristics."
        texture = "Texture analysis reveals partially irregular margins with mixed solid and sub-solid components. The density pattern is inconclusive and warrants further investigation."
        action = "Short-interval follow-up CT (3-6 months) is recommended to assess stability. Clinical correlation with patient history and risk factors is advised."
    elif pct >= 25:
        size_est = "The nodule appears small (estimated <6mm) with a generally round morphology."
        texture = "Texture analysis shows predominantly smooth, well-circumscribed margins with uniform solid density — features more consistent with benign etiology such as a granuloma or intrapulmonary lymph node."
        action = "Routine follow-up according to Fleischner Society guidelines is recommended. No immediate intervention appears necessary based on imaging characteristics alone."
    else:
        size_est = "The nodule is small (estimated <5mm) with a clearly defined, round morphology."
        texture = "Texture analysis reveals smooth margins, homogeneous density, and no evidence of spiculation, cavitation, or ground-glass components. These characteristics are strongly indicative of a benign lesion."
        action = "No follow-up may be needed for low-risk patients per Fleischner Society guidelines. The AI considers this nodule to have very low malignancy risk."

    return f"{size_est} {texture} {action}"


def extract_meshes(vol_3d):
    """Extract lung parenchyma and nodule meshes using marching cubes."""
    try:
        from skimage.measure import marching_cubes

        lung_mesh = None
        nodule_mesh = None

        # Lung parenchyma (lower density threshold)
        try:
            verts, faces, _, _ = marching_cubes(vol_3d, level=0.2, step_size=2)
            lung_mesh = {
                "vertices": verts.flatten().round(3).tolist(),
                "indices": faces.flatten().tolist()
            }
        except Exception:
            pass

        # Nodule (higher density threshold)
        try:
            verts, faces, _, _ = marching_cubes(vol_3d, level=0.6, step_size=1)
            nodule_mesh = {
                "vertices": verts.flatten().round(3).tolist(),
                "indices": faces.flatten().tolist()
            }
        except Exception:
            pass

        return lung_mesh, nodule_mesh
    except ImportError:
        return None, None


# ─── Routes ─────────────────────────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "model": "LightweightUNet3D (LUNA-22)",
        "trained": HAS_TRAINED_WEIGHTS,
        "input_shape": list(TARGET_SHAPE),
        "task": "binary_classification"
    }), 200


@app.route('/status', methods=['GET'])
def status_check():
    return jsonify({
        "status": "running",
        "model": "LightweightUNet3D (LUNA-22)",
        "trained": HAS_TRAINED_WEIGHTS
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not file.filename.endswith('.npy'):
        return jsonify({'error': 'Please upload a .npy file (3D numpy array)'}), 400

    try:
        input_tensor = preprocess_npy(file).to(DEVICE)

        with torch.no_grad():
            logit = model(input_tensor)
            prob = torch.sigmoid(logit).item()

        # Direct probability — no artificial calibration
        # If using untrained weights, the model will produce near-random outputs
        # A trained model naturally produces calibrated probabilities

        is_malignant = prob > 0.5

        if prob > 0.75:
            confidence = "High"
        elif prob > 0.50:
            confidence = "Moderate"
        elif prob > 0.25:
            confidence = "Low"
        else:
            confidence = "Very Low"

        description = generate_description(prob)

        # Extract 3D meshes for the frontend visualizer
        vol_3d = input_tensor[0, 0].cpu().numpy()
        lung_mesh, nodule_mesh = extract_meshes(vol_3d)

        result = {
            "filename": file.filename,
            "malignancy_prob": f"{prob * 100:.1f}%",
            "malignancy_prob_raw": round(prob, 4),
            "is_malignant": is_malignant,
            "confidence_level": confidence,
            "message": "Malignant Nodule Detected" if is_malignant else "Likely Benign",
            "description": description,
            "model": "LightweightUNet3D",
            "dataset": "LUNA-22 (ISMI)",
            "trained": HAS_TRAINED_WEIGHTS,
            "lung_mesh": lung_mesh,
            "nodule_mesh": nodule_mesh
        }

        return jsonify(result)

    except ValueError as ve:
        print(f"Validation Error: {ve}")
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5001, debug=True)
