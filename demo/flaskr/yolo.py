from flask import request, jsonify, Blueprint, Response, send_file
from PIL import Image
import os
import numpy as np
import cv2
import uuid
from flaskr.detection import Detection

bp = Blueprint('yolo', __name__)


UPLOAD_FOLDER = os.path.abspath('uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

detection = Detection()

@bp.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return 'Nenhuma parte do arquivo', 400

    file = request.files['image']
    if file.filename == '':
        return 'Nenhum arquivo selecionado', 400

    
    if file:
        # Gera nome único para o arquivo
        filename = f"{uuid.uuid4().hex}.jpg"
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        img = Image.open(file_path).convert("RGB")
        img = np.array(img)
        img = cv2.resize(img, (512, 512))

        detected_classes = detection.detect_from_image(img)

        os.remove(file_path)

        # Retornar apenas a primeira detecção, se houver
        if detected_classes:
            first_detection = detected_classes[0]
            return {"detected_class": first_detection}, 200
        else:
            return {"message": "Nenhum objeto detectado"}, 200

@bp.route('/upload_video', methods=['POST'])
def upload_video():
    if 'video' not in request.files:
        return jsonify({'error': 'Nenhum arquivo de vídeo foi enviado'}), 400

    video = request.files['video']
    if video.filename == '':
        return jsonify({'error': 'O nome do arquivo está vazio'}), 400

    # Salva o vídeo enviado
    video_path = os.path.join(UPLOAD_FOLDER, video.filename)
    video.save(video_path)

    # Processa o vídeo
    cap = cv2.VideoCapture(video_path)
    processed_frames = []
    detected_classes = []  # Armazena todas as classes detectadas

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Redimensiona e processa o frame
        frame = cv2.resize(frame, (512, 512))
        detections = detection.detect_from_image(frame)

        # Armazena as classes detectadas
        detected_classes.extend(detections)

        # Adiciona texto das detecções no frame (opcional)
        for detected_class in detections:
            cv2.putText(frame, detected_class, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Converte para JPEG para visualização (opcional)
        _, buffer = cv2.imencode('.jpg', frame)
        processed_frames.append(buffer.tobytes())

    cap.release()

    # Remove duplicatas das classes detectadas
    unique_classes = list(set(detected_classes))

    # Retorna um JSON com informações e classes detectadas
    return jsonify({
        'message': 'Vídeo processado com sucesso',
        'frames_processed': len(processed_frames),
        'detected_classes': unique_classes
    }), 200
