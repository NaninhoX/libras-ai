import numpy as np
import json
import sys

# Uso: python converter_npy_to_json.py dados.npy saida.json
def npy_to_json(npy_path, json_path):
    data = np.load(npy_path, allow_pickle=True)
    # Espera-se que data seja uma lista de dicionários com campos: "sign", "landmarks_sequence"
    # Se for array de landmarks puro, adapte
    if isinstance(data, np.ndarray) and data.dtype == np.float32:
        # Formato antigo: array (num_amostras, 30, 21, 3)
        print("Formato numpy antigo detectado (amostras, frames, pontos, 3). Convertendo...")
        output = []
        for i, sample in enumerate(data):
            seq = []
            for frame in sample:
                points = [{"x": float(p[0]), "y": float(p[1]), "z": float(p[2])} for p in frame]
                seq.append(points)
            output.append({
                "sign": f"SINAL_{i}",
                "timestamp": "2025-01-01T00:00:00Z",
                "landmarks_sequence": seq
            })
        data = output
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Convertido {len(data)} sinais para {json_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Uso: python converter_npy_to_json.py entrada.npy saida.json")
    else:
        npy_to_json(sys.argv[1], sys.argv[2])