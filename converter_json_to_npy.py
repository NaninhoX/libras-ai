import json
import numpy as np
import sys

def json_to_npy(json_path, npy_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    # Converte de volta para array (num_amostras, 30, 21, 3)
    npy_list = []
    for item in data:
        seq = item["landmarks_sequence"]
        frames = []
        for frame in seq:
            points = [[p["x"], p["y"], p["z"]] for p in frame]
            frames.append(points)
        npy_list.append(np.array(frames, dtype=np.float32))
    np.save(npy_path, np.array(npy_list))
    print(f"Convertido {len(npy_list)} sinais para {npy_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python converter_json_to_npy.py entrada.json saida.npy")
    else:
        json_to_npy(sys.argv[1], sys.argv[2])
