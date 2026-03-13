import torch
ckpt = torch.load('lung_nodule_net_best.pth', map_location='cpu')
print("Keys:", ckpt.keys())
if 'val_metrics' in ckpt:
    print("val_metrics:", ckpt['val_metrics'])
if 'dice_score' in ckpt:
    print("dice_score:", ckpt['dice_score'])
if 'best_f1' in ckpt:
    print("best_f1:", ckpt['best_f1'])
if 'epoch' in ckpt:
    print("epoch:", dict(ckpt).get('epoch'))
