# Логотип ×2 с чёткой кромкой: покрытие пикселя = альфа / альфа ткани рядом; покрытие и «ткань» увеличиваются отдельно,
# кромка покрытия подтягивается крутой кривой — край остаётся гладким и острым, внутренние переливы не трогаются.
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
def superres(src, box, k, out, lo=.36, hi=.64):
    im = np.array(Image.open(src).convert('RGBA')).astype(float)
    if box: im = im[box[1]:box[3], box[0]:box[2]]
    im = np.pad(im, ((6, 6), (6, 6), (0, 0)))
    A = im[..., 3] / 255
    rgb = im[..., :3]
    B = A > .02                                            # всё, где есть краска
    inside = nd.binary_erosion(B, np.ones((5, 5), bool))    # дальше 2 px от пустоты: здесь знак целиком
    idx = nd.distance_transform_edt(~inside, return_distances=False, return_indices=True)
    I = A[idx[0], idx[1]]                                  # плотность ткани, продолженная к кромке и наружу — без ореола
    C = np.where(inside, 1, np.clip(A / np.maximum(I, 1e-6), 0, 1))   # покрытие считается только у наружной кромки:
                                                           # граница тёмного и светлого крыла внутри знака краем не считается
    col = rgb[idx[0], idx[1]]
    up = lambda x: np.array(Image.fromarray(x.astype(np.float32), 'F').resize((x.shape[1] * k, x.shape[0] * k), Image.BICUBIC))
    Cu = np.clip((up(C) - lo) / (hi - lo), 0, 1); Cu = Cu * Cu * (3 - 2 * Cu)    # smoothstep: край в 1 px на новом размере
    Iu = np.clip(up(I), 0, 1)
    colu = np.stack([np.clip(up(col[..., i]), 0, 255) for i in range(3)], -1)
    a = (Cu * Iu * 255).round().astype(np.uint8)
    o = np.dstack([colu.round().astype(np.uint8), a])
    ys, xs = np.where(a > 0); o = o[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(o, 'RGBA').save(out)
    return o.shape
print(superres('/home/user/vector-site/brand/logo-dark.png', (0, 0, 236, 134), 2, 'mark2x.png'))
print(superres('/home/user/vector-site/brand/wordmark-dark.png', None, 2, 'wm2x.png'))
