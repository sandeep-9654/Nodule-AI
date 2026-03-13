# PulmoScan AI - Lung Nodule Detection System

A full-stack medical AI web application for Pulmonary Nodule Detection. This system uses advanced 3D Convolutional Neural Networks to analyze medical scans and detect potential lung nodules, providing an intuitive interface for medical analysis.

## 🌟 Features

- **Advanced AI Detection:** Specifically designed LightweightUNet3D architecture for precise 3D medical image analysis.
- **Efficient Backend:** Fast API powered by Flask and PyTorch for seamless model inference.
- **Modern Interface:** Responsive, dark medical-themed frontend built with Next.js, React, and Tailwind CSS.
- **Interactive Analysis:** Upload 3D patch data (.npy) and receive instant benign vs. malignant classifications with confidence scores.

## 🚀 Quick Start

For detailed setup instructions, please see the [Quick Start Guide](QUICKSTART.md).

### Prerequisites
- Python 3.8+
- Node.js 18+
- Trained model weight (`lung_nodule_net_best.pth`)

### Running the Application Locally
1. **Backend Server:** 
   Navigate to the project root, activate your virtual environment, and run the Flask API.
   ```bash
   python src/api/server.py
   ```
2. **Frontend Application:** 
   Navigate to the `lung-nodule-app` directory and start the Next.js development server.
   ```bash
   npm run dev
   ```

## 🧠 Architecture Overview
The core AI model utilizes a **LightweightUNet3D** architecture with Depthwise Separable 3D Convolutions, making it extremely efficient (~155K parameters, 85% smaller than a standard 3D U-Net) while maintaining high accuracy on binary classification tasks of 3D medical patches.

## 📊 Dataset
The model was trained using the LUNA-22 (ISMI) challenge dataset.

## 📁 Project Structure highlights
- `/src`: Backend API and Model definitions.
- `/lung-nodule-app`: Next.js frontend application.
- `/models`: Jupyter notebooks for Kaggle training.
- `/data`: Placeholder for dataset files and test samples.

---
*Developed as part of a Pulmonary Nodule Detection project.*
