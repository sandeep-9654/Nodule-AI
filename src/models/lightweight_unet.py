"""
LightweightUNet3D — Depthwise Separable 3D U-Net for Binary Classification.

Architecture MUST match the Kaggle training notebook exactly so that
lung_nodule_net_best.pth can be loaded without errors.

Input:  (B, 1, 64, 64, 32)
Output: (B, 1) — malignancy logit
~155K parameters (~0.6 MB)
"""

import torch
import torch.nn as nn
import torch.nn.functional as F


class DepthwiseSeparableConv3d(nn.Module):
    """Depthwise separable 3D convolution: depthwise + pointwise."""
    def __init__(self, in_channels, out_channels, kernel_size=3, stride=1, padding=1):
        super().__init__()
        self.depthwise = nn.Conv3d(in_channels, in_channels, kernel_size=kernel_size,
                                   stride=stride, padding=padding, groups=in_channels, bias=False)
        self.pointwise = nn.Conv3d(in_channels, out_channels, kernel_size=1, bias=False)
        self.bn = nn.BatchNorm3d(out_channels)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.pointwise(self.depthwise(x))))


class EncoderBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv1 = DepthwiseSeparableConv3d(in_ch, out_ch)
        self.conv2 = DepthwiseSeparableConv3d(out_ch, out_ch)
        self.pool = nn.MaxPool3d(kernel_size=2, stride=2)

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        return x, self.pool(x)


class DecoderBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.up = nn.ConvTranspose3d(in_ch, out_ch, kernel_size=2, stride=2)
        self.conv1 = DepthwiseSeparableConv3d(out_ch * 2, out_ch)
        self.conv2 = DepthwiseSeparableConv3d(out_ch, out_ch)

    def forward(self, x, skip):
        x = self.up(x)
        if x.shape != skip.shape:
            x = F.interpolate(x, size=skip.shape[2:], mode='trilinear', align_corners=False)
        x = torch.cat([skip, x], dim=1)
        x = self.conv1(x)
        return self.conv2(x)


class LightweightUNet3D(nn.Module):
    def __init__(self, in_channels=1, features=None):
        super().__init__()
        if features is None:
            features = [16, 32, 64]

        self.enc1 = EncoderBlock(in_channels, features[0])
        self.enc2 = EncoderBlock(features[0], features[1])
        self.enc3 = EncoderBlock(features[1], features[2])

        self.bottleneck = nn.Sequential(
            DepthwiseSeparableConv3d(features[2], features[2] * 2),
            DepthwiseSeparableConv3d(features[2] * 2, features[2] * 2),
        )

        self.dec3 = DecoderBlock(features[2] * 2, features[2])
        self.dec2 = DecoderBlock(features[2], features[1])
        self.dec1 = DecoderBlock(features[1], features[0])

        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool3d(1),
            nn.Flatten(),
            nn.Dropout(0.3),
            nn.Linear(features[0], 1),
        )

        self._initialize_weights()

    def _initialize_weights(self):
        for m in self.modules():
            if isinstance(m, (nn.Conv3d, nn.ConvTranspose3d)):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
            elif isinstance(m, nn.BatchNorm3d):
                nn.init.ones_(m.weight)
                nn.init.zeros_(m.bias)
            elif isinstance(m, nn.Linear):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
        # Bias trick for class imbalance
        nn.init.constant_(self.classifier[-1].bias, -5.0)

    def forward(self, x):
        skip1, x = self.enc1(x)
        skip2, x = self.enc2(x)
        skip3, x = self.enc3(x)
        x = self.bottleneck(x)
        x = self.dec3(x, skip3)
        x = self.dec2(x, skip2)
        x = self.dec1(x, skip1)
        return self.classifier(x)


if __name__ == "__main__":
    model = LightweightUNet3D(in_channels=1)
    x = torch.randn(1, 1, 64, 64, 32)
    out = model(x)
    params = sum(p.numel() for p in model.parameters())
    print(f"Input:  {x.shape}")
    print(f"Output: {out.shape}")
    print(f"Params: {params:,}")
    print(f"Size:   ~{params * 4 / (1024*1024):.2f} MB")
