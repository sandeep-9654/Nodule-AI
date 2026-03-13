# Quick Start Guide

Get the Lung Nodule Detection application running in minutes!

## 🚀 Fast Setup

### 1. Prerequisites
- **Python 3.8+**
- **Node.js 18+**
- **Trained model** (`lung_nodule_net_best.pth` — trained on Kaggle)

### 2. Train the Model (Kaggle Cloud)

The model is trained on Kaggle using the LUNA-22 (ISMI) 3D patch dataset:

1. Upload `models/lungapp.ipynb` to [Kaggle](https://www.kaggle.com/).
2. Attach the **LUNA 22 prequel** dataset from ISMI challenges.
3. Enable **GPU accelerator** (P100 or T4).
4. Run all cells — training takes ~30-60 minutes.
5. Download `lung_nodule_net_best.pth` from the notebook output.
6. Place it in the project root directory.

### 3. Backend Setup (Flask API)

The backend handles lightweight CPU inference.

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements_backend.txt

# Run the API Server
export PYTHONPATH=.
python src/api/server.py
```
*Server runs at http://localhost:5000*

### 4. Frontend Setup (Next.js Application)

The modern web interface for the application.

```bash
cd lung-nodule-app

# Install dependencies
npm install

# Run the development server
npm run dev
```
*App runs at http://localhost:3000*

---

## 🧠 Model Architecture

- **LightweightUNet3D** with Depthwise Separable 3D Convolutions
- **Parameters:** ~155K (~0.6 MB) — 85% smaller than standard 3D U-Net
- **Input:** `.npy` 3D patches (resized to 64×64×32)
- **Output:** Binary classification (Benign vs Malignant)
- **Dataset:** LUNA-22 (ISMI) — 1,176 pre-extracted nodule patches

---

## 📁 Project Structure

- `src/api/server.py`: Flask backend — accepts `.npy` uploads, runs inference.
- `src/models/lightweight_unet.py`: LightweightUNet3D architecture.
- `models/lungapp.ipynb`: Kaggle training notebook.
- `lung-nodule-app/`: Next.js frontend source code.
- `data/Dataset/`: LUNA-22 (ISMI) dataset (`.nii.gz` patches + metadata).

---

## ❓ Troubleshooting

**ModuleNotFoundError: No module named 'src'?**
Ensure you run python with `PYTHONPATH=.`:
```bash
export PYTHONPATH=.
python src/api/server.py
```

**Model not found warning?**
Train the model on Kaggle first using `models/lungapp.ipynb`, then download and place `lung_nodule_net_best.pth` in the project root.
